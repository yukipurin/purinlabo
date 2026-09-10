// テキストツールの文言。" " の中だけ書き換える。
const common = {
  inputLabel: "文章",
  clearButton: "消す",
  copyButton: "コピーする",
  privacy: "処理はすべてブラウザ内で行います。文章を受け取る仕組みがないため、外部に送信されることはありません。",
  aboutTitle: "製作者について",
  about: ["ぷりんラボ。ひとりでゲームアプリとWebツールを作っています。自分の作業で必要になったものを整えて置いています。"],
  aboutLinks: [
    { label: "ほかのテキストツール", url: "/tools/text/" },
    { label: "画像ツール", url: "/tools/image/" },
    { label: "X", url: "https://x.com/Purin_Labo" },
  ],
} as const;

export const textCount = {
  ...common,
  seoTitle: "文字数カウントと投稿先ごとの上限チェック",
  seoDescription: "文字数・行数・段落数を数えて、X・Instagram・YouTube・メルカリ・meta descriptionの上限に収まるかを同時に判定します。アップロード不要・登録不要。",
  title: "その文章、どこまで<br />入りますか。",
  titleMark: "どこまで",
  lead: "文字数を数えるだけでなく、X・Instagram・YouTube・メルカリ・検索結果の上限に収まるかを同時に見ます。",
  placeholder: "ここに文章を貼り付けてください。",
  runButton: "数える",
  resultLabel: "結果",
  downloadButton: "結果をテキストで保存",
  stepsTitle: "使い方",
  steps: ["文章を貼り付ける", "数える", "収まっていない投稿先があれば減らす"],
  limitsTitle: "できないこと・知っておくこと",
  limits: [
    "Xの140字はURLを11.5字ぶんとして数えます。ここでは実際の文字数で数えるので、URLを含む文章はXの表示と少しずれます",
    "meta descriptionとページタイトルの数字は、検索結果で切られない長さの目安です。決まった上限ではありません",
    "各サービスの上限は変わることがあります。最後は投稿画面で確かめてください",
    "文字数は記号や空白も1文字として数えます",
  ],
} as const;

export const textConvert = {
  ...common,
  seoTitle: "全角半角・大文字小文字・かなカナを変換",
  seoDescription: "全角と半角、大文字と小文字、ひらがなとカタカナをまとめて変換します。英数だけの変換にも対応。アップロード不要・登録不要。",
  title: "全角と半角を、まとめて揃える。",
  titleMark: "まとめて揃える",
  lead: "全角半角、大文字小文字、ひらがなカタカナ。表記のゆれをまとめて直します。",
  placeholder: "ここに文章を貼り付けてください。",
  runButton: "変換する",
  resultLabel: "変換した文章",
  downloadButton: "テキストで保存",
  stepsTitle: "使い方",
  steps: ["文章を貼り付ける", "どう変換するかを選ぶ", "コピーするか保存する"],
  limitsTitle: "できないこと",
  limits: [
    "漢字はそのままです。読みを変えることはできません",
    "半角カナは全角カナに変換しません。文字の対応が1対1にならない場合があるためです",
    "「英数だけ」を選ぶと、記号と空白は変換しません",
  ],
} as const;

export const textLines = {
  ...common,
  seoTitle: "重複行の削除・並べ替え・番号ふり",
  seoDescription: "行の重複を消す、空行を消す、並べ替える、番号をふる、前後に文字を足す。リストの整理をまとめて行います。アップロード不要・登録不要。",
  title: "行を、まとめて整える。",
  titleMark: "まとめて整える",
  lead: "重複を消す、空行を消す、並べ替える、番号をふる。リストの整理をまとめて行います。",
  placeholder: "1行に1つずつ書いた文章を貼り付けてください。",
  runButton: "整える",
  resultLabel: "整えた文章",
  downloadButton: "テキストで保存",
  stepsTitle: "使い方",
  steps: ["1行に1つずつ書いた文章を貼り付ける", "やることを選ぶ", "コピーするか保存する"],
  limitsTitle: "できないこと",
  limits: [
    "重複を消すときは、最初に出てきたものを残します",
    "並べ替えは日本語の並び順です。漢字は読みではなく文字の順で並びます",
    "処理の順番は「前後の空白を落とす → 空行を消す → 重複を消す → 並べ替え → 前後に足す → 番号」で固定です",
  ],
} as const;

export const textNewline = {
  ...common,
  seoTitle: "改行コードを変換（CRLF・LF）",
  seoDescription: "WindowsのCRLFとMac・LinuxのLFを相互に変換します。混ざっているかどうかも判定します。アップロード不要・登録不要。",
  title: "改行コードを、揃える。",
  titleMark: "揃える",
  lead: "WindowsのCRLFとMac・LinuxのLFを揃えます。混ざっているかどうかも見ます。",
  placeholder: "ここに文章を貼り付けるか、テキストファイルをドラッグしてください。",
  runButton: "揃える",
  resultLabel: "揃えた文章",
  downloadButton: "テキストで保存",
  fileHint: "テキストファイルを、この欄に直接ドラッグしても読み込めます。",
  stepsTitle: "使い方",
  steps: ["文章を貼り付けるか、ファイルを読み込む", "揃える先を選ぶ", "保存する"],
  limitsTitle: "できないこと",
  limits: [
    "文字コードは変換しません。UTF-8のまま書き出します",
    "貼り付けた場合、ブラウザが改行を揃えてしまうことがあります。正確に見たいときはファイルを読み込んでください",
    "行の中の文字はいっさい変えません",
  ],
} as const;
