import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { menuSchema } from "@/lib/validations/menu";
import { eventSchema } from "@/lib/validations/event";
import { qrcodeSchema } from "@/lib/validations/qrcode";

// ── 認証バリデーション ────────────────────────────────────────

describe("loginSchema", () => {
  it("正常入力を通過する", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("不正なメールアドレスを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("email");
  });

  it("空のパスワードを拒否する", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "山田太郎",
    email: "yamada@example.com",
    phone: "09012345678",
    password: "password123",
    confirmPassword: "password123",
  };

  it("正常入力を通過する", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("パスワード不一致を拒否する", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("confirmPassword");
  });

  it("8文字未満のパスワードを拒否する", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("短すぎる電話番号を拒否する", () => {
    const result = registerSchema.safeParse({
      ...valid,
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("名前が空の場合を拒否する", () => {
    const result = registerSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });
});

// ── メニューバリデーション ───────────────────────────────────

describe("menuSchema", () => {
  const valid = {
    name: "生ビール",
    description: "冷たい生ビール",
    pointCost: 300,
    category: "ドリンク",
    isActive: true,
  };

  it("正常入力を通過する", () => {
    expect(menuSchema.safeParse(valid).success).toBe(true);
  });

  it("ポイントが0以下を拒否する", () => {
    expect(menuSchema.safeParse({ ...valid, pointCost: 0 }).success).toBe(false);
  });

  it("文字列のポイントを数値に強制変換する", () => {
    const result = menuSchema.safeParse({ ...valid, pointCost: "300" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pointCost).toBe(300);
  });

  it("商品名が空の場合を拒否する", () => {
    expect(menuSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("imageUrl は省略可能", () => {
    const { imageUrl: _, ...withoutImage } = { ...valid, imageUrl: undefined };
    expect(menuSchema.safeParse(withoutImage).success).toBe(true);
  });
});

// ── イベントバリデーション ───────────────────────────────────

describe("eventSchema", () => {
  const valid = {
    title: "夏のイベント",
    description: "楽しいイベントです",
    startDate: "2024-08-01T18:00",
  };

  it("正常入力を通過する", () => {
    expect(eventSchema.safeParse(valid).success).toBe(true);
  });

  it("タイトルが空の場合を拒否する", () => {
    expect(eventSchema.safeParse({ ...valid, title: "" }).success).toBe(false);
  });

  it("開催日時が空の場合を拒否する", () => {
    expect(eventSchema.safeParse({ ...valid, startDate: "" }).success).toBe(false);
  });
});

// ── QRコードバリデーション ───────────────────────────────────

describe("qrcodeSchema", () => {
  const valid = {
    point: 500,
    expiresAt: "2025-12-31T23:59",
    count: 1,
  };

  it("正常入力を通過する", () => {
    expect(qrcodeSchema.safeParse(valid).success).toBe(true);
  });

  it("ポイントが0以下を拒否する", () => {
    expect(qrcodeSchema.safeParse({ ...valid, point: 0 }).success).toBe(false);
  });

  it("発行枚数が100超を拒否する", () => {
    expect(qrcodeSchema.safeParse({ ...valid, count: 101 }).success).toBe(false);
  });

  it("文字列ポイントを数値に強制変換する", () => {
    const result = qrcodeSchema.safeParse({ ...valid, point: "500" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.point).toBe(500);
  });
});
