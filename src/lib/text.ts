/** 文字を扱うツールの計算。DOMに依存しない純粋関数だけを置く。 */

export type Counts = {
  chars: number;          // 改行を除いた文字数
  charsWithNewline: number;
  charsNoSpace: number;   // 空白も除いた文字数
  lines: number;
  paragraphs: number;     // 空行で区切った塊
  bytesUtf8: number;
  widthUnits: number;     // 全角1・半角0.5で数えた見た目の幅
};

const FULLWIDTH = /[^\x00-\xFF｡-ﾟ]/;   // 半角カナは半角として扱う

/** 見た目の幅。全角を1、半角を0.5として数える */
export function displayWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += FULLWIDTH.test(ch) ? 1 : 0.5;
  return w;
}

export function countText(text: string): Counts {
  const normalized = text.replace(/\r\n?/g, '\n');
  const noNewline = normalized.replace(/\n/g, '');
  return {
    chars: noNewline.length,
    charsWithNewline: normalized.length,
    charsNoSpace: noNewline.replace(/[\s　]/g, '').length,
    lines: normalized === '' ? 0 : normalized.split('\n').length,
    paragraphs: normalized.split(/\n{2,}/).filter((p) => p.trim() !== '').length,
    bytesUtf8: new TextEncoder().encode(normalized).length,
    widthUnits: displayWidth(noNewline),
  };
}

/** 投稿先ごとの上限。数え方が場所によって違うので、どう数えるかも持つ */
export type Limit = {
  name: string;
  max: number;
  /** chars = 文字数、width = 全角1半角0.5 */
  unit: 'chars' | 'width';
  note?: string;
};

export const LIMITS: Limit[] = [
  { name: 'X（旧Twitter）', max: 140, unit: 'chars', note: '日本語は140字。URLは11.5字ぶんで数えられます' },
  { name: 'Instagram のキャプション', max: 2200, unit: 'chars' },
  { name: 'YouTube のタイトル', max: 100, unit: 'chars' },
  { name: 'YouTube の説明欄', max: 5000, unit: 'chars' },
  { name: 'メルカリ の商品説明', max: 1000, unit: 'chars' },
  { name: 'メルカリ の商品名', max: 40, unit: 'chars' },
  { name: 'meta description', max: 120, unit: 'chars', note: '検索結果に出る長さの目安です' },
  { name: 'ページタイトル', max: 32, unit: 'chars', note: '検索結果で切られない長さの目安です' },
];

export type LimitResult = { limit: Limit; used: number; over: number; fits: boolean };

export function checkLimits(text: string, limits: Limit[] = LIMITS): LimitResult[] {
  const c = countText(text);
  return limits.map((limit) => {
    const used = limit.unit === 'width' ? c.widthUnits : c.chars;
    return { limit, used, over: Math.max(0, used - limit.max), fits: used <= limit.max };
  });
}

// ---------------------------------------------------------------- 変換

const toHalf = (s: string) => s.replace(/[！-～]/g, (c) =>
  String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/　/g, ' ');
const toFull = (s: string) => s.replace(/[!-~]/g, (c) =>
  String.fromCharCode(c.charCodeAt(0) + 0xfee0)).replace(/ /g, '　');

export type ConvertKind =
  | 'toHalf' | 'toFull' | 'toHalfAlnum' | 'toFullAlnum'
  | 'upper' | 'lower' | 'hiragana' | 'katakana' | 'trim';

export function convertText(text: string, kind: ConvertKind): string {
  switch (kind) {
    case 'toHalf': return toHalf(text);
    case 'toFull': return toFull(text);
    case 'toHalfAlnum':
      return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    case 'toFullAlnum':
      return text.replace(/[A-Za-z0-9]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0));
    case 'upper': return text.toUpperCase();
    case 'lower': return text.toLowerCase();
    case 'hiragana':
      return text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
    case 'katakana':
      return text.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
    case 'trim':
      return text.split('\n').map((l) => l.replace(/^[\s　]+|[\s　]+$/g, '')).join('\n');
  }
}

// ---------------------------------------------------------------- 行の整理

export type LineOptions = {
  dedupe?: boolean;
  removeEmpty?: boolean;
  trim?: boolean;
  sort?: 'none' | 'asc' | 'desc';
  numbering?: boolean;
  prefix?: string;
  suffix?: string;
};

export function processLines(text: string, o: LineOptions): string {
  let lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (o.trim) lines = lines.map((l) => l.replace(/^[\s　]+|[\s　]+$/g, ''));
  if (o.removeEmpty) lines = lines.filter((l) => l !== '');
  if (o.dedupe) {
    const seen = new Set<string>();
    lines = lines.filter((l) => (seen.has(l) ? false : (seen.add(l), true)));
  }
  if (o.sort === 'asc') lines = [...lines].sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }));
  if (o.sort === 'desc') lines = [...lines].sort((a, b) => b.localeCompare(a, 'ja', { numeric: true }));
  if (o.prefix || o.suffix) lines = lines.map((l) => `${o.prefix ?? ''}${l}${o.suffix ?? ''}`);
  if (o.numbering) {
    const w = String(lines.length).length;
    lines = lines.map((l, i) => `${String(i + 1).padStart(w, '0')}. ${l}`);
  }
  return lines.join('\n');
}

/** 行数の変化を伝えるため */
export function countLines(text: string): number {
  return text === '' ? 0 : text.replace(/\r\n?/g, '\n').split('\n').length;
}

// ---------------------------------------------------------------- 改行コード

export type Newline = 'lf' | 'crlf' | 'cr';

export function detectNewline(text: string): { crlf: number; lf: number; cr: number; mixed: boolean } {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  const lf = (text.match(/(?<!\r)\n/g) ?? []).length;
  const cr = (text.match(/\r(?!\n)/g) ?? []).length;
  return { crlf, lf, cr, mixed: [crlf, lf, cr].filter((n) => n > 0).length > 1 };
}

export function convertNewline(text: string, to: Newline): string {
  const lf = text.replace(/\r\n?/g, '\n');
  return to === 'lf' ? lf : to === 'crlf' ? lf.replace(/\n/g, '\r\n') : lf.replace(/\n/g, '\r');
}
