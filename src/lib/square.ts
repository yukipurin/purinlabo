/**
 * 出品写真を正方形にするための計算。
 * DOM に依存しない純粋関数だけを置く（UI から分離してテストできるようにするため）。
 */

export type Fit = {
  /** 描画先の左上 X */
  dx: number;
  /** 描画先の左上 Y */
  dy: number;
  /** 描画する幅 */
  dw: number;
  /** 描画する高さ */
  dh: number;
};

/**
 * 元画像を正方形の中に、比率を保ったまま収める（contain）。
 * はみ出さないので写真が切れない。あまった部分は余白になる。
 */
export function fitContain(srcW: number, srcH: number, size: number): Fit {
  if (srcW <= 0 || srcH <= 0) throw new Error("画像の寸法が不正です");
  const scale = Math.min(size / srcW, size / srcH);
  const dw = Math.round(srcW * scale);
  const dh = Math.round(srcH * scale);
  return { dx: Math.round((size - dw) / 2), dy: Math.round((size - dh) / 2), dw, dh };
}

/**
 * 正方形いっぱいに広げる（cover）。はみ出した分は切り取られる。
 * 返り値は「元画像のどこを切り出すか」。
 */
export function fitCover(srcW: number, srcH: number, size: number): Fit {
  if (srcW <= 0 || srcH <= 0) throw new Error("画像の寸法が不正です");
  const side = Math.min(srcW, srcH);
  return {
    dx: Math.round((srcW - side) / 2),
    dy: Math.round((srcH - side) / 2),
    dw: side,
    dh: side,
  };
}

/**
 * 縦横比の偏り。1 に近いほど正方形に近い。
 * 極端に細長い写真は contain でも見栄えが悪いので、UI 側で注意を出すのに使う。
 */
export function aspectRatio(srcW: number, srcH: number): number {
  if (srcW <= 0 || srcH <= 0) throw new Error("画像の寸法が不正です");
  return Math.max(srcW, srcH) / Math.min(srcW, srcH);
}

/** 拡張子を除いたファイル名 */
export function stripExtension(name: string): string {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

/**
 * 書き出すファイル名を作る。
 * prefix があれば「prefix_01.jpg」、無ければ「元の名前_01.jpg」。
 * 連番は総数に応じて桁を揃える（10枚なら 01、100枚なら 001）。
 */
export function outputName(
  originalName: string,
  index: number,
  total: number,
  prefix = "",
): string {
  const digits = Math.max(2, String(Math.max(total, 1)).length);
  const seq = String(index + 1).padStart(digits, "0");
  const base = prefix.trim() !== "" ? prefix.trim() : stripExtension(originalName);
  return `${sanitizeFileName(base)}_${seq}.jpg`;
}

/** ファイル名に使えない文字を落とす */
export function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim();
  return cleaned === "" ? "image" : cleaned;
}

/** バイト数を読める形にする */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
