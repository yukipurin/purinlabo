import { describe, expect, it } from 'vitest';
import { isJpeg, isPng, stripJpeg, stripMetadata, stripPng } from './metadata';

/** 検証用に、区画を並べて最小限のJPEGを組み立てる */
function buildJpeg(segments: { marker: number; body: number[] }[], pixels: number[]): Uint8Array {
  const out: number[] = [0xff, 0xd8];
  for (const s of segments) {
    const len = s.body.length + 2;
    out.push(0xff, s.marker, (len >> 8) & 0xff, len & 0xff, ...s.body);
  }
  out.push(0xff, 0xda, 0x00, 0x02, ...pixels, 0xff, 0xd9);   // SOS 以降は画素
  return new Uint8Array(out);
}

/** 検証用に最小限のPNGを組み立てる */
function buildPng(chunks: { type: string; body: number[] }[]): Uint8Array {
  const out: number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (const c of chunks) {
    const n = c.body.length;
    out.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
    for (const ch of c.type) out.push(ch.charCodeAt(0));
    out.push(...c.body, 0, 0, 0, 0);                          // CRCは検証しないので0
  }
  return new Uint8Array(out);
}

describe('形式の判定', () => {
  it('JPEGを見分ける', () => {
    expect(isJpeg(buildJpeg([], [1, 2]))).toBe(true);
    expect(isJpeg(new Uint8Array([1, 2, 3, 4]))).toBe(false);
  });
  it('PNGを見分ける', () => {
    expect(isPng(buildPng([{ type: 'IEND', body: [] }]))).toBe(true);
    expect(isPng(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toBe(false);
  });
});

describe('stripJpeg', () => {
  const pixels = [0x11, 0x22, 0x33, 0x44];

  it('EXIF（APP1）を外す', () => {
    const src = buildJpeg([{ marker: 0xe1, body: [0x45, 0x78, 0x69, 0x66, 0, 0, 9, 9, 9] }], pixels);
    const r = stripJpeg(src);
    expect(r.removed).toContain('EXIF / XMP');
    expect(r.bytes.length).toBeLessThan(src.length);
    expect(r.savedBytes).toBeGreaterThan(0);
  });

  it('画素データには触れない（SOS以降が1バイトも変わらない）', () => {
    const src = buildJpeg([{ marker: 0xe1, body: [1, 2, 3, 4, 5] }], pixels);
    const r = stripJpeg(src);

    const sosOf = (b: Uint8Array) => {
      for (let i = 2; i < b.length - 1; i++) if (b[i] === 0xff && b[i + 1] === 0xda) return i;
      return -1;
    };
    const a = sosOf(src), c = sosOf(r.bytes);
    expect(a).toBeGreaterThan(0);
    expect(c).toBeGreaterThan(0);
    expect(Array.from(r.bytes.slice(c))).toEqual(Array.from(src.slice(a)));
    expect(Array.from(r.bytes.slice(-2))).toEqual([0xff, 0xd9]);   // EOIで終わる
  });

  it('ICCプロファイル（APP2）は残す。色が変わるため', () => {
    const icc = [0x49, 0x43, 0x43, 0x5f];
    const src = buildJpeg([{ marker: 0xe2, body: icc }], pixels);
    const r = stripJpeg(src);
    expect(r.removed).toHaveLength(0);
    expect(r.bytes.length).toBe(src.length);
  });

  it('JFIF（APP0）も残す', () => {
    const src = buildJpeg([{ marker: 0xe0, body: [0x4a, 0x46, 0x49, 0x46, 0] }], pixels);
    expect(stripJpeg(src).bytes.length).toBe(src.length);
  });

  it('コメントを外す', () => {
    const src = buildJpeg([{ marker: 0xfe, body: [0x68, 0x69] }], pixels);
    expect(stripJpeg(src).removed).toContain('コメント');
  });

  it('複数の区画を同時に外し、残すものは残す', () => {
    const src = buildJpeg([
      { marker: 0xe0, body: [1, 2] },        // JFIF 残す
      { marker: 0xe1, body: [3, 4, 5, 6] },  // EXIF 外す
      { marker: 0xe2, body: [7, 8] },        // ICC 残す
      { marker: 0xfe, body: [9] },           // コメント 外す
    ], pixels);
    const r = stripJpeg(src);
    expect(r.removed.sort()).toEqual(['EXIF / XMP', 'コメント']);
    expect(r.bytes.length).toBe(src.length - (4 + 4) - (1 + 4));
  });

  it('メタデータが無ければ何も変わらない', () => {
    const src = buildJpeg([{ marker: 0xe0, body: [1, 2] }], pixels);
    const r = stripJpeg(src);
    expect(r.savedBytes).toBe(0);
    expect(Array.from(r.bytes)).toEqual(Array.from(src));
  });

  it('JPEGでなければ例外', () => {
    expect(() => stripJpeg(new Uint8Array([0, 1, 2, 3]))).toThrow();
  });
});

describe('stripPng', () => {
  it('eXIfチャンクを外す', () => {
    const src = buildPng([
      { type: 'IHDR', body: [1, 2, 3] },
      { type: 'eXIf', body: [9, 9, 9, 9] },
      { type: 'IDAT', body: [4, 5] },
      { type: 'IEND', body: [] },
    ]);
    const r = stripPng(src);
    expect(r.removed).toContain('EXIF');
    expect(r.bytes.length).toBe(src.length - (12 + 4));
  });

  it('テキスト情報のチャンクを外す', () => {
    const src = buildPng([
      { type: 'IHDR', body: [1] },
      { type: 'tEXt', body: [1, 2, 3] },
      { type: 'iTXt', body: [4, 5] },
      { type: 'IEND', body: [] },
    ]);
    expect(stripPng(src).removed).toContain('テキスト情報');
  });

  it('画素データ（IDAT）は残す', () => {
    const src = buildPng([
      { type: 'IHDR', body: [1] },
      { type: 'eXIf', body: [9] },
      { type: 'IDAT', body: [7, 7, 7] },
      { type: 'IEND', body: [] },
    ]);
    const r = stripPng(src);
    const text = Array.from(r.bytes).map((b) => String.fromCharCode(b)).join('');
    expect(text).toContain('IDAT');
    expect(text).not.toContain('eXIf');
  });

  it('PNGでなければ例外', () => {
    expect(() => stripPng(new Uint8Array([1, 2, 3]))).toThrow();
  });
});

describe('stripMetadata', () => {
  it('対応していない形式はそのまま返す', () => {
    const src = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4]);   // WebPのつもり
    const r = stripMetadata(src);
    expect(r.savedBytes).toBe(0);
    expect(r.removed).toHaveLength(0);
    expect(Array.from(r.bytes)).toEqual(Array.from(src));
  });
});
