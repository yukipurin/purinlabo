# Purin_Labo 公式サイト — 開発規程

`purinlabo.com` のソース。上位ドキュメント：
- 事業方針 … `../Web事業計画.md`
- 設計・デザイン規律 … `../アプリ開発ポリシー.md`
- **文章の書き方 … `../文言プロンプト.md`（必読）**

矛盾したら「その場の最新指示 ＞ Web事業計画 ＞ アプリ開発ポリシー ＞ このファイル」。

## 1. 目的

サイトは**商品を並べる棚**であって商品ではない。**ツールを1本足すのが安いこと**が最優先の設計要件。

**テンプレート＝ツールページ。Homeではない。** 検索から来た人は各ツールに直接着地するので、
ツールページ1枚で完結させる。Homeは看板。

収益点は2つ。ツールごとにどちらか**一方だけ**を選ぶ（両方のCTAを1ページに置かない）。

- **有料Web Pro**（買い切り）… PCで溜まったファイルを反復処理する人向け
- **スマホアプリ**（無料＋広告＋IAP）… 撮った直後にその場で終わらせる人向け

判別：**「ファイル名を触る作業か？」** 触るなら Web、触らないならアプリ。

## 2. 技術構成（変更には理由が要る）

| 項目 | 採用 |
|---|---|
| フレームワーク | Astro + TypeScript（static出力） |
| ホスティング | **GitHub Pages**（`.github/workflows/deploy.yml` で main への push ごとに自動公開） |
| 画像処理 | Canvas API（ブラウザ内） |
| ZIP | `fflate`（JPEGは圧縮済みなので `level: 0` で束ねる） |
| テスト | Vitest |
| 書体 | Zen Maru Gothic / Kiwi Maru を OFL のまま自前配信・サブセット |
| サーバー / DB / 認証 | **無し** |
| Node | `~/development/node`（v24 LTS）。非対話シェルでは `export PATH="$HOME/development/node/bin:$PATH"` |

### 禁止

- サーバーサイド処理・DB・ログイン・会員登録を足さない
- ユーザーのファイルを外部に送信しない（**これは製品価値そのもの**）
- ツールページに広告を入れない
- Google Fonts から配信しない（閲覧者のIPを第三者に渡さない。自前配信を維持する）
- 新しいライブラリを入れる前に「既存で足りないか」を必ず確認する

## 3. ディレクトリ

```
src/
├ layouts/Base.astro      … SEO head・ヘッダー・フッター。全ページがこれを使う
├ styles/global.css       … デザイントークン。色・書体・角丸はここにしかない
├ content/home.ts         … Home の文言
├ content/about.ts        … ぷりんラボとは の文言
├ content/tools.ts        … ツール一覧の文言＋ツールの一覧データ
├ content/games.ts        … ゲームの紹介データ（ストアリンク含む）
├ content/<slug>.ts       … 各ツールページの文言。ページ側に文字列を直書きしない
│                           （例外：SEO用の title / description はページ側でよい）
├ lib/<slug>.ts           … 処理ロジック（DOM非依存の純粋関数）
├ lib/<slug>.test.ts      … そのテスト
└ pages/
   ├ index.astro          … Home（棚）
   ├ about.astro / privacy.astro
   └ tools/index.astro, tools/<slug>.astro
public/fonts/             … サブセット済みwoff2 ＋ OFLライセンス
tools/subset_fonts.py     … 文言を足したら実行する
```

## 4. 画像ツールを1本足す手順

**共通の土台があるので、書くのは「設定欄」と「変換関数」だけ。**

| ファイル | 役割 |
|---|---|
| `src/lib/image.ts` | 寸法・ファイル名・品質探索などの純粋関数（DOM非依存） |
| `src/lib/toolRunner.ts` | ファイルの受け取り・実行ループ・結果表示・ZIP書き出し |
| `src/components/ToolShell.astro` | ドロップ欄・設定欄の枠・送信しない旨・結果一覧 |
| `src/components/ToolFooter.astro` | 使い方／できないこと／製作者について |

手順：

1. **文言を `src/content/imageTools.ts` に足す**（`common` を展開して差分だけ書く）
1-b. **説明図を `tools/gen_tool_figures.py` に足して生成する。**
   一覧では図がツールの識別そのものになるので、図の無いツールを並べない。
   図の中の文字は英数字だけにする（日本語はHTML側の説明文に置く）

   ```bash
   python3 tools/gen_tool_figures.py
   ```
2. `src/pages/tools/<slug>.astro` を作る。既存の `resize.astro` を写すのが速い
   - `<Fragment slot="settings">` に設定欄を置く
   - `<script>` で `setupTool({ zipName, convert })` を呼ぶ。`convert` は1枚をどう変換するか
