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
  // カテゴリ一覧に出す一言。増えたら書き換える
  onlyOneCategory: "いまは画像だけです。どれが使われるかを見てから、次のジャンルを決めます。",
} as const;

export type Tool = {
  slug: string;
  name: string;
  /** 一覧に出す短い名前。長い正式名だと並べたときに読みにくいため */
  short: string;
  lead: string;
  body?: string;
  image: string;
  imageAlt: string;
  /** 大分類。/tools/<category>/ のページに並ぶ */
  category: string;
  /** カテゴリページ内での小見出し */
  group: (typeof GROUPS)[number];
  ready: boolean;
};

export const GROUPS = ['出品の写真', 'サイズと形式', 'アイコンを作る',
  '字幕を整える', '字幕を変換する'] as const;

/**
 * ツールの大分類。ジャンルが増えたらここに1行足して、/tools/<slug>/ のページを作る。
 * 各ツールのURLは /tools/<ツールのslug>/ のまま変えない（変えると検索の評価を失うため）。
 */
export type Category = {
  slug: string;
  name: string;
  lead: string;
  /** 一覧に並べる代表的な図（そのカテゴリのツールから3枚） */
  thumbs: string[];
  ready: boolean;
};

export const categories: Category[] = [
  {
    slug: 'image',
    name: '画像',
    lead: 'リサイズ、圧縮、形式の変換、EXIFの削除、アイコンの書き出し。出品写真やサイトの素材を整えるための道具です。',
    thumbs: [
      '/img/tools/square-before-after.webp',
      '/img/tools/compress.webp',
      '/img/tools/favicon.webp',
    ],
    ready: true,
  },
  {
    slug: 'subtitle',
    name: '字幕',
    lead: 'SRTとVTTの変換、タイミングのずらし、本文の取り出し。それと、読みきれるかどうかの検査。動画に字幕をつける作業のための道具です。',
    thumbs: [
      '/img/tools/subtitle-check.webp',
      '/img/tools/subtitle-shift.webp',
      '/img/tools/subtitle-text.webp',
    ],
    ready: true,
  },
];

