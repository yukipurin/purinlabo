// ============================================================
//  Webツール一覧（ /tools/ ）の文言
//
//  ツールを1本足す＝ tools 配列に1行足して、同名のページを作る。
//  ready: false のあいだは「準備中」の欄に並ぶ。
//  " " の中だけ書き換える。行末のカンマは消さない。
// ============================================================

export const toolsPage = {
  label: "Tools",
  title: "Webツール",
  lead:
    "便利だな、と思ったツールを公開していきます。登録もインストールも要りません。" +
    "処理はすべてブラウザ内で行うため、ファイルが外部に送信されることはありません。",
  soonLabel: "Coming",
  soonTitle: "準備中",
  cta: "使ってみる",
} as const;

export type Tool = {
  slug: string;
  name: string;
  lead: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
  ready: boolean;
};

export const tools: Tool[] = [
  {
    slug: 'square',
    name: '出品写真をまとめて正方形にする',
    lead: 'メルカリ・ヤフオク・BASEのサイズにそろえます。',
    body: '複数枚をまとめて1080×1080にそろえます。余白は白で埋めるか、正方形に切り抜くかを選べます。連番でのリネームとZIPでの書き出しに対応しています。写真はブラウザ内で処理します。',
    image: '/img/tools/square-before-after.webp',
    imageAlt: '縦横比のばらばらな写真が、すべて同じ正方形にそろう様子',
    imageCaption: 'もとの写真（左）を、1080×1080にそろえる（右）',
    ready: true,
  },
  { slug: 'resize', name: '画像を一括リサイズ', ready: false,
    lead: '長辺を指定して、比率を保ったまままとめて縮小します。' },
  { slug: 'compress', name: '画像を軽くする', ready: false,
    lead: '目標のファイルサイズを指定すると、画質を自動で調整します。' },
  { slug: 'heic', name: 'HEICをJPGに変換', ready: false,
    lead: 'iPhoneで撮った写真を、Windowsでも開ける形式にまとめて変換します。' },
  { slug: 'rename', name: '連番でリネームしてZIP', ready: false,
    lead: '商品ごとに01、02と番号を振り直して、まとめて書き出します。' },
];
