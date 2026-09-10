/**
 * 複数ファイルを並べて扱うツールの配線（PDFなど）。
 * 順番の入れ替えと、ページ数の表示に対応する。
 * 処理はすべてブラウザ内で完結する。
 */
import { formatBytes } from './image';

export type Loaded = { file: File; pages?: number; error?: string };
export type Made = { name: string; blob: Blob; note?: string };

export type FileRunnerOptions = {
  /** 読み込んだ直後に呼ばれる。ページ数を返すと一覧に出る */
  inspect?: (file: File) => Promise<number>;
  /** 実行。読み込んだ順に並んだファイルを受け取る */
  run: (files: Loaded[]) => Promise<Made[]>;
  /** 並べ替えを見せるか（結合だけ必要） */
  reorderable?: boolean;
  accept?: (file: File) => boolean;
};

export function setupFileTool(opts: FileRunnerOptions) {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const dropzone = $<HTMLDivElement>('dropzone');
  const fileInput = $<HTMLInputElement>('file');
  const list = $<HTMLUListElement>('filelist');
  const settings = $<HTMLDivElement>('settings');
  const results = $<HTMLElement>('results');
  const grid = $<HTMLUListElement>('grid');
  const runBtn = $<HTMLButtonElement>('run');
  const countEl = $<HTMLSpanElement>('count');

  let loaded: Loaded[] = [];
  const urls: string[] = [];
  const accept = opts.accept ?? ((f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name));

  function render() {
    list.innerHTML = '';
    loaded.forEach((l, i) => {
      const li = document.createElement('li');
      if (l.error) li.className = 'ng';
      const pages = l.error ? l.error : l.pages !== undefined ? `${l.pages} ページ` : '';
      li.innerHTML =
        (opts.reorderable
          ? `<button class="mv" type="button" data-up="${i}" ${i === 0 ? 'disabled' : ''} aria-label="上へ">↑</button>
             <button class="mv" type="button" data-down="${i}" ${i === loaded.length - 1 ? 'disabled' : ''} aria-label="下へ">↓</button>`
          : '') +
        `<span class="nm">${l.file.name}</span><span class="pg">${pages}</span>`;
      list.appendChild(li);
    });
    settings.hidden = loaded.length === 0;
    const ok = loaded.filter((l) => !l.error).length;
    countEl.textContent = ok > 0 ? `${ok}個のファイル` : '';
  }

  list.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.mv') as HTMLButtonElement | null;
    if (!btn) return;
    const up = btn.dataset.up, down = btn.dataset.down;
    const i = Number(up ?? down);
    const j = up !== undefined ? i - 1 : i + 1;
    if (j < 0 || j >= loaded.length) return;
    [loaded[i], loaded[j]] = [loaded[j], loaded[i]];
    render();
  });

  async function add(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (!accept(f)) continue;
      const entry: Loaded = { file: f };
      if (opts.inspect) {
        try { entry.pages = await opts.inspect(f); }
        catch { entry.error = '読み込めませんでした'; }
      }
      loaded.push(entry);
    }
    render();
  }

  $<HTMLButtonElement>('pick').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => add(fileInput.files));
  ['dragenter', 'dragover'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove('over'); }));
  dropzone.addEventListener('drop', (e) => add((e as DragEvent).dataTransfer?.files ?? null));

  $<HTMLButtonElement>('clear').addEventListener('click', () => {
    loaded = []; fileInput.value = '';
    urls.splice(0).forEach((u) => URL.revokeObjectURL(u));
    grid.innerHTML = ''; results.hidden = true; render();
  });

  runBtn.addEventListener('click', async () => {
    const usable = loaded.filter((l) => !l.error);
    if (usable.length === 0) return;
    runBtn.disabled = true;
    const label = runBtn.textContent;
    runBtn.textContent = '処理しています…';
    grid.innerHTML = '';
    urls.splice(0).forEach((u) => URL.revokeObjectURL(u));

    try {
      const made = await opts.run(usable);
      for (const m of made) {
        const url = URL.createObjectURL(m.blob);
        urls.push(url);
        const li = document.createElement('li');
        li.innerHTML = `<span class="nm">${m.name}</span>` +
          `<span class="sz">${formatBytes(m.blob.size)}${m.note ? ` ／ ${m.note}` : ''}</span>` +
          `<a class="dl" href="${url}" download="${m.name}">ダウンロード</a>`;
        grid.appendChild(li);
      }
      results.hidden = made.length === 0;
    } catch (err) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="nm" style="color:var(--stamp)">${
        err instanceof Error ? err.message : '処理できませんでした'}</span>`;
      grid.appendChild(li);
      results.hidden = false;
    }
    runBtn.textContent = label;
    runBtn.disabled = false;
  });

  return { get: () => loaded };
}
