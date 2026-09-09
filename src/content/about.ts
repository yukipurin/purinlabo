// ============================================================
//  ぷりんラボとは（ /about/ ）の文言
//  " " の中だけ書き換える。行末のカンマは消さない。
// ============================================================

export const about = {
  label: "About",
  title: "ぷりんラボとは",
  body: [
    "ひとりでゲームアプリとWebツールを作っています。YouTubeでは異世界ケルト音楽の作業用BGMを公開しています。",
    "Webツールは、自分の作業で必要になったものを整えて置いています。処理はすべてブラウザ内で行うため、ファイルが外部に送信されることはありません。",
  ],

  linksTitle: "置いているもの",
  links: [
    { label: "Webツール", href: "/tools/" },
    { label: "ゲーム・アプリ", href: "/games/" },
    { label: "音の図書館（YouTube）", href: "https://www.youtube.com/@soundlibrarystudio" },
    { label: "X", href: "https://x.com/Purin_Labo" },
  ],

  contactTitle: "連絡先",
  contactBody: "ご連絡は X（@Purin_Labo）までお願いします。",
  contactHref: "https://x.com/Purin_Labo",
} as const;
