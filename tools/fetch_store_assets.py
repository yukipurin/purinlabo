#!/usr/bin/env python3
"""App Store の掲載画像を取ってきて public/img/games/ に置く。

アプリを公開したら実行する。アイコンとスクリーンショット（最大3枚）を
webp に変換して保存する。手でスクショを用意する必要はない。

    python3 tools/fetch_store_assets.py            # 公開中の全アプリ
    python3 tools/fetch_store_assets.py 6796961427 # 特定のアプリだけ

slug は SLUGS の対応表で決まる。新しいアプリを足すときは、
ここに `trackId: "slug"` を1行足してから実行する。
"""
import io
import json
import pathlib
import re
import sys
import urllib.request

from PIL import Image

DEVELOPER_ID = "6780463663"          # ぷりんラボ（App Store の開発者ID）
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "img" / "games"
UA = {"User-Agent": "Mozilla/5.0"}

SLUGS = {
    6780463661: "sousei",
    6787645238: "gohenkan",
    6781580333: "kotoba",
    6780852897: "shuuki",
    6796961427: "fishing",
}


def fetch(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def sized(url: str, spec: str) -> str:
    """Apple のCDNは末尾のサイズ指定を差し替えるとその寸法で返る。"""
    return re.sub(r"/[^/]+$", "/" + spec, url)


def main() -> int:
    only = {int(a) for a in sys.argv[1:] if a.isdigit()}
    data = json.loads(fetch(
        f"https://itunes.apple.com/lookup?id={DEVELOPER_ID}&country=jp&entity=software&limit=50"))
    apps = [r for r in data["results"] if r.get("wrapperType") == "software"]
    if only:
        apps = [r for r in apps if r["trackId"] in only]
    if not apps:
        print("公開中のアプリが見つからない。まだ審査中か、IDが違う。", file=sys.stderr)
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    missing = []
    for r in sorted(apps, key=lambda x: x.get("releaseDate", "")):
        slug = SLUGS.get(r["trackId"])
        if slug is None:
            missing.append((r["trackId"], r["trackName"]))
            continue

        icon = Image.open(io.BytesIO(fetch(sized(r["artworkUrl512"], "180x180bb.webp")))).convert("RGB")
        icon.save(OUT / f"{slug}-icon.webp", quality=88, method=6)

        n = 0
        for i, u in enumerate(r.get("screenshotUrls", [])[:3]):
            im = Image.open(io.BytesIO(fetch(sized(u, "500x0w.webp")))).convert("RGB")
            if im.height > 640:
                im = im.resize((round(im.width * 640 / im.height), 640), Image.LANCZOS)
            im.save(OUT / f"{slug}-{i + 1}.webp", quality=78, method=6)
            n += 1
        print(f"○ {slug:9} {r['trackName'][:30]:32} アイコン + スクショ{n}枚")

    for track_id, name in missing:
        print(f"× SLUGS に未登録: {track_id}  {name}\n"
              f"  tools/fetch_store_assets.py の SLUGS に "
              f"`{track_id}: \"すきなslug\",` を足してから実行し直す", file=sys.stderr)

    files = sorted(OUT.iterdir())
    print(f"\n合計 {sum(p.stat().st_size for p in files) // 1024} KB / {len(files)} ファイル")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())
