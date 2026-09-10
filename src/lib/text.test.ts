import { describe, expect, it } from 'vitest';
import {
  checkLimits, convertNewline, convertText, countLines, countText,
  detectNewline, displayWidth, processLines,
} from './text';

describe('countText', () => {
  it('改行を除いて数える', () => {
    const c = countText('あい\nうえ');
    expect(c.chars).toBe(4);
    expect(c.charsWithNewline).toBe(5);
    expect(c.lines).toBe(2);
  });
  it('空白を除いた数も出す', () => {
    expect(countText('あ い　う').charsNoSpace).toBe(3);
  });
  it('空行で段落を分ける', () => {
    expect(countText('あ\n\nい\n\n\nう').paragraphs).toBe(3);
  });
  it('CRLFでも行数が同じ', () => {
    expect(countText('あ\r\nい').lines).toBe(2);
  });
  it('空文字は0行', () => expect(countText('').lines).toBe(0));
  it('UTF-8のバイト数を出す', () => {
    expect(countText('あ').bytesUtf8).toBe(3);
    expect(countText('a').bytesUtf8).toBe(1);
  });
});

describe('displayWidth', () => {
  it('全角は1、半角は0.5', () => {
    expect(displayWidth('あい')).toBe(2);
    expect(displayWidth('ab')).toBe(1);
    expect(displayWidth('あa')).toBe(1.5);
  });
  it('半角カナは半角として数える', () => {
    expect(displayWidth('ｱｲ')).toBe(1);
  });
});

describe('checkLimits', () => {
  it('収まっていれば fits が true', () => {
    const r = checkLimits('あ'.repeat(50));
    const x = r.find((v) => v.limit.name.startsWith('X'))!;
    expect(x.fits).toBe(true);
    expect(x.over).toBe(0);
  });
  it('超えた分を出す', () => {
    const r = checkLimits('あ'.repeat(150));
    const x = r.find((v) => v.limit.name.startsWith('X'))!;
    expect(x.fits).toBe(false);
    expect(x.over).toBe(10);
  });
  it('すべての投稿先を返す', () => {
    expect(checkLimits('あ').length).toBeGreaterThanOrEqual(8);
  });
});

describe('convertText', () => {
  it('全角を半角にする', () => expect(convertText('ＡＢＣ１２３！', 'toHalf')).toBe('ABC123!'));
  it('全角スペースも半角にする', () => expect(convertText('あ　い', 'toHalf')).toBe('あ い'));
  it('半角を全角にする', () => expect(convertText('ABC123', 'toFull')).toBe('ＡＢＣ１２３'));
  it('英数だけ半角にする（記号は残す）', () => {
    expect(convertText('ＡＢ１！', 'toHalfAlnum')).toBe('AB1！');
  });
  it('カタカナをひらがなにする', () => expect(convertText('カタカナ', 'hiragana')).toBe('かたかな'));
  it('ひらがなをカタカナにする', () => expect(convertText('ひらがな', 'katakana')).toBe('ヒラガナ'));
  it('大文字小文字', () => {
    expect(convertText('AbC', 'upper')).toBe('ABC');
    expect(convertText('AbC', 'lower')).toBe('abc');
  });
  it('行の前後の空白を落とす（全角スペースも）', () => {
    expect(convertText('  あ　\n　い  ', 'trim')).toBe('あ\nい');
  });
  it('日本語は全角半角の変換で壊れない', () => {
    expect(convertText('日本語ＡＢ', 'toHalf')).toBe('日本語AB');
  });
});

describe('processLines', () => {
  const src = 'b\na\n\nb\n  c  ';

  it('重複を消す（最初のものを残す）', () => {
    expect(processLines('b\na\nb', { dedupe: true })).toBe('b\na');
  });
  it('空行を消す', () => {
    expect(processLines('a\n\nb', { removeEmpty: true })).toBe('a\nb');
  });
  it('前後の空白を落とす', () => {
    expect(processLines('  a  ', { trim: true })).toBe('a');
  });
  it('並べ替える（数字は数として）', () => {
    expect(processLines('項目10\n項目2', { sort: 'asc' })).toBe('項目2\n項目10');
  });
  it('逆順にもできる', () => {
    expect(processLines('a\nb', { sort: 'desc' })).toBe('b\na');
  });
  it('番号をふる', () => {
    expect(processLines('a\nb', { numbering: true })).toBe('1. a\n2. b');
  });
  it('10行以上なら番号の桁を揃える', () => {
    const out = processLines(Array.from({ length: 10 }, (_, i) => `x${i}`).join('\n'), { numbering: true });
    expect(out.startsWith('01. x0')).toBe(true);
  });
  it('前後に文字を足す', () => {
    expect(processLines('a', { prefix: '- ', suffix: '。' })).toBe('- a。');
  });
  it('組み合わせても順番どおりに効く', () => {
    expect(processLines(src, { trim: true, removeEmpty: true, dedupe: true, sort: 'asc' }))
      .toBe('a\nb\nc');
  });
});

describe('改行コード', () => {
  it('混ざっているのを見つける', () => {
    const d = detectNewline('a\r\nb\nc');
    expect(d.crlf).toBe(1);
    expect(d.lf).toBe(1);
    expect(d.mixed).toBe(true);
  });
  it('揃っていれば mixed は false', () => {
    expect(detectNewline('a\nb\nc').mixed).toBe(false);
  });
  it('CRLFに揃える', () => {
    expect(convertNewline('a\nb\r\nc', 'crlf')).toBe('a\r\nb\r\nc');
  });
  it('LFに揃える', () => {
    expect(convertNewline('a\r\nb\rc', 'lf')).toBe('a\nb\nc');
  });
  it('変換しても行数は変わらない', () => {
    const src = 'a\r\nb\nc';
    expect(countLines(convertNewline(src, 'crlf'))).toBe(countLines(src));
  });
});
