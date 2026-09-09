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
├ content/<slug>.ts       … 各ページの文言。ページ側に文字列を直書きしない
├ lib/<slug>.ts           … 処理ロジック（DOM非依存の純粋関数）
├ lib/<slug>.test.ts      … そのテスト
└ pages/
   ├ index.astro          … Home（棚）
   ├ about.astro / privacy.astro
   └ tools/index.astro, tools/<slug>.astro
public/fonts/             … サブセット済みwoff2 ＋ OFLライセンス
tools/subset_fonts.py     … 文言を足したら実行する
```

## 4. ツールを1本足す手順

1. `src/pages/tools/index.astro` の `tools` 配列に1行足す（`ready: false` で準備中表示）
2. **文言を `src/content/<slug>.ts` に置く。** ページ側に文字列を直書きしない
3. **処理ロジックは純粋関数として `src/lib/<slug>.ts` に置く**（DOMに触らない）
4. テストを `src/lib/<slug>.test.ts` に書く
5. `src/pages/tools/<slug>.astro` を作る。`tools/square.astro` を写すのが速い
6. ページ構成は固定：見出し／一言説明／ツール本体／送信しない旨／使い方／できないこと／製作者について
7. 文言を足したら `python3 tools/subset_fonts.py`
8. `npx vitest run` と `npx astro build` を通す
9. `/app-review`（デザイン）と `/code-review`（バグ）を1回ずつ通す

**この手順が重くなる変更は却下する。**

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
