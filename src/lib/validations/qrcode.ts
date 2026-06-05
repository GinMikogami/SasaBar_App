import { z } from "zod";

export const qrcodeSchema = z.object({
  point: z.coerce.number().min(1, "ポイントを入力してください"),
});

export type QRCodeInput = z.infer<typeof qrcodeSchema>;
