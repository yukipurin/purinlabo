import { describe, expect, it } from 'vitest';
import {
  charsPerSecond, checkCues, formatTimestamp, JA_RULES, parseSubtitle,
  parseTimestamp, scaleCues, shiftCues, summarize, toPlainText, toSrt, toVtt,
} from './subtitle';

const SRT = `1
00:00:01,000 --> 00:00:03,500
こんにちは
今日はいい天気です

2
00:00:04,000 --> 00:00:06,000
またあした
`;

const VTT = `WEBVTT

1
00:00:01.000 --> 00:00:03.500 line:90%
こんにちは

2
00:00:04.000 --> 00:00:06.000
またあした
`;

describe('parseTimestamp', () => {
  it('SRTのカンマ区切りを読む', () => expect(parseTimestamp('00:00:01,500')).toBe(1500));
  it('VTTのピリオド区切りを読む', () => expect(parseTimestamp('00:00:01.500')).toBe(1500));
  it('時間まで足し合わせる', () => expect(parseTimestamp('01:02:03,004')).toBe(3_723_004));
  it('時が省略された形も読む', () => expect(parseTimestamp('02:03.500')).toBe(123_500));
  it('ミリ秒が3桁未満なら右を0で埋める', () => expect(parseTimestamp('00:00:01,5')).toBe(1500));
  it('読めない書き方は例外', () => {
    expect(() => parseTimestamp('あいうえお')).toThrow();
    expect(() => parseTimestamp('00:00:01')).toThrow();
  });
});

describe('formatTimestamp', () => {
  it('SRTはカンマ', () => expect(formatTimestamp(3_723_004, 'srt')).toBe('01:02:03,004'));
  it('VTTはピリオド', () => expect(formatTimestamp(3_723_004, 'vtt')).toBe('01:02:03.004'));
  it('負の値は0にする', () => expect(formatTimestamp(-500)).toBe('00:00:00,000'));
  it('読んで書いても値が変わらない', () => {
    const t = '00:12:34,567';
    expect(formatTimestamp(parseTimestamp(t))).toBe(t);
  });
});

describe('parseSubtitle', () => {
  it('SRTを読む', () => {
    const cues = parseSubtitle(SRT);
    expect(cues).toHaveLength(2);
    expect(cues[0].startMs).toBe(1000);
    expect(cues[0].endMs).toBe(3500);
    expect(cues[0].lines).toEqual(['こんにちは', '今日はいい天気です']);
  });

  it('VTTも同じ形で読む', () => {
    const cues = parseSubtitle(VTT);
    expect(cues).toHaveLength(2);
    expect(cues[0].lines).toEqual(['こんにちは']);
  });

  it('VTTの位置指定（line:90%）を時刻と間違えない', () => {
    expect(parseSubtitle(VTT)[0].endMs).toBe(3500);
  });

  it('WindowsのCRLFでも読める', () => {
    expect(parseSubtitle(SRT.replace(/\n/g, '\r\n'))).toHaveLength(2);
  });

  it('先頭のBOMを無視する', () => {
    expect(parseSubtitle('﻿' + SRT)).toHaveLength(2);
  });

  it('時刻の無い塊は飛ばす', () => {
    expect(parseSubtitle('メモ書き\n\n' + SRT)).toHaveLength(2);
  });

  it('番号が無くても読める', () => {
    const noNumber = '00:00:01,000 --> 00:00:02,000\nテスト';
    expect(parseSubtitle(noNumber)[0].lines).toEqual(['テスト']);
  });
});

describe('書き出し', () => {
  it('SRTとして書き出せる', () => {
    const out = toSrt(parseSubtitle(SRT));
    expect(out).toContain('00:00:01,000 --> 00:00:03,500');
    expect(out.startsWith('1\n')).toBe(true);
  });

  it('VTTはWEBVTTで始まる', () => {
    expect(toVtt(parseSubtitle(SRT)).startsWith('WEBVTT')).toBe(true);
  });

  it('番号は1から振り直す', () => {
    const cues = parseSubtitle(SRT).map((c) => ({ ...c, index: 99 }));
    expect(toSrt(cues).startsWith('1\n')).toBe(true);
  });

  it('SRT→VTT→SRT で時刻と本文が変わらない', () => {
    const once = parseSubtitle(SRT);
    const round = parseSubtitle(toSrt(parseSubtitle(toVtt(once))));
    expect(round.map((c) => [c.startMs, c.endMs, c.lines]))
      .toEqual(once.map((c) => [c.startMs, c.endMs, c.lines]));
  });

  it('本文だけ取り出せる', () => {
    expect(toPlainText(parseSubtitle(SRT))).toBe('こんにちは 今日はいい天気です\nまたあした\n');
  });
});

