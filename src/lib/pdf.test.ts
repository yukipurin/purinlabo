import { describe, expect, it } from 'vitest';
import {
  chunkPages, formatPageRange, invertPages, normalizeRotation, outputPdfName, parsePageRange,
} from './pdf';

describe('parsePageRange', () => {
  it('空なら全ページ', () => expect(parsePageRange('', 3)).toEqual([1, 2, 3]));
  it('単独の番号', () => expect(parsePageRange('2', 5)).toEqual([2]));
  it('範囲', () => expect(parsePageRange('2-4', 10)).toEqual([2, 3, 4]));
  it('組み合わせ', () => expect(parsePageRange('1,3-5,8', 10)).toEqual([1, 3, 4, 5, 8]));
  it('重複は1つにまとめる', () => expect(parsePageRange('1,1,2-3,3', 5)).toEqual([1, 2, 3]));
  it('順番が逆でも昇順にする', () => expect(parsePageRange('5-3', 10)).toEqual([3, 4, 5]));
  it('末尾を省いた形（3-）', () => expect(parsePageRange('3-', 5)).toEqual([3, 4, 5]));
  it('全角の読点と波ダッシュを半角と同じに扱う', () => {
    expect(parsePageRange('1、3～5', 10)).toEqual([1, 3, 4, 5]);
  });
  it('総ページを超える指定は落とす', () => expect(parsePageRange('3-99', 5)).toEqual([3, 4, 5]));
  it('読めない指定は例外', () => expect(() => parsePageRange('あ', 5)).toThrow());
  it('合うページが無ければ例外', () => expect(() => parsePageRange('99', 5)).toThrow());
  it('ページ0なら例外', () => expect(() => parsePageRange('1', 0)).toThrow());
});

describe('invertPages', () => {
  it('指定を除いた残りを返す', () => expect(invertPages([2, 4], 5)).toEqual([1, 3, 5]));
  it('全部指定なら空', () => expect(invertPages([1, 2], 2)).toEqual([]));
});

describe('formatPageRange', () => {
  it('連番をまとめる', () => expect(formatPageRange([1, 2, 3, 5])).toBe('1-3, 5'));
  it('とびとび', () => expect(formatPageRange([1, 3, 5])).toBe('1, 3, 5'));
  it('1つだけ', () => expect(formatPageRange([7])).toBe('7'));
  it('空なら空文字', () => expect(formatPageRange([])).toBe(''));
  it('順不同でも並べ替える', () => expect(formatPageRange([3, 1, 2])).toBe('1-3'));
});

describe('chunkPages', () => {
  it('等分に切る', () => expect(chunkPages(6, 2)).toEqual([[1, 2], [3, 4], [5, 6]]));
  it('余りは最後に入れる', () => expect(chunkPages(5, 2)).toEqual([[1, 2], [3, 4], [5]]));
  it('1ページずつ', () => expect(chunkPages(3, 1)).toEqual([[1], [2], [3]]));
  it('0以下は例外', () => expect(() => chunkPages(3, 0)).toThrow());
});

describe('normalizeRotation', () => {
  it('90の倍数に丸める', () => expect(normalizeRotation(95)).toBe(90));
  it('360で一周する', () => expect(normalizeRotation(450)).toBe(90));
  it('負の角度も0-359に収める', () => expect(normalizeRotation(-90)).toBe(270));
});

describe('outputPdfName', () => {
  it('拡張子を重ねない', () => expect(outputPdfName('資料.pdf', 'merged')).toBe('資料_merged.pdf'));
  it('連番をつける', () => expect(outputPdfName('a.pdf', 'part', 0)).toBe('a_part_01.pdf'));
  it('名前が無ければ既定を使う', () => expect(outputPdfName('', 'split')).toBe('document_split.pdf'));
});
