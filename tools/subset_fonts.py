#!/usr/bin/env python3
"""見出し用の日本語フォントを、サイトで実際に使う文字だけに絞って woff2 にする。

日本語フォントは全部入りだと数MBある。見出しにしか使わないので、
src/ 以下の .astro に出てくる文字だけ残せば数十KBで済む。
ツールのページを足したら、これを実行し直す。

    python3 tools/subset_fonts.py
"""
import pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
OUT = ROOT / "public" / "fonts"
FONTS = {  # 元TTF（/tmp に落としたもの） -> 出力名
    "/tmp/ZenMaruGothic-Bold.ttf": "zenmaru-bold.woff2",
    "/tmp/KiwiMaru-Medium.ttf": "kiwimaru-medium.woff2",
}

# 常に含める：かな・英数・約物・よく使う記号
ALWAYS = set(
    "".join(chr(c) for c in range(0x3040, 0x30FF + 1))          # ひらがな・カタカナ
    + "".join(chr(c) for c in range(0x0020, 0x007F))            # ASCII
    + "、。「」『』（）・ー〜！？：；…／＋－×÷＝％＃＠　"
    + "０１２３４５６７８９"
)

def used_chars() -> set[str]:
    chars = set(ALWAYS)
    for p in SRC.rglob("*.astro"):
        chars |= set(p.read_text(encoding="utf-8"))
    # 制御文字は落とす
    return {c for c in chars if ord(c) >= 0x20}

def main() -> int:
    chars = used_chars()
    OUT.mkdir(parents=True, exist_ok=True)
    unicodes = ",".join(f"U+{ord(c):04X}" for c in sorted(chars))
    ok = True
    for src, out_name in FONTS.items():
        if not pathlib.Path(src).exists():
            print(f"× 元フォントが無い: {src}", file=sys.stderr)
            ok = False
            continue
        dst = OUT / out_name
        subprocess.run([
            sys.executable, "-m", "fontTools.subset", src,
            f"--unicodes={unicodes}",
            "--flavor=woff2", "--layout-features=*",
            f"--output-file={dst}",
        ], check=True)
        print(f"○ {out_name}  {dst.stat().st_size // 1024} KB  ({len(chars)} 文字)")
    return 0 if ok else 1

if __name__ == "__main__":
    raise SystemExit(main())
