import { z } from "zod";

export const qrcodeSchema = z.object({
  point: z.coerce.number().min(1, "ポイントを入力してください"),
  expiresAt: z.string().min(1, "有効期限を入力してください"),
  count: z.coerce.number().min(1).max(100).default(1),
});

export type QRCodeInput = z.infer<typeof qrcodeSchema>;
