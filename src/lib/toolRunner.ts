/**
 * 画像ツール共通の配線。ファイルの受け取り・実行ループ・結果表示・ZIP書き出し。
 * 各ツールは convert（1枚をどう変換するか）だけを渡す。
 *
 * 処理はすべてブラウザ内で完結する。ファイルを外へ送る経路はここに存在しない。
 */
import { zipSync } from 'fflate';
import { formatBytes, reductionPercent } from './image';

export type Made = { name: string; blob: Blob; url: string; before: number };

export type Output = { blob: Blob; name: string; note?: string };

/** 1枚から複数を書き出すツール（ファビコン等）は配列を返す */
export type Convert = (file: File, index: number, total: number)
  => Promise<Output | Output[]>;

export type RunnerOptions = {
  /** 1枚を変換する。ツールごとの中身 */
  convert: Convert;
  /** ZIPのファイル名 */
  zipName: string;
  /** 受け取れる拡張子の判定。既定では image/* とHEIC */
  accept?: (file: File) => boolean;
  /** 削減率を結果に出すか（圧縮系だけ true） */
  showReduction?: boolean;
};

const defaultAccept = (f: File) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name);

export function setupTool(opts: RunnerOptions) {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

  const dropzone = $<HTMLDivElement>('dropzone');
  const fileInput = $<HTMLInputElement>('file');
  const settings = $<HTMLDivElement>('settings');
  const results = $<HTMLElement>('results');
  const grid = $<HTMLUListElement>('grid');
  const runBtn = $<HTMLButtonElement>('run');
  const zipBtn = $<HTMLButtonElement>('zip');
  const countEl = $<HTMLSpanElement>('count');
  const clearBtn = $<HTMLButtonElement>('clear');
  const pickBtn = $<HTMLButtonElement>('pick');

  let picked: File[] = [];
  let made: Made[] = [];

  const accept = opts.accept ?? defaultAccept;

  function reset() {
    made.forEach((m) => URL.revokeObjectURL(m.url));
    made = [];
    grid.innerHTML = '';
    results.hidden = true;
    zipBtn.hidden = true;
  }

  function setFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    picked = Array.from(list).filter(accept);
    reset();
    settings.hidden = picked.length === 0;
    countEl.textContent = picked.length > 0 ? `${picked.length}枚選択中` : '';
  }

  pickBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => setFiles(fileInput.files));

  ['dragenter', 'dragover'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('over'); }));
  dropzone.addEventListener('drop', (e) => setFiles((e as DragEvent).dataTransfer?.files ?? null));

  clearBtn.addEventListener('click', () => {
    picked = []; fileInput.value = ''; settings.hidden = true; countEl.textContent = ''; reset();
  });

  runBtn.addEventListener('click', async () => {
    if (picked.length === 0) return;
    reset();
    results.hidden = false;
    runBtn.disabled = true;
    const label = runBtn.textContent;

    for (let i = 0; i < picked.length; i++) {
      const file = picked[i];
      runBtn.textContent = `処理しています… ${i + 1} / ${picked.length}`;
      try {
        const res = await opts.convert(file, i, picked.length);
        for (const { blob, name, note } of Array.isArray(res) ? res : [res]) {
          const url = URL.createObjectURL(blob);
          made.push({ name, blob, url, before: file.size });

          const li = document.createElement('li');
          const thumb = blob.type.startsWith('image/')
            ? `<a href="${url}" download="${name}"><img src="${url}" alt="" width="120" height="120" loading="lazy"></a>`
            : '';
          const size = opts.showReduction
            ? `${formatBytes(file.size)} → ${formatBytes(blob.size)}（${reductionPercent(file.size, blob.size)}%減）`
            : formatBytes(blob.size);
          const extra = note ? `<span class="note">${note}</span>` : '';
          li.innerHTML = `${thumb}<span class="fn">${name}</span><span class="sz">${size}</span>${extra}`;
          grid.appendChild(li);
        }
      } catch (err) {
        const li = document.createElement('li');
        li.className = 'ng';
        const why = err instanceof Error && err.message ? err.message : 'この形式はこのブラウザで開けません';
        li.innerHTML = `<span class="fn">${file.name}</span><span class="sz">${why}</span>`;
        grid.appendChild(li);
      }
    }

    runBtn.textContent = label;
    runBtn.disabled = false;
    zipBtn.hidden = made.length === 0;
  });

  zipBtn.addEventListener('click', async () => {
    if (made.length === 0) return;
    const entries: Record<string, Uint8Array> = {};
    for (const m of made) entries[m.name] = new Uint8Array(await m.blob.arrayBuffer());
    // 画像は圧縮済みなので無圧縮で束ねる。速く、サイズもほぼ変わらない
    const zipped = zipSync(entries, { level: 0 });
    const url = URL.createObjectURL(new Blob([zipped as BlobPart], { type: 'application/zip' }));
    const a = document.createElement('a');
    a.href = url; a.download = opts.zipName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });

  return { getPicked: () => picked };
}

/** 画像を読み込んで、指定の寸法・形式で書き出す共通処理 */
export async function drawTo(
  file: File, width: number, height: number, mime: string, quality: number,
  paint?: (ctx: CanvasRenderingContext2D, bitmap: ImageBitmap, w: number, h: number) => void,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('この形式はこのブラウザで開けません');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas を使えません');
  ctx.imageSmoothingQuality = 'high';
  if (paint) paint(ctx, bitmap, width, height);
  else ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('書き出しに失敗しました'))), mime, quality));
}

/** 再エンコードせずバイト列を扱いたいとき */
export async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/** 画像の寸法だけ知りたいとき */
export async function readSize(file: File): Promise<{ width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('この形式はこのブラウザで開けません');
  }
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}
