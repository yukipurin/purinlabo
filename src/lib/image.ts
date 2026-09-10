/**
 * 画像ツール共通の計算。DOMに依存しない純粋関数だけを置く。
 */

export type Size = { width: number; height: number };

/** 長辺を maxLongSide に収める寸法。allowUpscale が false なら元より大きくしない */
export function fitLongSide(
  srcW: number, srcH: number, maxLongSide: number, allowUpscale = false,
): Size {
  if (srcW <= 0 || srcH <= 0) throw new Error('画像の寸法が不正です');
  if (maxLongSide <= 0) throw new Error('長辺の指定が不正です');
  const long = Math.max(srcW, srcH);
  let scale = maxLongSide / long;
  if (!allowUpscale) scale = Math.min(scale, 1);
  return {
    width: Math.max(1, Math.round(srcW * scale)),
    height: Math.max(1, Math.round(srcH * scale)),
  };
}

/**
 * 目標バイト数に収まる品質を二分探索で選ぶ。
 * encode は品質を受け取ってバイト数を返す関数（実際の書き出しは呼び出し側）。
 * 収まる品質が1つも無ければ、探索した中で最小のものを返す。
 */
export async function searchQuality(
  encode: (quality: number) => Promise<number>,
  targetBytes: number,
  { min = 0.25, max = 0.95, steps = 7 } = {},
): Promise<{ quality: number; bytes: number; fit: boolean }> {
  let lo = min, hi = max;
  let best: { quality: number; bytes: number } | null = null;
  let smallest: { quality: number; bytes: number } | null = null;

  for (let i = 0; i < steps; i++) {
    const q = (lo + hi) / 2;
    const bytes = await encode(q);
    if (!smallest || bytes < smallest.bytes) smallest = { quality: q, bytes };
    if (bytes <= targetBytes) {
      if (!best || q > best.quality) best = { quality: q, bytes };
      lo = q;           // もっと画質を上げられる
    } else {
      hi = q;           // 品質を落とす
    }
  }
  if (best) return { ...best, fit: true };
  return { ...(smallest as { quality: number; bytes: number }), fit: false };
}

/**
 * 目標サイズに収めるために試す縮小率。
 * 品質を下げきっても届かないときは、順に寸法を落として試し直す。
 */
export const SHRINK_STEPS = [1, 0.75, 0.5, 0.35] as const;

/** 拡張子を除いたファイル名 */
export function stripExtension(name: string): string {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(0, i) : name;
}

/** ファイル名に使えない文字を落とす */
export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
  return cleaned === '' ? 'image' : cleaned;
}

export type NameOptions = {
  /** 接頭辞。空なら元のファイル名を使う */
  prefix?: string;
  /** 連番の開始 */
  start?: number;
  /** 連番の桁。0 なら総数から自動で決める */
  digits?: number;
  /** 連番を付けない */
  noSequence?: boolean;
};

/** 書き出すファイル名を作る */
export function outputName(
  originalName: string, index: number, total: number, ext: string, opts: NameOptions = {},
): string {
  const { prefix = '', start = 1, digits = 0, noSequence = false } = opts;
  const base = prefix.trim() !== '' ? sanitizeFileName(prefix.trim())
                                    : sanitizeFileName(stripExtension(originalName));
  if (noSequence) return `${base}.${ext}`;
  const width = digits > 0 ? digits : Math.max(2, String(Math.max(total, 1)).length);
  const seq = String(start + index).padStart(width, '0');
  return `${base}_${seq}.${ext}`;
}

/** 並べ替え。撮影日時は読まないので、名前順と更新日時順だけ扱う */
export type SortKey = 'picked' | 'name' | 'date';

export function sortFiles<T extends { name: string; lastModified: number }>(
  files: T[], key: SortKey,
): T[] {
  const a = [...files];
  if (key === 'name') return a.sort((x, y) => x.name.localeCompare(y.name, 'ja', { numeric: true }));
  if (key === 'date') return a.sort((x, y) => x.lastModified - y.lastModified);
  return a;
}

/** バイト数を読める形にする */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 削減率。元より大きくなった場合は 0 を返す */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.max(0, Math.round((1 - after / before) * 100));
}

export const MIME: Record<string, string> = {
  jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
};
