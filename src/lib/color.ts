/** 色の計算。DOMに依存しない純粋関数だけを置く。 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** #fff / #ffffff / ffffff / rgb(255,0,0) を読む */
export function parseColor(text: string): RGB {
  const s = text.trim().toLowerCase();

  const hex = s.replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return { r: parseInt(hex[0] + hex[0], 16), g: parseInt(hex[1] + hex[1], 16), b: parseInt(hex[2] + hex[2], 16) };
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  }

  const rgb = s.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)/);
  if (rgb) {
    return { r: clamp(Number(rgb[1]), 0, 255), g: clamp(Number(rgb[2]), 0, 255), b: clamp(Number(rgb[3]), 0, 255) };
  }

  throw new Error(`色として読めません: ${text}`);
}

export function toHex({ r, g, b }: RGB): string {
  const p = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const H = ((h % 360) + 360) % 360 / 360, S = clamp(s, 0, 100) / 100, L = clamp(l, 0, 100) / 100;
  if (S === 0) { const v = Math.round(L * 255); return { r: v, g: v, b: v }; }
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const hue = (t: number) => {
    let T = t; if (T < 0) T += 1; if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  return {
    r: Math.round(hue(H + 1 / 3) * 255),
    g: Math.round(hue(H) * 255),
    b: Math.round(hue(H - 1 / 3) * 255),
  };
}

/** 相対輝度。WCAGの定義に従う */
export function relativeLuminance({ r, g, b }: RGB): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** コントラスト比。1〜21で返す */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastJudgement = {
  ratio: number;
  /** 本文（14px程度）で必要な4.5に届くか */
  normalAA: boolean;
  /** より厳しい7.0に届くか */
  normalAAA: boolean;
  /** 大きな文字（18.66px太字 / 24px）で必要な3.0に届くか */
  largeAA: boolean;
  largeAAA: boolean;
  /** ボタンの枠など、文字でない部分に必要な3.0に届くか */
  uiAA: boolean;
};

export function judgeContrast(fg: RGB, bg: RGB): ContrastJudgement {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio,
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
    uiAA: ratio >= 3,
  };
}

/** 明るさを保ったまま、文字色を白と黒のどちらにすべきか */
export function bestTextOn(bg: RGB): 'white' | 'black' {
  const white = contrastRatio({ r: 255, g: 255, b: 255 }, bg);
  const black = contrastRatio({ r: 0, g: 0, b: 0 }, bg);
  return white >= black ? 'white' : 'black';
}

/** 明るさを段階的に変えた色を作る */
export function shades(base: RGB, steps = 9): RGB[] {
  const { h, s } = rgbToHsl(base);
  return Array.from({ length: steps }, (_, i) =>
    hslToRgb({ h, s, l: Math.round(95 - (90 / (steps - 1)) * i) }));
}

/** 色相をずらした色を作る（補色・三色など） */
export function harmony(base: RGB, kind: 'complement' | 'triad' | 'analogous'): RGB[] {
  const { h, s, l } = rgbToHsl(base);
  const offsets = kind === 'complement' ? [0, 180]
    : kind === 'triad' ? [0, 120, 240]
    : [-30, 0, 30];
  return offsets.map((d) => hslToRgb({ h: h + d, s, l }));
}

/** 画像の画素から、よく使われている色を数える。量子化してから集計する */
export function dominantColors(
  pixels: Uint8ClampedArray, count = 6, bucket = 32,
): { color: RGB; ratio: number }[] {
  const tally = new Map<string, { sum: RGB; n: number }>();
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue;              // 透けているところは数えない
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const key = `${Math.floor(r / bucket)},${Math.floor(g / bucket)},${Math.floor(b / bucket)}`;
    const cur = tally.get(key) ?? { sum: { r: 0, g: 0, b: 0 }, n: 0 };
    cur.sum.r += r; cur.sum.g += g; cur.sum.b += b; cur.n++;
    tally.set(key, cur);
    total++;
  }
  if (total === 0) return [];
  return [...tally.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map(({ sum, n }) => ({
      color: { r: Math.round(sum.r / n), g: Math.round(sum.g / n), b: Math.round(sum.b / n) },
      ratio: n / total,
    }));
}
