#!/usr/bin/env python3
"""ツール一覧に載せる説明図を作る。

9本ぶんを1つのスクリプトで作るのは、バラバラに作ると揃わないため。
図の中の文字は英数字だけにする（日本語はHTML側の説明文に置く。
読み上げと検索のためと、PILで日本語を焼くとフォントの用意が要るため）。

    python3 tools/gen_tool_figures.py
"""
import pathlib

from PIL import Image, ImageDraw, ImageFont

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "img" / "tools"
W, H = 940, 360

PAPER = (250, 244, 232)
CARD = (255, 255, 255)
INNER = (252, 250, 246)
FRAME = (215, 200, 175)
KRAFT = (184, 125, 69)
TAPE = (61, 139, 100)
STAMP = (200, 64, 47)
MUTED = (150, 138, 120)
INK = (60, 50, 36)

TONES = [(206, 150, 110), (150, 180, 158), (190, 170, 200), (198, 178, 140)]

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
F = lambda p, s: ImageFont.truetype(p, s)


def canvas():
    im = Image.new("RGB", (W, H), PAPER)
    return im, ImageDraw.Draw(im)


def frame(d, x, y, w, h, tone=None, ratio=0.26, border=FRAME, bw=3):
    """写真の見立て。白フチ＋中身の丸"""
    d.rectangle([x, y, x + w, y + h], fill=CARD, outline=border, width=bw)
    d.rectangle([x + 9, y + 9, x + w - 9, y + h - 9], fill=INNER)
    if tone is not None:
        cx, cy = x + w // 2, y + h // 2
        r = int(min(w, h) * ratio)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tone)


def arrow(d, x, y, length=120, color=KRAFT):
    d.line([x, y, x + length - 40, y], fill=color, width=7)
    d.polygon([(x + length - 44, y - 18), (x + length, y), (x + length - 44, y + 18)], fill=color)


def label(d, x, y, text, size=20, color=MUTED, bold=False, anchor="la"):
    d.text((x, y), text, font=F(ARIAL_B if bold else ARIAL, size), fill=color, anchor=anchor)


def save(im, name):
    p = OUT / f"{name}.webp"
    im.save(p, quality=88, method=6)
    print(f"  {p.name:28} {p.stat().st_size // 1024} KB")


# ---------------------------------------------------------------- resize
im, d = canvas()
frame(d, 60, 70, 320, 210, TONES[0])
label(d, 220, 300, "2400 x 1575", 20, MUTED, True, "ma")
arrow(d, 430, 175)
frame(d, 610, 130, 200, 131, TONES[0])
label(d, 710, 285, "800 x 525", 20, KRAFT, True, "ma")
save(im, "resize")

# ---------------------------------------------------------------- compress
im, d = canvas()
frame(d, 70, 70, 300, 200, TONES[1])
d.rounded_rectangle([70, 292, 370, 316], 12, fill=(226, 214, 192))
label(d, 220, 304, "540 KB", 18, INK, True, "mm")
arrow(d, 420, 175)
frame(d, 590, 70, 300, 200, TONES[1])
d.rounded_rectangle([590, 292, 645, 316], 12, fill=TAPE)
label(d, 740, 304, "99 KB", 18, TAPE, True, "mm")
save(im, "compress")

# ---------------------------------------------------------------- convert
im, d = canvas()
chips = [("PNG", 90), ("JPG", 400), ("WEBP", 700)]
for text, x in chips:
    d.rounded_rectangle([x, 130, x + 160, 230], 10, fill=CARD, outline=KRAFT, width=3)
    label(d, x + 80, 180, text, 30, KRAFT, True, "mm")
for x in (270, 580):
    d.line([x, 180, x + 100, 180], fill=MUTED, width=5)
    d.polygon([(x + 96, 168), (x + 128, 180), (x + 96, 192)], fill=MUTED)
    d.polygon([(x + 4, 168), (x - 28, 180), (x + 4, 192)], fill=MUTED)
save(im, "convert")

# ---------------------------------------------------------------- exif
im, d = canvas()
frame(d, 60, 80, 270, 190, TONES[2])
# 写真にぶら下がっている情報。ここに×をかける（消えるのはタグの方）
for i, tag in enumerate(["EXIF", "GPS", "DATE"]):
    y = 88 + i * 60
    d.rounded_rectangle([336, y, 452, y + 44], 8, fill=(246, 228, 224), outline=STAMP, width=2)
    label(d, 394, y + 22, tag, 16, STAMP, True, "mm")
    d.line([344, y + 8, 444, y + 36], fill=STAMP, width=4)
    d.line([444, y + 8, 344, y + 36], fill=STAMP, width=4)
arrow(d, 495, 175)
frame(d, 650, 80, 270, 190, TONES[2])
# 右は情報が付いていない状態。画素は同じ
d.line([664, 300, 682, 318], fill=TAPE, width=5)
d.line([682, 318, 716, 284], fill=TAPE, width=5)
label(d, 730, 301, "same pixels", 19, TAPE, True, "la")
save(im, "exif")

