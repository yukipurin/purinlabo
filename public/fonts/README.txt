このフォルダのフォントについて

zenmaru-bold.woff2    … Zen Maru Gothic Bold（Zen Font Project）
kiwimaru-medium.woff2 … Kiwi Maru Medium（Hiroki Kanou）

どちらも SIL Open Font License 1.1（OFL-*.txt）。商用利用・改変・再配布が可能で、
サブセット化して自前配信することも認められている。

サイトで実際に使う文字だけに絞ってあるので、文言を増やしたら再生成すること：

    python3 tools/subset_fonts.py

Google Fonts から配信せず自前で置いているのは、閲覧者のIPが第三者に渡らないようにするため
（このサイトはファイルを外に出さないことを売りにしているので、そこと矛盾させない）。