describe('shiftCues / scaleCues', () => {
  it('まとめて後ろにずらす', () => {
    expect(shiftCues(parseSubtitle(SRT), 500)[0].startMs).toBe(1500);
  });
  it('前にずらしても0より前に行かない', () => {
    expect(shiftCues(parseSubtitle(SRT), -5000)[0].startMs).toBe(0);
  });
  it('倍率でのばす', () => {
    expect(scaleCues(parseSubtitle(SRT), 2)[0].startMs).toBe(500);
  });
  it('0以下の倍率は例外', () => {
    expect(() => scaleCues(parseSubtitle(SRT), 0)).toThrow();
  });
});

describe('checkCues', () => {
  const cue = (startMs: number, endMs: number, lines: string[]) =>
    [{ index: 1, startMs, endMs, lines }];

  it('問題が無ければ何も出ない', () => {
    expect(checkCues(cue(0, 3000, ['短い一行']))).toHaveLength(0);
  });

  it('1行が長すぎるのを見つける', () => {
    const long = 'あ'.repeat(25);
    const issues = checkCues(cue(0, 5000, [long]));
    expect(issues.some((i) => i.kind === 'lineTooLong')).toBe(true);
  });

  it('行数が多すぎるのを見つける', () => {
    const issues = checkCues(cue(0, 5000, ['あ', 'い', 'う']));
    expect(issues.some((i) => i.kind === 'tooManyLines')).toBe(true);
  });

  it('表示が短すぎるのを見つける', () => {
    expect(checkCues(cue(0, 500, ['あ'])).some((i) => i.kind === 'tooShort')).toBe(true);
  });

  it('表示が長すぎるのを見つける', () => {
    expect(checkCues(cue(0, 9000, ['あ'])).some((i) => i.kind === 'tooLong')).toBe(true);
  });

  it('速すぎて読めないのを見つける', () => {
    // 1秒に20文字は読めない
    const issues = checkCues(cue(0, 1000, ['あ'.repeat(20)]));
    expect(issues.some((i) => i.kind === 'tooFast')).toBe(true);
  });

  it('前の字幕と重なっているのを見つける', () => {
    const cues = [
      { index: 1, startMs: 0, endMs: 3000, lines: ['あ'] },
      { index: 2, startMs: 2000, endMs: 5000, lines: ['い'] },
    ];
    expect(checkCues(cues).some((i) => i.kind === 'overlap')).toBe(true);
  });

  it('終了が開始より前なのを見つける', () => {
    expect(checkCues(cue(3000, 1000, ['あ'])).some((i) => i.kind === 'reversed')).toBe(true);
  });

  it('時間が壊れている場合は、それ以上の判定をしない', () => {
    const issues = checkCues(cue(3000, 1000, ['あ'.repeat(50)]));
    expect(issues).toHaveLength(1);
    expect(issues[0].kind).toBe('reversed');
  });

  it('本文が空なのを見つける', () => {
    expect(checkCues(cue(0, 3000, [])).some((i) => i.kind === 'empty')).toBe(true);
  });

  it('目安は差し替えられる', () => {
    const strict = { ...JA_RULES, maxCharsPerLine: 5 };
    expect(checkCues(cue(0, 3000, ['あいうえおか']), strict)
      .some((i) => i.kind === 'lineTooLong')).toBe(true);
  });
});

describe('charsPerSecond / summarize', () => {
  it('1秒あたりの文字数を出す', () => {
    expect(charsPerSecond({ index: 1, startMs: 0, endMs: 2000, lines: ['あいうえおかきく'] })).toBe(4);
  });
  it('時間が0以下なら無限', () => {
    expect(charsPerSecond({ index: 1, startMs: 0, endMs: 0, lines: ['あ'] })).toBe(Infinity);
  });
  it('全体を要約する', () => {
    const s = summarize(parseSubtitle(SRT));
    expect(s.count).toBe(2);
    expect(s.chars).toBe('こんにちは今日はいい天気ですまたあした'.length);
    expect(s.durationMs).toBe(6000);
  });
});
