import { describe, expect, it } from 'vitest';
import {
  bestTextOn, contrastRatio, dominantColors, harmony, hslToRgb,
  judgeContrast, parseColor, relativeLuminance, rgbToHsl, shades, toHex,
} from './color';

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

describe('parseColor', () => {
  it('6桁のHEX', () => expect(parseColor('#3d8b64')).toEqual({ r: 61, g: 139, b: 100 }));
  it('3桁のHEXは2桁に広げる', () => expect(parseColor('#fff')).toEqual(WHITE));
  it('#なしでも読む', () => expect(parseColor('b87d45')).toEqual({ r: 184, g: 125, b: 69 }));
  it('大文字でも読む', () => expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 }));
  it('rgb()を読む', () => expect(parseColor('rgb(61, 139, 100)')).toEqual({ r: 61, g: 139, b: 100 }));
  it('範囲外は丸める', () => expect(parseColor('rgb(300,0,0)').r).toBe(255));
  it('読めない文字は例外', () => expect(() => parseColor('みどり')).toThrow());
  it('桁数が違えば例外', () => expect(() => parseColor('#12345')).toThrow());
});

describe('toHex', () => {
  it('小文字の6桁で返す', () => expect(toHex({ r: 61, g: 139, b: 100 })).toBe('#3d8b64'));
  it('0を2桁にする', () => expect(toHex(BLACK)).toBe('#000000'));
  it('小数は丸める', () => expect(toHex({ r: 0.6, g: 0, b: 0 })).toBe('#010000'));
});

describe('HSL との行き来', () => {
  it('白は彩度0・明度100', () => expect(rgbToHsl(WHITE)).toEqual({ h: 0, s: 0, l: 100 }));
  it('赤は色相0', () => expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 }));
  it('緑は色相120', () => expect(rgbToHsl({ r: 0, g: 255, b: 0 }).h).toBe(120));
  it('青は色相240', () => expect(rgbToHsl({ r: 0, g: 0, b: 255 }).h).toBe(240));
  it('往復しても大きくずれない', () => {
    const src = { r: 184, g: 125, b: 69 };
    const back = hslToRgb(rgbToHsl(src));
    expect(Math.abs(back.r - src.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - src.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - src.b)).toBeLessThanOrEqual(2);
  });
  it('彩度0はグレーになる', () => expect(hslToRgb({ h: 200, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 }));
  it('色相が360を超えても一周する', () => {
    expect(hslToRgb({ h: 380, s: 100, l: 50 })).toEqual(hslToRgb({ h: 20, s: 100, l: 50 }));
  });
});

describe('relativeLuminance / contrastRatio', () => {
  it('白の輝度は1', () => expect(relativeLuminance(WHITE)).toBeCloseTo(1, 5));
  it('黒の輝度は0', () => expect(relativeLuminance(BLACK)).toBeCloseTo(0, 5));
  it('白と黒の比は21', () => expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 2));
  it('同じ色どうしは1', () => expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5));
  it('順番を入れ替えても同じ', () => {
    const a = { r: 61, g: 139, b: 100 };
    expect(contrastRatio(a, WHITE)).toBeCloseTo(contrastRatio(WHITE, a), 10);
  });
});

describe('judgeContrast', () => {
  it('白地に黒はすべて通る', () => {
    const j = judgeContrast(BLACK, WHITE);
    expect(j.normalAA && j.normalAAA && j.largeAA && j.largeAAA).toBe(true);
  });
  it('白地に薄いグレーは本文で落ちる', () => {
    const j = judgeContrast({ r: 200, g: 200, b: 200 }, WHITE);
    expect(j.normalAA).toBe(false);
    expect(j.ratio).toBeLessThan(4.5);
  });
  it('境目の4.5を含む', () => {
    // 比がちょうど4.5をわずかに超える組み合わせ
    const j = judgeContrast({ r: 117, g: 117, b: 117 }, WHITE);
    expect(j.ratio).toBeGreaterThanOrEqual(4.5);
    expect(j.normalAA).toBe(true);
  });
  it('大きな文字の基準は本文より緩い', () => {
    // 白地に #8a8a8a は比3.45。大きな文字（3.0）は通り、本文（4.5）は落ちる
    const j = judgeContrast({ r: 138, g: 138, b: 138 }, WHITE);
    expect(j.ratio).toBeGreaterThan(3);
    expect(j.ratio).toBeLessThan(4.5);
    expect(j.largeAA).toBe(true);
    expect(j.normalAA).toBe(false);
  });
});

describe('bestTextOn', () => {
  it('暗い背景には白', () => expect(bestTextOn({ r: 36, g: 29, b: 19 })).toBe('white'));
  it('明るい背景には黒', () => expect(bestTextOn({ r: 250, g: 244, b: 232 })).toBe('black'));
});

describe('shades / harmony', () => {
  it('指定した数だけ作る', () => expect(shades({ r: 61, g: 139, b: 100 }, 9)).toHaveLength(9));
  it('明るい順に並ぶ', () => {
    const s = shades({ r: 61, g: 139, b: 100 }, 5);
    expect(relativeLuminance(s[0])).toBeGreaterThan(relativeLuminance(s[4]));
  });
  it('補色は2色', () => expect(harmony({ r: 255, g: 0, b: 0 }, 'complement')).toHaveLength(2));
  it('補色は色相が180ずれる', () => {
    const [a, b] = harmony({ r: 255, g: 0, b: 0 }, 'complement');
    expect(Math.abs(rgbToHsl(b).h - rgbToHsl(a).h)).toBe(180);
  });
  it('三色は3色', () => expect(harmony({ r: 255, g: 0, b: 0 }, 'triad')).toHaveLength(3));
});

describe('dominantColors', () => {
  const px = (list: number[][]) => {
    const a = new Uint8ClampedArray(list.length * 4);
    list.forEach(([r, g, b, alpha = 255], i) => {
      a[i * 4] = r; a[i * 4 + 1] = g; a[i * 4 + 2] = b; a[i * 4 + 3] = alpha;
    });
    return a;
  };

  it('多い色から順に返す', () => {
    const out = dominantColors(px([[255, 0, 0], [255, 0, 0], [255, 0, 0], [0, 0, 255]]), 2);
    expect(out[0].color.r).toBeGreaterThan(200);
    expect(out[0].ratio).toBeCloseTo(0.75, 2);
  });
  it('透けている画素は数えない', () => {
    const out = dominantColors(px([[255, 0, 0], [0, 0, 255, 0]]), 5);
    expect(out).toHaveLength(1);
    expect(out[0].ratio).toBe(1);
  });
  it('近い色はまとめる', () => {
    const out = dominantColors(px([[250, 10, 10], [255, 5, 5], [0, 0, 255]]), 5);
    expect(out[0].ratio).toBeCloseTo(2 / 3, 2);
  });
  it('全部透けていれば空', () => expect(dominantColors(px([[1, 2, 3, 0]]))).toHaveLength(0));
  it('数を指定できる', () => {
    const many = Array.from({ length: 20 }, (_, i) => [i * 12, 0, 0]);
    expect(dominantColors(px(many), 3)).toHaveLength(3);
  });
});