export const tools: Tool[] = [
  {
    slug: 'square', short: '正方形にする',
    name: '出品写真をまとめて正方形にする',
    lead: 'メルカリ・ヤフオク・BASEのサイズにそろえます。',
    body: '複数枚をまとめて1080×1080にそろえます。余白は白で埋めるか、正方形に切り抜くかを選べます。連番でのリネームとZIPでの書き出しに対応しています。写真はブラウザ内で処理します。',
    image: '/img/tools/square-before-after.webp',
    imageAlt: '縦横比のばらばらな写真が、すべて同じ正方形にそろう様子',
    category: 'image', group: '出品の写真', ready: true,
  },
  {
    slug: 'exif', short: 'EXIFを消す',
    name: '画像のEXIF・位置情報を削除',
    lead: '撮影日時・カメラ情報・位置情報だけを取り除きます。',
    body: '画素には触れず、情報の区画だけをバイト列から外します。描き直さないので画質は1ドットも変わりません。色を正しく表示するためのICCプロファイルは残します。',
    image: '/img/tools/exif.webp',
    imageAlt: '写真にぶら下がったEXIF・GPS・撮影日時の情報が外れ、画素はそのまま残る様子',
    category: 'image', group: '出品の写真', ready: true,
  },
  {
    slug: 'rename', short: '連番でリネーム',
    name: '画像を連番でリネームしてZIP',
    lead: '接頭辞と開始番号を決めると、01、02…と振り直します。',
    body: '画像は再圧縮しないので画質はそのままです。並び順は選んだ順・ファイル名順・更新日時順から選べます。',
    image: '/img/tools/rename.webp',
    imageAlt: 'ばらばらなファイル名が、連番の名前に振り直される様子',
    category: 'image', group: '出品の写真', ready: true,
  },
  {
    slug: 'resize', short: 'リサイズ',
    name: '画像を一括リサイズ',
    lead: '長辺のピクセル数を決めると、比率を保ったまま縮小します。',
    body: 'JPG・PNG・WebPで書き出せます。初期設定では元より大きくしません。',
    image: '/img/tools/resize.webp',
    imageAlt: '大きな画像が、比率を保ったまま小さくなる様子',
    category: 'image', group: 'サイズと形式', ready: true,
  },
  {
    slug: 'compress', short: '軽くする',
    name: '画像を軽くする',
    lead: '目標のファイルサイズを決めると、自動で収めます。',
    body: '画質を、それでも届かなければ寸法を自動で調整します。縮小したときは結果にその寸法を出します。',
    image: '/img/tools/compress.webp',
    imageAlt: '同じ見た目のまま、ファイルサイズだけが小さくなる様子',
    category: 'image', group: 'サイズと形式', ready: true,
  },
  {
    slug: 'convert', short: '形式を変換',
    name: '画像の形式を変換（JPG・PNG・WebP）',
    lead: 'JPG・PNG・WebPを相互に変換します。',
    body: 'WebPにすると、同じ見た目のままファイルが小さくなります。透過の扱いも選べます。',
    image: '/img/tools/convert.webp',
    imageAlt: 'PNG・JPG・WebPが相互に変換できることを示す図',
    category: 'image', group: 'サイズと形式', ready: true,
  },
  {
    slug: 'heic', short: 'HEIC→JPG',
    name: 'HEICをJPGに変換',
    lead: 'iPhoneで撮った写真を、Windowsでも開ける形式にします。',
    body: 'HEICを開けるのは Safari だけです。iPhoneのSafariでも動きます。',
    image: '/img/tools/heic.webp',
    imageAlt: '開けないHEICが、どこでも開けるJPGになる様子',
    category: 'image', group: 'サイズと形式', ready: true,
  },
  {
    slug: 'favicon', short: 'ファビコン',
    name: 'ファビコンを作る',
    lead: '1枚の画像から、必要なサイズをまとめて書き出します。',
    body: '16 / 32 / 48 / 180 / 192 / 512 px を一度に。ZIPで受け取れます。',
    image: '/img/tools/favicon.webp',
    imageAlt: '1枚の画像から、512pxから16pxまでの正方形が書き出される様子',
    category: 'image', group: 'アイコンを作る', ready: true,
  },
  {
    slug: 'appicon', short: 'アプリアイコン',
    name: 'アプリアイコンのサイズを一括生成',
    lead: 'App Store と Google Play に必要なサイズを一度に。',
    body: '1024pxの画像を1枚入れるだけです。透過を白で埋めるかどうかも選べます。',
    image: '/img/tools/appicon.webp',
    imageAlt: '1枚の画像から、App StoreとGoogle Playに必要なサイズが書き出される様子',
    category: 'image', group: 'アイコンを作る', ready: true,
  },
  {
    slug: 'subtitle-check', short: '文字数チェック',
    name: '字幕の文字数・表示速度をチェック',
    lead: '読みきれない字幕を洗い出します。',
    body: '1行の文字数、行数、表示時間、読む速さ、前後の重なりを一度に検査します。目安の値は変えられます。',
    image: '/img/tools/subtitle-check.webp',
    imageAlt: '長すぎる行や速すぎる字幕が指摘される様子',
    category: 'subtitle', group: '字幕を整える', ready: true,
  },
  {
    slug: 'subtitle-shift', short: 'タイミングをずらす',
    name: '字幕のタイミングをずらす',
    lead: '全体の時刻をまとめて前後にずらします。',
    body: '再生速度を変えた動画に合わせて、倍率でのばすこともできます。',
    image: '/img/tools/subtitle-shift.webp',
    imageAlt: '字幕全体の時刻がまとめて後ろにずれる様子',
    category: 'subtitle', group: '字幕を整える', ready: true,
  },
  {
    slug: 'subtitle-convert', short: 'SRT⇄VTT',
    name: 'SRTとVTTを相互変換',
    lead: '字幕ファイルの形式を変換します。',
    body: '時刻と本文を移します。位置や色の指定は引き継がれません。',
    image: '/img/tools/subtitle-convert.webp',
    imageAlt: 'SRTとVTTが相互に変換できることを示す図',
    category: 'subtitle', group: '字幕を変換する', ready: true,
  },
  {
    slug: 'subtitle-text', short: '本文だけ取り出す',
    name: '字幕から本文だけを取り出す',
    lead: '番号と時刻を外して、中身だけにします。',
    body: '台本や動画の説明欄の下書きに使えます。字幕の中の改行をつなげるかどうかも選べます。',
    image: '/img/tools/subtitle-text.webp',
    imageAlt: '番号と時刻が落ちて、本文だけが残る様子',
    category: 'subtitle', group: '字幕を変換する', ready: true,
  },
];
