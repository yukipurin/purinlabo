// PDFツールの文言。" " の中だけ書き換える。
const common = {
  button: "PDFを選ぶ",
  buttonNote: "選択したファイルは送信されません",
  clearButton: "選び直す",
  resultLabel: "できあがり",
  privacy: "処理はすべてブラウザ内で行います。PDFを受け取る仕組みがないため、外部に送信されることはありません。",
  aboutTitle: "製作者について",
  about: [
    "ぷりんラボ。ひとりでゲームアプリとWebツールを作っています。PDFを扱う大手のサービスはファイルを一度サーバーへ送りますが、ここでは送りません。仕組みとして持っていないためです。",
  ],
  aboutLinks: [
    { label: "ほかのPDFツール", url: "/tools/pdf/" },
    { label: "画像ツール", url: "/tools/image/" },
    { label: "X", url: "https://x.com/Purin_Labo" },
  ],
} as const;

export const pdfMerge = {
  ...common,
  seoTitle: "PDFを結合する（アップロード不要）",
  seoDescription: "複数のPDFを1つにまとめます。処理はすべてブラウザ内で行うため、ファイルが外部に送信されることはありません。登録不要。",
  title: "PDFを、送らずに結合する。",
  titleMark: "送らずに",
  lead: "複数のPDFを1つにまとめます。並べ替えてから結合できます。ファイルはこの端末から出ません。",
  dropTitle: "ここにPDFをドラッグ＆ドロップ",
  dropNote: "複数まとめて選べます",
  runButton: "結合する",
  stepsTitle: "使い方",
  steps: ["PDFをまとめてドラッグする", "↑↓で順番を決める", "結合してダウンロード"],
  limitsTitle: "できないこと・知っておくこと",
  limits: [
    "パスワードのかかったPDFは開けません。先に解除してください",
    "しおりや注釈は引き継がれないことがあります。ページの中身はそのまま残ります",
    "大きなPDFを何十個も一度に結合すると、ブラウザが重くなります",
    "文字の埋め込みや画像は再圧縮しません。結合しても中身の画質は変わりません",
  ],
} as const;

export const pdfSplit = {
  ...common,
  seoTitle: "PDFを分割する（アップロード不要）",
  seoDescription: "PDFを指定したページで切り出したり、決まったページ数ごとに分けたりします。処理はすべてブラウザ内で行います。登録不要。",
  title: "PDFを、必要なページだけに。",
  titleMark: "必要なページだけ",
  lead: "「1-3,7」のように指定して切り出すか、決まったページ数ごとに分けます。",
  dropTitle: "ここにPDFをドラッグ＆ドロップ",
  dropNote: "1つのファイルを分けます",
  runButton: "分割する",
  stepsTitle: "使い方",
  steps: ["PDFをドラッグする", "切り出し方を決める", "ダウンロード"],
  limitsTitle: "できないこと",
  limits: [
    "パスワードのかかったPDFは開けません",
    "ページの中身は編集できません。取り出すか、分けるかだけです",
    "指定は「1-3,7」「5-」のように書きます。全角の読点や波ダッシュも読みます",
  ],
} as const;

export const pdfRotate = {
  ...common,
  seoTitle: "PDFのページを回転・削除する（アップロード不要）",
  seoDescription: "PDFのページを90度ずつ回転させたり、いらないページを取り除いたりします。処理はすべてブラウザ内で行います。登録不要。",
  title: "向きを直して、いらない<br />ページを外す。",
  titleMark: "いらない",
  lead: "横向きに読み込まれたページを回します。白紙や不要なページを取り除くこともできます。",
  dropTitle: "ここにPDFをドラッグ＆ドロップ",
  dropNote: "1つのファイルを直します",
  runButton: "直す",
  stepsTitle: "使い方",
  steps: ["PDFをドラッグする", "回す角度と、外すページを決める", "ダウンロード"],
  limitsTitle: "できないこと",
  limits: [
    "パスワードのかかったPDFは開けません",
    "回すのは90度ずつです。斜めには回せません",
    "外したページは元に戻せません。元のファイルはそのまま残るので、必要なら取り直してください",
  ],
} as const;

export const pdfExtract = {
  ...common,
  seoTitle: "PDFから1ページずつ取り出す（アップロード不要）",
  seoDescription: "PDFを1ページごとのファイルに分けて書き出します。処理はすべてブラウザ内で行います。登録不要。",
  title: "PDFを、1ページずつに分ける。",
  titleMark: "1ページずつ",
  lead: "全ページを1枚ずつのPDFにします。必要なページだけを選ぶこともできます。",
  dropTitle: "ここにPDFをドラッグ＆ドロップ",
  dropNote: "1つのファイルを分けます",
  runButton: "1ページずつにする",
  stepsTitle: "使い方",
  steps: ["PDFをドラッグする", "取り出すページを決める（空欄なら全部）", "1つずつダウンロード"],
  limitsTitle: "できないこと",
  limits: [
    "パスワードのかかったPDFは開けません",
    "ZIPにはまとめません。1つずつダウンロードしてください",
    "ページ数が多いと、その数だけファイルができます。100ページなら100個です",
  ],
} as const;
