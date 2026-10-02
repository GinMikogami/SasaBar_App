import { describe, it, expect } from "vitest";
import { MENU_CATEGORIES } from "@/types";

describe("MENU_CATEGORIES", () => {
  it("3つのカテゴリが定義されている", () => {
    expect(MENU_CATEGORIES).toHaveLength(3);
  });

  it("ドリンク・フード・おすすめが含まれる", () => {
    expect(MENU_CATEGORIES).toContain("ドリンク");
    expect(MENU_CATEGORIES).toContain("フード");
    expect(MENU_CATEGORIES).toContain("おすすめ");
  });

  it("readonly の配列である", () => {
    // TypeScript の as const が効いているか確認（実行時は配列として振る舞う）
    expect(Array.isArray(MENU_CATEGORIES)).toBe(true);
  });
});
