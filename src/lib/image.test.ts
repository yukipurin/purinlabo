import { describe, expect, it } from 'vitest';
import {
  fitLongSide, formatBytes, outputName, reductionPercent,
  sanitizeFileName, searchQuality, sortFiles, stripExtension,
} from './image';

describe('fitLongSide', () => {
  it('横長は幅が長辺になる', () => {
    expect(fitLongSide(2000, 1000, 800)).toEqual({ width: 800, height: 400 });
  });
  it('縦長は高さが長辺になる', () => {
    expect(fitLongSide(1000, 2000, 800)).toEqual({ width: 400, height: 800 });
  });
  it('既定では元より大きくしない', () => {
    expect(fitLongSide(400, 300, 1600)).toEqual({ width: 400, height: 300 });
  });
  it('許可すれば拡大する', () => {
    expect(fitLongSide(400, 300, 800, true)).toEqual({ width: 800, height: 600 });
  });
  it('1px未満にはしない', () => {
    expect(fitLongSide(1000, 2, 10).height).toBe(1);
  });
  it('不正な値は例外', () => {
    expect(() => fitLongSide(0, 100, 800)).toThrow();
    expect(() => fitLongSide(100, 100, 0)).toThrow();
  });
});

describe('searchQuality', () => {
  // 品質に比例してサイズが増える、という単純な模型で探索を検証する
  const model = (q: number) => Promise.resolve(Math.round(q * 1000));

  it('目標に収まる中で最も高い品質を選ぶ', async () => {
    const r = await searchQuality(model, 600);
    expect(r.fit).toBe(true);
    expect(r.bytes).toBeLessThanOrEqual(600);
    expect(r.quality).toBeGreaterThan(0.4);
  });

  it('どうしても収まらない場合は最小のものを返し、収まらなかったと伝える', async () => {
    const r = await searchQuality(model, 10);
    expect(r.fit).toBe(false);
    expect(r.bytes).toBeGreaterThan(10);
  });

  it('全部収まるなら上限の品質に近づく', async () => {
    const r = await searchQuality(model, 99999);
    expect(r.fit).toBe(true);
    expect(r.quality).toBeGreaterThan(0.9);
  });
});

describe('outputName', () => {
  it('接頭辞が無ければ元の名前を使う', () => {
    expect(outputName('写真.HEIC', 0, 3, 'jpg')).toBe('写真_01.jpg');
  });
  it('接頭辞があればそちらを使う', () => {
    expect(outputName('a.png', 4, 10, 'webp', { prefix: 'ABC' })).toBe('ABC_05.webp');
  });
  it('開始番号を変えられる', () => {
    expect(outputName('a.png', 0, 5, 'jpg', { prefix: 'x', start: 10 })).toBe('x_10.jpg');
  });
  it('桁を指定できる', () => {
    expect(outputName('a.png', 0, 5, 'jpg', { prefix: 'x', digits: 4 })).toBe('x_0001.jpg');
  });
  it('総数から桁を自動で決める', () => {
    expect(outputName('a.png', 0, 120, 'jpg', { prefix: 'x' })).toBe('x_001.jpg');
  });
  it('連番なしにできる', () => {
    expect(outputName('写真.heic', 0, 1, 'jpg', { noSequence: true })).toBe('写真.jpg');
  });
  it('使えない文字は落とす', () => {
    expect(outputName('a.png', 0, 1, 'jpg', { prefix: 'A/B:C' })).toBe('ABC_01.jpg');
  });
});

describe('sortFiles', () => {
  const files = [
    { name: 'IMG_10.jpg', lastModified: 300 },
    { name: 'IMG_2.jpg', lastModified: 100 },
    { name: 'IMG_1.jpg', lastModified: 200 },
  ];
  it('選んだ順はそのまま', () => {
    expect(sortFiles(files, 'picked').map((f) => f.name)).toEqual(['IMG_10.jpg', 'IMG_2.jpg', 'IMG_1.jpg']);
  });
  it('名前順は数字を数として扱う', () => {
    expect(sortFiles(files, 'name').map((f) => f.name)).toEqual(['IMG_1.jpg', 'IMG_2.jpg', 'IMG_10.jpg']);
  });
  it('日時順は古い順', () => {
    expect(sortFiles(files, 'date').map((f) => f.lastModified)).toEqual([100, 200, 300]);
  });
  it('元の配列を壊さない', () => {
    const before = files.map((f) => f.name);
    sortFiles(files, 'name');
    expect(files.map((f) => f.name)).toEqual(before);
  });
});

describe('stripExtension / sanitizeFileName', () => {
  it('拡張子を落とす', () => expect(stripExtension('IMG_1234.HEIC')).toBe('IMG_1234'));
  it('ドット始まりは消さない', () => expect(stripExtension('.gitignore')).toBe('.gitignore'));
  it('全部消える場合は image にする', () => expect(sanitizeFileName('///')).toBe('image'));
});

describe('formatBytes / reductionPercent', () => {
  it('単位を切り替える', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
  });
  it('削減率を出す', () => expect(reductionPercent(1000, 250)).toBe(75));
  it('増えた場合は0にする', () => expect(reductionPercent(100, 200)).toBe(0));
});