# ---------------------------------------------------------------- favicon
im, d = canvas()
frame(d, 70, 100, 170, 170, TONES[3], 0.3)
arrow(d, 290, 185)
sizes = [(140, "512"), (100, "192"), (72, "48"), (52, "32"), (36, "16")]
x = 430
for s, text in sizes:
    frame(d, x, 185 - s // 2, s, s, TONES[3], 0.3, FRAME, 2)
    label(d, x + s // 2, 262, text, 16, MUTED, True, "ma")
    x += s + 20
assert x <= W, f"はみ出している: {x} > {W}"
save(im, "favicon")

# ---------------------------------------------------------------- appicon
im, d = canvas()
frame(d, 70, 100, 170, 170, TONES[0], 0.3)
label(d, 155, 288, "1024", 18, MUTED, True, "ma")
arrow(d, 290, 185)
groups = [("App Store", [(96, "1024"), (72, "180"), (58, "152")], 470),
          ("Google Play", [(96, "512"), (72, "192"), (58, "144")], 470)]
for gi, (title, items, base) in enumerate(groups):
    y = 82 + gi * 130
    label(d, base, y - 14, title, 16, KRAFT, True, "la")
    x = base
    for s, text in items:
        frame(d, x, y, s, s, TONES[0], 0.3, FRAME, 2)
        label(d, x + s // 2, y + s + 6, text, 14, MUTED, False, "ma")
        x += s + 26
save(im, "appicon")

# ---------------------------------------------------------------- heic
im, d = canvas()
frame(d, 90, 90, 280, 190, TONES[1])
label(d, 230, 300, "HEIC", 26, MUTED, True, "ma")
d.rounded_rectangle([292, 96, 368, 132], 8, fill=(246, 228, 224), outline=STAMP, width=2)
label(d, 330, 114, "?", 22, STAMP, True, "mm")
arrow(d, 440, 180)
frame(d, 610, 90, 280, 190, TONES[1])
label(d, 750, 300, "JPG", 26, TAPE, True, "ma")
d.line([812, 112, 828, 128], fill=TAPE, width=6)
d.line([828, 128, 862, 94], fill=TAPE, width=6)
save(im, "heic")

# ---------------------------------------------------------------- rename
im, d = canvas()
names = ["IMG_10", "IMG_2", "IMG_1"]
for i, n in enumerate(names):
    y = 62 + i * 86
    frame(d, 70, y, 110, 72, TONES[i], 0.28)
    label(d, 196, y + 36, n, 21, MUTED, False, "lm")
arrow(d, 400, 180)
outs = ["SKU_001", "SKU_002", "SKU_003"]
for i, n in enumerate(outs):
    y = 62 + i * 86
    frame(d, 570, y, 110, 72, TONES[2 - i], 0.28)
    label(d, 696, y + 36, n, 21, KRAFT, True, "lm")
save(im, "rename")


# ================================================================ 字幕
def cue_box(d, x, y, w, h, time_text, bars, bar_color=(200, 190, 172), border=FRAME):
    d.rounded_rectangle([x, y, x + w, y + h], 8, fill=CARD, outline=border, width=3)
    label(d, x + 14, y + 16, time_text, 15, MUTED, True, "la")
    for i, bw in enumerate(bars):
        by = y + 44 + i * 20
        d.rounded_rectangle([x + 14, by, x + 14 + bw, by + 11], 5, fill=bar_color)


# ---- subtitle-check：長すぎる行と速すぎる字幕を指摘する
im, d = canvas()
cue_box(d, 60, 50, 380, 118, "00:00:01,000", [330, 300], (214, 168, 158), STAMP)
label(d, 452, 96, "!", 30, STAMP, True, "mm")
cue_box(d, 60, 196, 380, 118, "00:00:04,000", [180, 120])
arrow(d, 500, 180)
d.rounded_rectangle([650, 62, 900, 108], 8, fill=(246, 228, 224), outline=STAMP, width=2)
label(d, 668, 85, "line too long", 17, STAMP, True, "lm")
d.rounded_rectangle([650, 124, 900, 170], 8, fill=(246, 228, 224), outline=STAMP, width=2)
label(d, 668, 147, "too fast", 17, STAMP, True, "lm")
d.rounded_rectangle([650, 214, 900, 260], 8, fill=(226, 240, 232), outline=TAPE, width=2)
label(d, 668, 237, "OK", 17, TAPE, True, "lm")
save(im, "subtitle-check")

# ---- subtitle-convert：SRTとVTTの行き来
im, d = canvas()
for text, x in [("SRT", 130), ("VTT", 610)]:
    d.rounded_rectangle([x, 120, x + 200, 240], 10, fill=CARD, outline=KRAFT, width=3)
    label(d, x + 100, 180, text, 34, KRAFT, True, "mm")
d.line([360, 158, 590, 158], fill=MUTED, width=5)
d.polygon([(586, 146), (618, 158), (586, 170)], fill=MUTED)
d.line([360, 202, 590, 202], fill=MUTED, width=5)
d.polygon([(364, 190), (332, 202), (364, 214)], fill=MUTED)
save(im, "subtitle-convert")

# ---- subtitle-shift：時刻がまとめて後ろへ動く
im, d = canvas()
for i, (t0, t1) in enumerate([("00:01", "00:04"), ("00:06", "00:09")]):
    y = 70 + i * 130
    cue_box(d, 60, y, 300, 108, t0, [250, 190])
    cue_box(d, 580, y, 300, 108, t1, [250, 190], (200, 190, 172), KRAFT)
    d.line([390, y + 54, 530, y + 54], fill=KRAFT, width=6)
    d.polygon([(526, y + 40), (562, y + 54), (526, y + 68)], fill=KRAFT)
label(d, 470, 316, "+3.0s", 22, KRAFT, True, "ma")
save(im, "subtitle-shift")

# ---- subtitle-text：番号と時刻が落ちて本文だけ残る
im, d = canvas()
d.rounded_rectangle([60, 60, 400, 300], 8, fill=CARD, outline=FRAME, width=3)
for i in range(3):
    y = 82 + i * 76
    label(d, 78, y, str(i + 1), 14, MUTED, True, "la")
    label(d, 78, y + 20, "00:00:0%d --> 00:00:0%d" % (i + 1, i + 3), 13, (196, 186, 168), False, "la")
    d.rounded_rectangle([78, y + 42, 320, y + 53], 5, fill=(206, 196, 178))
    d.line([70, y - 2, 340, y + 30], fill=STAMP, width=3)
arrow(d, 440, 180)
d.rounded_rectangle([600, 60, 900, 300], 8, fill=CARD, outline=TAPE, width=3)
for i in range(3):
    d.rounded_rectangle([620, 92 + i * 66, 862, 103 + i * 66], 5, fill=(150, 180, 158))
save(im, "subtitle-text")


# ================================================================ テキスト
def bars(d, x, y, widths, color=(206, 196, 178), h=12, gap=20):
    for i, w in enumerate(widths):
        d.rounded_rectangle([x, y + i * gap, x + w, y + i * gap + h], 6, fill=color)


# ---- text-count：投稿先ごとに収まるかを見る
im, d = canvas()
d.rounded_rectangle([60, 60, 380, 300], 8, fill=CARD, outline=FRAME, width=3)
bars(d, 84, 92, [270, 250, 272, 190], gap=26)
rows = [("X", 0.55, TAPE), ("Instagram", 0.3, TAPE), ("meta desc", 1.0, STAMP)]
for i, (name, ratio, col) in enumerate(rows):
    y = 92 + i * 74
    label(d, 470, y, name, 17, INK, True, "la")
    d.rounded_rectangle([470, y + 24, 890, y + 38], 7, fill=(226, 214, 192))
    d.rounded_rectangle([470, y + 24, 470 + int(420 * ratio), y + 38], 7, fill=col)
save(im, "text-count")

# ---- text-convert：全角と半角
im, d = canvas()
for text, x, col in [("ＡＢＣ１２３", 100, MUTED), ("ABC123", 590, KRAFT)]:
    d.rounded_rectangle([x, 130, x + 260, 230], 10, fill=CARD, outline=col, width=3)
    label(d, x + 130, 180, text, 30, col, True, "mm")
arrow(d, 400, 180, 150)
save(im, "text-convert")

# ---- text-lines：重複と空行が落ちる
im, d = canvas()
d.rounded_rectangle([60, 50, 380, 310], 8, fill=CARD, outline=FRAME, width=3)
items = [(240, False), (200, False), (240, True), (0, True), (170, False)]
for i, (w, drop) in enumerate(items):
    y = 78 + i * 46
    if w:
        bars(d, 86, y, [w], (214, 168, 158) if drop else (206, 196, 178))
    if drop:
        d.line([78, y + 6, 350, y + 6], fill=STAMP, width=3)
arrow(d, 440, 180)
d.rounded_rectangle([600, 50, 900, 310], 8, fill=CARD, outline=TAPE, width=3)
for i, w in enumerate([240, 200, 170]):
    label(d, 622, 92 + i * 60, f"{i+1}.", 15, TAPE, True, "lm")
    bars(d, 656, 86 + i * 60, [w - 40], (150, 180, 158))
save(im, "text-lines")

# ---- text-newline：CRLFとLF
im, d = canvas()
for text, x, col in [("CRLF", 110, MUTED), ("LF", 600, KRAFT)]:
    d.rounded_rectangle([x, 120, x + 240, 240], 10, fill=CARD, outline=col, width=3)
    label(d, x + 120, 180, text, 34, col, True, "mm")
d.line([380, 158, 580, 158], fill=MUTED, width=5)
d.polygon([(576, 146), (608, 158), (576, 170)], fill=MUTED)
d.line([380, 202, 580, 202], fill=MUTED, width=5)
d.polygon([(384, 190), (352, 202), (384, 214)], fill=MUTED)
label(d, 470, 300, "Windows / Mac", 17, MUTED, False, "ma")
save(im, "text-newline")

print("\n完了")
