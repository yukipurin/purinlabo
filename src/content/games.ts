// ゲーム・アプリの紹介データ。
// 画像は public/img/games/<slug>-icon.webp と <slug>-1..3.webp（App Storeの掲載画像を取得したもの）。
// ストアのIDやリンクは推測で書かない。iTunes Search API で確認したものだけを載せる。

export type Game = {
  slug: string;
  name: string;
  lead: string;          // 一言
  body: string;          // 紹介
  shots: number;         // 用意してあるスクショの枚数
  appStore?: string;
  googlePlay?: string;
  soon?: boolean;
};

export const games: Game[] = [
  {
    slug: 'fishing',
    name: 'のんびり異世界釣りゲーム 〜幻の魚図鑑〜',
    lead: '手がかりを読んで、幻の魚を見立てる。',
    body: '水面に映る影の形、動きの速さ、時間帯。手がかりを読んでから釣り上げます。反射神経ではなく推理で釣る釣りゲームです。釣った魚は図鑑に並び、装備を替えると狙える魚が変わります。',
    shots: 3,
    appStore: 'https://apps.apple.com/jp/app/id6796961427',
  },
  {
    slug: 'gohenkan',
    name: '誤変換大戦',
    lead: '「こうげき」と打ったのに、出てきたのは「公的」。',
    body: '壊れたIMEで魔王に挑む、言葉のバカゲーです。勇者は剣を抜くかわりに住民票を要求しはじめます。変換ミスで世界が暴走し、その結末を集めていきます。',
    shots: 3,
    appStore: 'https://apps.apple.com/jp/app/id6787645238',
  },
  {
    slug: 'sousei',
    name: '創世のマナ',
    lead: '虚無に呑まれた世界に、ひとつだけ灯をともす。',
    body: 'タップと放置でマナを集め、滅びた世界を創り直す放置ゲームです。無から森が生まれ、海が満ち、文明が育ちます。見習い魔導士のリオナが案内役です。',
    shots: 2,
    appStore: 'https://apps.apple.com/jp/app/id6780463661',
    googlePlay: 'https://play.google.com/store/apps/details?id=com.purinlabo.souseinomana',
  },
  {
    slug: 'kotoba',
    name: 'ことば仕分け帳',
    lead: '「暑い」「熱い」「厚い」、ちゃんと仕分けられる？',
    body: '日本語の言葉を正しい棚に仕分ける、短時間のパズルです。同じ読みの言葉、敬語、メール表現、慣用句を扱います。1回が短いので、待ち時間に向いています。',
    shots: 3,
    appStore: 'https://apps.apple.com/jp/app/id6781580333',
  },
  {
    slug: 'shuuki',
    name: '周期リマインダー',
    lead: '「◯日ごとのやること」を憶えておく道具。',
    body: 'フィルター交換、植物の水やり、消耗品の買い替え。やった日を記録すると、その日から次の周期が始まります。日付を決めるのではなく、間隔で管理します。',
    shots: 3,
    appStore: 'https://apps.apple.com/jp/app/id6780852897',
  },
];

export const soonGames = [
  { name: '忘れもの郵便局', note: '五つの支局を育てる、2Dドット絵の箱庭放置経営ゲーム。' },
  { name: '推し日和', note: '推しへの気持ちを、毎日ひとことだけ記録する帳面。' },
];