3. **計算が要るなら `src/lib/image.ts` に純粋関数として足し、テストも書く**
4. `src/content/tools.ts` の配列に足す（`short` / `image` / `imageAlt` / `group` が要る）
5. 文言を足したら `python3 tools/subset_fonts.py`
6. `npx vitest run` と `npx astro build` を通す
7. **実際に画像を流して動作を確認する。** ビルドが通っただけでは動く証拠にならない
   （compress は「目標に収まらない」バグを実測で見つけた）
8. `/app-review`（デザイン）と `/code-review`（バグ）を1回ずつ通す

**この手順が重くなる変更は却下する。**

### 検証の型（ブラウザで実測する）

ペインが隠れていると `img.decode()` が返らないので、`createImageBitmap` で測る：

```js
for (const im of document.querySelectorAll('#grid img')) {
  const b = await (await fetch(im.src)).blob();
  const bm = await createImageBitmap(b);
  console.log(bm.width + 'x' + bm.height, b.size);
  bm.close();
}
```

## 4-b. お知らせ・開発記録を1本書く

`src/content/log/<slug>.md` を作るだけ。一覧と個別ページは自動で生える。

```markdown
---
title: 記事のタイトル
date: 2026-09-09
kind: news        # お知らせ = news / 開発記録 = devlog
summary: 一覧に出る1〜2文。
draft: false      # true にすると公開されない
---

本文（Markdown）
```

Home には最新3件が自動で並ぶ。**文章は §6 の規則に従う。**

## 4-c. ゲームを1本足す／ストア情報を直す

`src/content/games.ts` の配列に足す。画像は App Store の掲載画像を取ってきて置く。

```bash
# 公開中の全アプリを確認（開発者ID 6780463663）
curl "https://itunes.apple.com/lookup?id=6780463663&country=jp&entity=software&limit=50"
```

**ストアのIDやリンクを推測で書かない。** 上のAPIで確認したものだけを載せる。
画像は `public/img/games/<slug>-icon.webp` と `<slug>-1..3.webp`
（Apple のCDNは URL 末尾を `500x0w.webp` などに差し替えるとサイズを指定できる）。

## 5. UIルール

アートディレクション＝**クラフト紙の作業台**。地はクラフト紙、面は白、色は作業場から取る
（ダンボールの茶 `--kraft` ／ 養生テープの緑 `--tape` ／ 朱肉 `--stamp`）。

**AI臭さの原因を意図的に外す：**

- **角丸を一律にしない。** `.hand-box` `.hand-dash` は4隅の丸みを全部変えてある＝定規で描いていない線
- **きっちり揃えない。** 写真の見立て・番号の丸・判子は、それぞれ違う角度に傾ける
- **紙のざらつきを敷く。** `body` の feTurbulence ノイズ（data URI・画像リクエストなし）
- **ピル型バッジを使わない。** 状態は `.stamp`（判子）で出す
- **カードグリッドを敷き詰めない。** 一覧は罫線で仕切った「棚」
- 絵文字をアイコン代わりにしない
- 色・サイズ・余白の直値をコンポーネントに書かない。**必ず `global.css` のトークンを使う**

## 6. 文章

### 表記の統一（本人の選択。揺らさない）

| 使う | 使わない |
|---|---|
| ツール | 道具 |
| キャラクター | 案内役 |
| 週に1度（BGMの頻度） | 2日に1度 |

同じ内容を2箇所で言わない。文言を直したら次で全ページを検査する：

```bash
npx astro build && grep -ro "道具\|案内役" dist --include="*.html" | wc -l   # 0 ならOK
```


**`../文言プロンプト.md` の規則に従う。** 要点：

- **演出しない。** 体言止め・平仮名化・「〜ですよね」・語りかけは全部AI臭さの一種
- **仕様として書く。** 目的語を省略せず、文を完結させる
- 読者が既に知っていることは書かない
- **できないことを正直に書く**（AIはこれをやらない）
- 本人の経歴を推測で書かない。ドキュメントで裏を取る

## 7. SEO

- 全ページ `Base.astro` 経由で title / description / canonical / OGP / JSON-LD が入る
- 日本語がルート（`/`）、英語は `/en/`。**この構造は変えない**（URLが変わると順位を失う）
- SEO目的だけの文章を量産しない
- 1テーマのクラスタが判定を終えるまで、無関係なツールを増やさない

## 8. 開発

```bash
export PATH="$HOME/development/node/bin:$PATH"
npx astro dev      # http://localhost:4321
npx vitest run     # テスト
npx astro build    # ビルド
```

`npm` は node が PATH に無いと動かない（shebang が `env node`）。
公開手順は `公開手順.md`。main に push すれば自動デプロイされる。
