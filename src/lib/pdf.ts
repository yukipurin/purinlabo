/**
 * PDFツールの計算。DOMにもpdf-libにも依存しない純粋関数だけを置く。
 * 実際のPDF操作はページ側で pdf-lib を使う。
 */

/**
 * 「1-3,5,8-10」のようなページ指定を読む。
 * 1から始まる番号で返し、重複は取り除いて昇順に並べる。
 */
export function parsePageRange(spec: string, totalPages: number): number[] {
  if (totalPages <= 0) throw new Error('ページがありません');
  const text = spec.replace(/[、，]/g, ',').replace(/[〜～ーｰ]/g, '-').trim();
  if (text === '') return Array.from({ length: totalPages }, (_, i) => i + 1);

  const picked = new Set<number>();
  for (const part of text.split(',')) {
    const chunk = part.trim();
    if (chunk === '') continue;

    const range = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      const [lo, hi] = from <= to ? [from, to] : [to, from];
      for (let n = lo; n <= hi; n++) if (n >= 1 && n <= totalPages) picked.add(n);
      continue;
    }

    const openEnd = chunk.match(/^(\d+)\s*-$/);
    if (openEnd) {
      for (let n = Number(openEnd[1]); n <= totalPages; n++) if (n >= 1) picked.add(n);
      continue;
    }

    const single = chunk.match(/^\d+$/);
    if (single) {
      const n = Number(chunk);
      if (n >= 1 && n <= totalPages) picked.add(n);
      continue;
    }
    throw new Error(`ページの指定が読めません: ${chunk}`);
  }

  const list = [...picked].sort((a, b) => a - b);
  if (list.length === 0) throw new Error('指定に合うページがありません');
  return list;
}

/** 指定を「取り除く」側として使う */
export function invertPages(keep: number[], totalPages: number): number[] {
  const set = new Set(keep);
  const rest: number[] = [];
  for (let n = 1; n <= totalPages; n++) if (!set.has(n)) rest.push(n);
  return rest;
}

/** 連続する番号をまとめて「1-3, 5」の形にする */
export function formatPageRange(pages: number[]): string {
  if (pages.length === 0) return '';
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const n of sorted.slice(1)) {
    if (n === prev + 1) { prev = n; continue; }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = prev = n;
  }
  parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  return parts.join(', ');
}

/** 何ページごとに分けるかを決めて、番号の組に切る */
export function chunkPages(totalPages: number, size: number): number[][] {
  if (size < 1) throw new Error('1以上を指定してください');
  const out: number[][] = [];
  for (let i = 1; i <= totalPages; i += size) {
    out.push(Array.from({ length: Math.min(size, totalPages - i + 1) }, (_, k) => i + k));
  }
  return out;
}

/** 回転の角度。90の倍数だけ受ける */
export function normalizeRotation(deg: number): number {
  const n = ((Math.round(deg / 90) * 90) % 360 + 360) % 360;
  return n;
}

/** 出力するファイル名 */
export function outputPdfName(originalName: string, suffix: string, index?: number): string {
  const base = originalName.replace(/\.pdf$/i, '') || 'document';
  const seq = index === undefined ? '' : `_${String(index + 1).padStart(2, '0')}`;
  return `${base}_${suffix}${seq}.pdf`;
}
