import { describe, it, expect } from "vitest";
import {
  cn,
  formatPoints,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/utils";

describe("cn()", () => {
  it("クラス名を結合する", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("条件付きクラスを処理する", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("Tailwind クラスのコンフリクトを解決する", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatPoints()", () => {
  it("ポイントを pt 形式でフォーマットする", () => {
    expect(formatPoints(500)).toBe("500pt");
    expect(formatPoints(1000)).toBe("1,000pt");
    expect(formatPoints(0)).toBe("0pt");
  });

  it("大きな数値をカンマ区切りにする", () => {
    expect(formatPoints(10000)).toBe("10,000pt");
  });
});

describe("formatDate()", () => {
  it("null/undefined を '-' として返す", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
  });

  it("Date オブジェクトを日本語形式でフォーマットする", () => {
    const date = new Date("2024-01-15T10:30:00");
    const result = formatDate(date);
    expect(result).toContain("2024年");
    expect(result).toContain("01月");
    expect(result).toContain("15日");
  });

  it("Firestore Timestamp (toDate メソッドを持つオブジェクト) を処理する", () => {
    const fakeTimestamp = { toDate: () => new Date("2024-06-01T09:00:00") };
    const result = formatDate(fakeTimestamp as any);
    expect(result).toContain("2024年");
    expect(result).toContain("06月");
    expect(result).toContain("01日");
  });
});

describe("ORDER_STATUS_LABELS", () => {
  it("全ステータスのラベルが定義されている", () => {
    expect(ORDER_STATUS_LABELS["received"]).toBe("受付済");
    expect(ORDER_STATUS_LABELS["preparing"]).toBe("準備中");
    expect(ORDER_STATUS_LABELS["completed"]).toBe("完了");
    expect(ORDER_STATUS_LABELS["cancelled"]).toBe("キャンセル");
  });
});

describe("ORDER_STATUS_COLORS", () => {
  it("全ステータスのカラークラスが定義されている", () => {
    const statuses = ["received", "preparing", "completed", "cancelled"];
    statuses.forEach((s) => {
      expect(ORDER_STATUS_COLORS[s]).toBeTruthy();
    });
  });
});
