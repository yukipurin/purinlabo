// ============================================================
//  画像ツール4本の文言
//  " " の中だけ書き換える。行末のカンマは消さない。
// ============================================================

const common = {
  button: "写真を選ぶ",
  buttonNote: "選択したファイルは送信されません",
  clearButton: "選び直す",
  resultHeading: "できあがり",
  downloadZip: "ZIPでまとめてダウンロード",
  privacy: "処理はすべてブラウザ内で行います。写真を受け取る仕組みがないため、外部に送信されることはありません。",
  aboutTitle: "製作者について",
  about: [
    "ぷりんラボ。ひとりでゲームアプリとWebツールを作っています。YouTubeでは異世界ケルト音楽の作業用BGMを公開しています。",
  ],
  aboutLinks: [
    { label: "ほかのツール", url: "/tools/" },
    { label: "ゲーム・アプリ", url: "/games/" },
    { label: "X", url: "https://x.com/Purin_Labo" },
  ],
} as const;

export const resize = {
  ...common,
  seoTitle: "画像を一括リサイズ",
  seoDescription: "長辺のピクセル数を決めて、複数の画像をまとめて縮小します。比率は保たれます。アップロード不要・登録不要で、処理はブラウザ内で完結します。",
  title: "画像を、まとめて小さく。",
  titleMark: "まとめて小さく",
  lead: "長辺のピクセル数を決めると、比率を保ったまま縮小します。何枚でも添付可能。",
  dropTitle: "ここに写真をドラッグ＆ドロップ",
  dropNote: "JPG / PNG / WebP / HEIC に対応",
  runButton: "リサイズする",
  stepsTitle: "使い方",
  steps: [
    "写真をドラッグするか、「写真を選ぶ」から選択",
    "長辺のピクセル数と書き出す形式を決める",
    "ダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "初期設定では元より大きくしません。拡大したい場合はチェックを入れてください",
    "縦横の比率は変えられません。正方形にしたい場合は別のツールを使ってください",
    "HEICはブラウザによっては開けません（Safariは対応）",
    "100枚を超えると動作が重くなります",
  ],
} as const;

export const compress = {
  ...common,
  seoTitle: "画像を軽くする",
  seoDescription: "目標のファイルサイズを決めると、画質を自動で調整して収めます。アップロード不要・登録不要で、処理はブラウザ内で完結します。",
  title: "画像を、目標のサイズまで軽く。",
  titleMark: "目標のサイズ",
  lead: "目標のファイルサイズを決めると、画質を、それでも届かなければ寸法を自動で調整して収めます。",
  dropTitle: "ここに写真をドラッグ＆ドロップ",
  dropNote: "JPG / PNG / WebP / HEIC に対応",
  runButton: "軽くする",
  stepsTitle: "使い方",
  steps: [
    "写真をドラッグするか、「写真を選ぶ」から選択",
    "目標のファイルサイズを決める",
    "ダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "画質を下げても目標に届かない場合は、寸法を自動で縮小して収めにいきます。縮小したときは結果にその寸法を出します",
    "それでも届かない場合は「目標に届きませんでした」と表示し、いちばん小さくなったものを渡します",
    "PNGは画質の調整ができないため、JPGかWebPで書き出します",
    "HEICはブラウザによっては開けません（Safariは対応）",
  ],
} as const;

export const heic = {
  ...common,
  seoTitle: "HEICをJPGに変換",
  seoDescription: "iPhoneで撮ったHEICの写真を、WindowsでもそのままひらけるJPGにまとめて変換します。アップロード不要・登録不要。",
  title: "HEICを、まとめてJPGに。",
  titleMark: "まとめてJPG",
  lead: "iPhoneで撮った写真を、Windowsでもそのまま開ける形式に変換します。何枚でも添付可能。",
  dropTitle: "ここにHEICをドラッグ＆ドロップ",
  dropNote: "HEIC / HEIF に対応",
  runButton: "JPGに変換する",
  stepsTitle: "使い方",
  steps: [
    "写真をドラッグするか、「写真を選ぶ」から選択",
    "書き出す形式と画質を決める",
    "ダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "HEICを開けるのは Safari だけです。Chrome や Edge では読み込めません",
    "iPhoneのSafariでも動きます。パソコンが無い場合はそちらで開いてください",
    "撮影日時などの情報は引き継がれません",
    "変換後のファイルは元より大きくなることがあります",
  ],
} as const;

export const rename = {
  ...common,
  seoTitle: "画像を連番でリネームしてZIP",
  seoDescription: "複数の画像に01、02と番号を振り直して、ZIPでまとめて書き出します。画質はそのまま。アップロード不要・登録不要。",
  title: "画像を、連番で名前をつけ直す。",
  titleMark: "連番で名前",
  lead: "接頭辞と開始番号を決めると、01、02…と振り直してZIPにまとめます。画像は再圧縮しないので画質はそのままです。",
  dropTitle: "ここに写真をドラッグ＆ドロップ",
  dropNote: "画像ならどの形式でも",
  runButton: "名前をつけ直す",
  stepsTitle: "使い方",
  steps: [
    "写真をドラッグするか、「写真を選ぶ」から選択",
    "接頭辞、開始番号、並び順を決める",
    "ZIPでダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "並び順は「選んだ順」「ファイル名順」「更新日時順」から選べます。撮影日時では並べ替えられません",
    "画像は再圧縮しないので、拡張子は元のままになります",
    "1枚ずつ好きな名前をつけることはできません",
  ],
} as const;

