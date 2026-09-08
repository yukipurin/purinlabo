import { describe, expect, it } from "vitest";
import {
  aspectRatio, fitContain, fitCover, formatBytes,
  outputName, sanitizeFileName, stripExtension,
} from "./square";

describe("fitContain", () => {
  it("正方形の画像はそのまま全面に収まる", () => {
    expect(fitContain(500, 500, 1080)).toEqual({ dx: 0, dy: 0, dw: 1080, dh: 1080 });
  });

  it("横長の画像は上下に余白ができる", () => {
    const f = fitContain(2000, 1000, 1080);
    expect(f.dw).toBe(1080);
    expect(f.dh).toBe(540);
    expect(f.dx).toBe(0);
    expect(f.dy).toBe(270); // (1080-540)/2
  });

  it("縦長の画像は左右に余白ができる", () => {
    const f = fitContain(1000, 2000, 1080);
    expect(f.dw).toBe(540);
    expect(f.dh).toBe(1080);
    expect(f.dx).toBe(270);
    expect(f.dy).toBe(0);
  });

  it("小さい画像も指定サイズまで拡大する", () => {
    expect(fitContain(100, 100, 1080).dw).toBe(1080);
  });

  it("寸法が0以下なら例外", () => {
    expect(() => fitContain(0, 100, 1080)).toThrow();
    expect(() => fitContain(100, -1, 1080)).toThrow();
  });
});

describe("fitCover", () => {
  it("横長の画像は左右が均等に切られる", () => {
    const f = fitCover(2000, 1000, 1080);
    expect(f.dw).toBe(1000);
    expect(f.dh).toBe(1000);
    expect(f.dx).toBe(500); // (2000-1000)/2
    expect(f.dy).toBe(0);
  });

  it("正方形の画像は切られない", () => {
    expect(fitCover(800, 800, 1080)).toEqual({ dx: 0, dy: 0, dw: 800, dh: 800 });
  });
});

describe("aspectRatio", () => {
  it("正方形は1", () => expect(aspectRatio(500, 500)).toBe(1));
  it("縦横どちらが長くても同じ値", () => {
    expect(aspectRatio(2000, 1000)).toBe(2);
    expect(aspectRatio(1000, 2000)).toBe(2);
  });
});

describe("stripExtension", () => {
  it("拡張子を落とす", () => expect(stripExtension("IMG_1234.HEIC")).toBe("IMG_1234"));
  it("拡張子が無ければそのまま", () => expect(stripExtension("noext")).toBe("noext"));
  it("ドット始まりは消さない", () => expect(stripExtension(".gitignore")).toBe(".gitignore"));
  it("複数のドットは最後だけ見る", () => expect(stripExtension("a.b.jpg")).toBe("a.b"));
});

describe("outputName", () => {
  it("接頭辞が無ければ元の名前を使う", () => {
    expect(outputName("写真.jpg", 0, 3)).toBe("写真_01.jpg");
  });

  it("接頭辞があればそちらを使う", () => {
    expect(outputName("写真.jpg", 4, 10, "ABC-001")).toBe("ABC-001_05.jpg");
  });

  it("総数に応じて連番の桁を揃える", () => {
    expect(outputName("a.jpg", 0, 100, "x")).toBe("x_001.jpg");
    expect(outputName("a.jpg", 0, 5, "x")).toBe("x_01.jpg");
  });

  it("ファイル名に使えない文字は落とす", () => {
    expect(outputName("a.jpg", 0, 1, "A/B:C")).toBe("ABC_01.jpg");
  });

  it("接頭辞が空白だけなら元の名前に戻る", () => {
    expect(outputName("元.png", 0, 1, "   ")).toBe("元_01.jpg");
  });
});

describe("sanitizeFileName", () => {
  it("全部消える場合は image にする", () => expect(sanitizeFileName("///")).toBe("image"));
  it("連続する空白は1つにまとめる", () => expect(sanitizeFileName("a   b")).toBe("a b"));
});

describe("formatBytes", () => {
  it("単位を切り替える", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
