/**
 * 文字を扱うツール共通の配線。入力の受け取り・実行・結果の書き出し。
 * 処理はすべてブラウザ内で完結する。文字を外へ送る経路はここに存在しない。
 */

export type TextResult = {
  /** 結果の本文。空なら出力欄を隠す */
  text?: string;
  /** 結果の上に出す説明（検査の結果など）。HTMLを渡す */
  reportHtml?: string;
  /** 書き出すファイル名 */
  fileName?: string;
};

export type TextRunnerOptions = {
  run: (input: string) => TextResult;
  /** 読み込んだファイル名から、書き出すファイル名を決める */
  defaultFileName?: string;
};

export function setupTextTool(opts: TextRunnerOptions) {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

  const input = $<HTMLTextAreaElement>('input');
  const output = $<HTMLTextAreaElement>('output');
  const results = $<HTMLElement>('results');
  const report = $<HTMLDivElement>('report');
  const runBtn = $<HTMLButtonElement>('run');
  const countEl = $<HTMLSpanElement>('count');
  const fileInput = document.getElementById('file') as HTMLInputElement | null;
  const pickBtn = document.getElementById('pick');

  let sourceName = '';

  const updateCount = () => {
    const n = input.value.length;
    countEl.textContent = n > 0 ? `${n.toLocaleString()} 文字` : '';
  };
  input.addEventListener('input', updateCount);

  pickBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    sourceName = f.name;
    input.value = await f.text();
    updateCount();
  });

  // ファイルをそのまま放り込めるようにする
  input.addEventListener('dragover', (e) => e.preventDefault());
  input.addEventListener('drop', async (e) => {
    const f = (e as DragEvent).dataTransfer?.files?.[0];
    if (!f) return;
    e.preventDefault();
    sourceName = f.name;
    input.value = await f.text();
    updateCount();
  });

  $<HTMLButtonElement>('clear').addEventListener('click', () => {
    input.value = ''; output.value = ''; report.innerHTML = '';
    results.hidden = true; sourceName = ''; updateCount();
    if (fileInput) fileInput.value = '';
  });

  runBtn.addEventListener('click', () => {
    if (input.value.trim() === '') return;
    try {
      const r = opts.run(input.value);
      report.innerHTML = r.reportHtml ?? '';
      output.value = r.text ?? '';
      output.hidden = !r.text;
      $<HTMLButtonElement>('download').hidden = !r.text;
      $<HTMLButtonElement>('copy').hidden = !r.text;
      results.hidden = false;
      (results as HTMLElement).dataset.name = r.fileName ?? opts.defaultFileName ?? 'output.txt';
    } catch (err) {
      report.innerHTML = `<p class="ok" style="color:var(--stamp)">${
        err instanceof Error ? err.message : '読み込めませんでした'}</p>`;
      output.value = ''; output.hidden = true;
      $<HTMLButtonElement>('download').hidden = true;
      $<HTMLButtonElement>('copy').hidden = true;
      results.hidden = false;
    }
  });

  $<HTMLButtonElement>('download').addEventListener('click', () => {
    const name = (results as HTMLElement).dataset.name ?? 'output.txt';
    const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  });

  $<HTMLButtonElement>('copy').addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    const tag = $<HTMLSpanElement>('copied');
    tag.hidden = false;
    setTimeout(() => { tag.hidden = true; }, 1600);
  });

  return { getSourceName: () => sourceName };
}

/** 拡張子を差し替える */
export function withExtension(name: string, ext: string, fallback: string): string {
  if (!name) return fallback;
  const i = name.lastIndexOf('.');
  return `${i > 0 ? name.slice(0, i) : name}.${ext}`;
}

/** HTMLに埋め込む文字を安全にする */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}