export const convert = {
  ...common,
  seoTitle: "画像の形式を変換（JPG・PNG・WebP）",
  seoDescription: "JPG・PNG・WebPを相互に変換します。WebPにすると同じ見た目のままファイルが小さくなります。アップロード不要・登録不要で、処理はブラウザ内で完結します。",
  title: "画像の形式を、まとめて変換。",
  titleMark: "まとめて変換",
  lead: "JPG・PNG・WebPを相互に変換します。WebPにすると、同じ見た目のままファイルが小さくなります。",
  dropTitle: "ここに画像をドラッグ＆ドロップ",
  dropNote: "JPG / PNG / WebP / HEIC に対応",
  runButton: "変換する",
  stepsTitle: "使い方",
  steps: [
    "画像をドラッグするか、「写真を選ぶ」から選択",
    "書き出す形式と画質を決める",
    "ダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "JPGは透過を持てません。透過のあるPNGをJPGにすると、透けていた部分は白で埋まります",
    "PNGは画質の調整ができません。写真をPNGにするとファイルが大きくなります",
    "HEICを開けるのは Safari だけです",
    "GIFのアニメーションは1枚目だけになります",
  ],
} as const;

export const exif = {
  ...common,
  seoTitle: "画像のEXIF・位置情報を削除",
  seoDescription: "写真に埋め込まれた撮影日時・カメラ情報・位置情報を取り除きます。画素には触れないので画質は変わりません。アップロード不要・登録不要。",
  title: "写真の見えない情報を、消す。",
  titleMark: "見えない情報",
  lead: "撮影日時、カメラの機種、位置情報などが写真に埋め込まれています。それだけを取り除きます。画質は変わりません。",
  dropTitle: "ここに写真をドラッグ＆ドロップ",
  dropNote: "JPG / PNG に対応",
  runButton: "情報を消す",
  stepsTitle: "使い方",
  steps: [
    "写真をドラッグするか、「写真を選ぶ」から選択",
    "「情報を消す」を押す",
    "ダウンロード",
  ],
  limitsTitle: "できないこと・知っておくこと",
  limits: [
    "画素のデータには触れません。描き直さずに情報の区画だけを外すので、画質は1ドットも変わりません",
    "色を正しく表示するためのICCプロファイルは残します",
    "対応しているのはJPGとPNGだけです。WebPやHEICはそのまま返します",
    "メルカリやX、Instagramなどの大手は、投稿時に自分でこの情報を取り除いています。必要になるのは、自分のネットショップやブログに直接載せる場合です",
  ],
} as const;

export const favicon = {
  ...common,
  seoTitle: "ファビコンを作る",
  seoDescription: "1枚の画像から、サイトに必要なファビコンのサイズを一度に書き出します。16pxから512pxまで。アップロード不要・登録不要。",
  title: "1枚から、ファビコンを<br />ぜんぶ書き出す。",
  titleMark: "ファビコン",
  lead: "正方形の画像を1枚入れると、ブラウザのタブやスマホのホーム画面に必要なサイズをまとめて書き出します。",
  dropTitle: "ここに画像をドラッグ＆ドロップ",
  dropNote: "正方形の PNG がおすすめ",
  runButton: "ファビコンを作る",
  stepsTitle: "使い方",
  steps: [
    "正方形の画像をドラッグするか、「写真を選ぶ」から選択",
    "「ファビコンを作る」を押す",
    "ZIPでダウンロードして、サイトのルートに置く",
  ],
  limitsTitle: "できないこと",
  limits: [
    "書き出すのはPNGです。.ico 形式は作れません。いまのブラウザはPNGで足ります",
    "正方形でない画像は、余白を透明で足して正方形にします",
    "小さいサイズは細部が潰れます。16pxでも読める形かどうかは、書き出したものを見て判断してください",
  ],
} as const;

export const appicon = {
  ...common,
  seoTitle: "アプリアイコンのサイズを一括生成",
  seoDescription: "1枚の画像から、App Store と Google Play に必要なアイコンのサイズをまとめて書き出します。アップロード不要・登録不要。",
  title: "1枚から、アプリアイコンを<br />ぜんぶ書き出す。",
  titleMark: "アプリアイコン",
  lead: "1024pxの画像を1枚入れると、App Store と Google Play に必要なサイズをまとめて書き出します。",
  dropTitle: "ここに画像をドラッグ＆ドロップ",
  dropNote: "1024×1024 の PNG がおすすめ",
  runButton: "アイコンを書き出す",
  stepsTitle: "使い方",
  steps: [
    "1024pxの正方形の画像を選択",
    "透過を残すかどうかを決める",
    "ZIPでダウンロード",
  ],
  limitsTitle: "できないこと",
  limits: [
    "App Store に出すアイコンは透過を持てません。「透過を白で埋める」を選んでください",
    "角丸はストア側で自動的に付きます。自分で丸くする必要はありません",
    "Xcode の AppIcon.appiconset の形にはまとめません。書き出したPNGを手で入れてください",
    "正方形でない画像は、余白を足して正方形にします",
  ],
} as const;
