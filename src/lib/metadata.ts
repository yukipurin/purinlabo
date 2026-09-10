/**
 * 画像のバイト列からメタデータだけを取り除く。
 *
 * Canvasに描き直して書き出す方法でもメタデータは消えるが、それだと再圧縮で画質が落ちる。
 * ここでは画素のデータには一切触れず、メタデータの区画だけを外すので**画質は変わらない**。
 * DOMに依存しない純粋関数。
 */

export type StripResult = {
  /** メタデータを外したあとのバイト列 */
  bytes: Uint8Array;
  /** 外した区画の名前（例: EXIF, XMP, コメント） */
  removed: string[];
  /** 減ったバイト数 */
  savedBytes: number;
};

const JPEG_SOI = 0xd8;
const JPEG_SOS = 0xda;
const JPEG_EOI = 0xd9;

/** JPEGか */
export function isJpeg(b: Uint8Array): boolean {
  return b.length > 3 && b[0] === 0xff && b[1] === JPEG_SOI;
}

/** PNGか */
export function isPng(b: Uint8Array): boolean {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return b.length > 8 && sig.every((v, i) => b[i] === v);
}

/**
 * JPEGからメタデータの区画を外す。
 * 画素は SOS 以降にあり、そこには触れない。
 * ICCプロファイル（APP2）は色が変わるので残す。
 */
export function stripJpeg(bytes: Uint8Array): StripResult {
  if (!isJpeg(bytes)) throw new Error('JPEGではありません');
  const out: number[] = [0xff, JPEG_SOI];
  const removed: string[] = [];
  let i = 2;

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) { i++; continue; }        // 詰め物を読み飛ばす
    const marker = bytes[i + 1];
    if (marker === undefined) break;
    if (marker === 0xff) { i++; continue; }

    if (marker === JPEG_SOS || marker === JPEG_EOI) {
      // ここから先は画素データ。まるごと残す
      for (let k = i; k < bytes.length; k++) out.push(bytes[k]);
      break;
    }

    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    if (!Number.isFinite(len) || len < 2) break;
    const end = i + 2 + len;

    const drop =
      marker === 0xe1 ? 'EXIF / XMP' :        // APP1
      marker === 0xed ? 'Photoshop情報' :      // APP13 (IPTC)
      marker === 0xfe ? 'コメント' :           // COM
      null;

    if (drop) {
      if (!removed.includes(drop)) removed.push(drop);
    } else {
      for (let k = i; k < end && k < bytes.length; k++) out.push(bytes[k]);
    }
    i = end;
  }

  const result = new Uint8Array(out);
  return { bytes: result, removed, savedBytes: bytes.length - result.length };
}

/** メタデータを持つPNGチャンク */
const PNG_META_CHUNKS = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);

/** PNGからメタデータのチャンクを外す */
export function stripPng(bytes: Uint8Array): StripResult {
  if (!isPng(bytes)) throw new Error('PNGではありません');
  const out: number[] = [];
  for (let k = 0; k < 8; k++) out.push(bytes[k]);
  const removed: string[] = [];
  let i = 8;

  while (i + 8 <= bytes.length) {
    const len = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
    const total = 12 + len;                            // 長さ4 + 種類4 + データ + CRC4
    if (len < 0 || i + total > bytes.length) break;

    if (PNG_META_CHUNKS.has(type)) {
      const label = type === 'eXIf' ? 'EXIF' : type === 'tIME' ? '更新日時' : 'テキスト情報';
      if (!removed.includes(label)) removed.push(label);
    } else {
      for (let k = i; k < i + total; k++) out.push(bytes[k]);
    }

    i += total;
    if (type === 'IEND') break;
  }

  const result = new Uint8Array(out);
  return { bytes: result, removed, savedBytes: bytes.length - result.length };
}

/** 形式を見て振り分ける。対応外はそのまま返す */
export function stripMetadata(bytes: Uint8Array): StripResult {
  if (isJpeg(bytes)) return stripJpeg(bytes);
  if (isPng(bytes)) return stripPng(bytes);
  return { bytes, removed: [], savedBytes: 0 };
}

/** ファビコンとして書き出す寸法 */
export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const;

/** iOS / Android のアプリアイコンとして書き出す寸法 */
export const APP_ICON_SIZES = [
  { size: 1024, label: 'App Store' },
  { size: 180, label: 'iPhone' },
  { size: 167, label: 'iPad Pro' },
  { size: 152, label: 'iPad' },
  { size: 120, label: 'iPhone 小' },
  { size: 512, label: 'Google Play' },
  { size: 192, label: 'Android' },
  { size: 144, label: 'Android 小' },
] as const;
