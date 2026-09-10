/**
 * 字幕ファイル（SRT / WebVTT）の読み書きと検査。
 * DOMに依存しない純粋関数だけを置く。
 */

export type Cue = {
  /** 通し番号。読み込み時は元の番号、書き出し時は振り直す */
  index: number;
  /** 開始（ミリ秒） */
  startMs: number;
  /** 終了（ミリ秒） */
  endMs: number;
  /** 本文。改行で分けた行 */
  lines: string[];
};

/** `00:01:02,345` / `00:01:02.345` / `01:02.345` を読む */
export function parseTimestamp(text: string): number {
  const m = text.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{1,2})[,.](\d{1,3})$/);
  if (!m) throw new Error(`時刻の書き方が読めません: ${text}`);
  const [, h, mm, ss, ms] = m;
  return (Number(h ?? 0) * 3600 + Number(mm) * 60 + Number(ss)) * 1000
    + Number(ms.padEnd(3, '0'));
}

/** ミリ秒を書き出す。SRTはカンマ、VTTはピリオド */
export function formatTimestamp(ms: number, style: 'srt' | 'vtt' = 'srt'): string {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3_600_000);
  const m = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  const milli = clamped % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  const sep = style === 'srt' ? ',' : '.';
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(milli, 3)}`;
}

const TIME_LINE = /-->/;

/** SRT と WebVTT のどちらでも読む。書き方の細かい違いは吸収する */
export function parseSubtitle(text: string): Cue[] {
  const body = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const blocks = body.split(/\n{2,}/);
  const cues: Cue[] = [];

  for (const raw of blocks) {
    const lines = raw.split('\n').filter((l, i) => !(i === 0 && /^WEBVTT/i.test(l)));
    const timeIdx = lines.findIndex((l) => TIME_LINE.test(l));
    if (timeIdx === -1) continue;

    const [startText, restText] = lines[timeIdx].split('-->');
    if (startText === undefined || restText === undefined) continue;
    // VTTは時刻のあとに位置の指定が続くことがある。最初の塊だけ見る
    const endText = restText.trim().split(/\s+/)[0];

    let startMs: number, endMs: number;
    try {
      startMs = parseTimestamp(startText);
      endMs = parseTimestamp(endText);
    } catch {
      continue;   // 読めない時刻の塊は飛ばす
    }

    const numberLine = lines.slice(0, timeIdx).find((l) => /^\d+$/.test(l.trim()));
    const textLines = lines.slice(timeIdx + 1).map((l) => l.trimEnd()).filter((l) => l !== '');
    cues.push({
      index: numberLine ? Number(numberLine.trim()) : cues.length + 1,
      startMs, endMs, lines: textLines,
    });
  }
  return cues;
}

/** SRTとして書き出す。番号は1から振り直す */
export function toSrt(cues: Cue[]): string {
  return cues.map((c, i) =>
    `${i + 1}\n${formatTimestamp(c.startMs, 'srt')} --> ${formatTimestamp(c.endMs, 'srt')}\n${c.lines.join('\n')}`
  ).join('\n\n') + '\n';
}

/** WebVTTとして書き出す */
export function toVtt(cues: Cue[]): string {
  const body = cues.map((c, i) =>
    `${i + 1}\n${formatTimestamp(c.startMs, 'vtt')} --> ${formatTimestamp(c.endMs, 'vtt')}\n${c.lines.join('\n')}`
  ).join('\n\n');
  return `WEBVTT\n\n${body}\n`;
}

/** 本文だけを取り出す */
export function toPlainText(cues: Cue[], joinLines = true): string {
  return cues.map((c) => (joinLines ? c.lines.join(' ') : c.lines.join('\n'))).join('\n') + '\n';
}

/** 全体の時刻をずらす。0より前には行かない */
export function shiftCues(cues: Cue[], deltaMs: number): Cue[] {
  return cues.map((c) => ({
    ...c,
    startMs: Math.max(0, c.startMs + deltaMs),
    endMs: Math.max(0, c.endMs + deltaMs),
  }));
}

/** 再生速度を変えた動画に合わせて、時刻を倍率でのばす／縮める */
export function scaleCues(cues: Cue[], rate: number): Cue[] {
  if (rate <= 0) throw new Error('倍率は0より大きい必要があります');
  return cues.map((c) => ({
    ...c,
    startMs: Math.round(c.startMs / rate),
    endMs: Math.round(c.endMs / rate),
  }));
}

// ---------------------------------------------------------------- 検査

export type CheckRules = {
  /** 1行の最大文字数 */
  maxCharsPerLine: number;
  /** 最大の行数 */
  maxLines: number;
  /** 表示時間の下限（ミリ秒） */
  minDurationMs: number;
  /** 表示時間の上限（ミリ秒） */
  maxDurationMs: number;
  /** 1秒あたりに読める文字数 */
  maxCharsPerSecond: number;
};

/** 日本語字幕の目安。放送や配信でよく使われる範囲に合わせている */
export const JA_RULES: CheckRules = {
  maxCharsPerLine: 20,
  maxLines: 2,
  minDurationMs: 1000,
  maxDurationMs: 7000,
  maxCharsPerSecond: 8,
};

export type IssueKind =
  | 'lineTooLong' | 'tooManyLines' | 'tooShort' | 'tooLong'
  | 'tooFast' | 'overlap' | 'reversed' | 'empty';

export type Issue = { cueIndex: number; kind: IssueKind; detail: string };

/** 表示時間に対する文字数。1秒あたり何文字か */
export function charsPerSecond(cue: Cue): number {
  const seconds = (cue.endMs - cue.startMs) / 1000;
  if (seconds <= 0) return Infinity;
  return cue.lines.join('').length / seconds;
}

/** 読みにくい箇所を洗い出す */
export function checkCues(cues: Cue[], rules: CheckRules = JA_RULES): Issue[] {
  const issues: Issue[] = [];
  cues.forEach((c, i) => {
    const at = i + 1;
    const chars = c.lines.join('').length;

    if (chars === 0) issues.push({ cueIndex: at, kind: 'empty', detail: '本文がありません' });
    if (c.endMs <= c.startMs) {
      issues.push({ cueIndex: at, kind: 'reversed', detail: '終了が開始より前か同じです' });
      return;                     // 時間が壊れていると以降の判定に意味がない
    }

    for (const line of c.lines) {
      if (line.length > rules.maxCharsPerLine) {
        issues.push({ cueIndex: at, kind: 'lineTooLong',
          detail: `1行が${line.length}文字（目安は${rules.maxCharsPerLine}文字まで）` });
      }
    }
    if (c.lines.length > rules.maxLines) {
      issues.push({ cueIndex: at, kind: 'tooManyLines',
        detail: `${c.lines.length}行（目安は${rules.maxLines}行まで）` });
    }

    const dur = c.endMs - c.startMs;
    if (dur < rules.minDurationMs) {
      issues.push({ cueIndex: at, kind: 'tooShort',
        detail: `表示が${(dur / 1000).toFixed(1)}秒（目安は${rules.minDurationMs / 1000}秒以上）` });
    }
    if (dur > rules.maxDurationMs) {
      issues.push({ cueIndex: at, kind: 'tooLong',
        detail: `表示が${(dur / 1000).toFixed(1)}秒（目安は${rules.maxDurationMs / 1000}秒まで）` });
    }

    const cps = charsPerSecond(c);
    if (cps > rules.maxCharsPerSecond) {
      issues.push({ cueIndex: at, kind: 'tooFast',
        detail: `1秒あたり${cps.toFixed(1)}文字（目安は${rules.maxCharsPerSecond}文字まで）` });
    }

    const prev = cues[i - 1];
    if (prev && c.startMs < prev.endMs) {
      issues.push({ cueIndex: at, kind: 'overlap',
        detail: `ひとつ前と${((prev.endMs - c.startMs) / 1000).toFixed(1)}秒 重なっています` });
    }
  });
  return issues;
}

/** 字幕全体の要約 */
export function summarize(cues: Cue[]) {
  const chars = cues.reduce((n, c) => n + c.lines.join('').length, 0);
  const last = cues.reduce((n, c) => Math.max(n, c.endMs), 0);
  return { count: cues.length, chars, durationMs: last };
}
