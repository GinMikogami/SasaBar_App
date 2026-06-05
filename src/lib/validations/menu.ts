import { z } from "zod";

export const menuSchema = z.object({
  name: z.string().min(1, "商品名を入力してください"),
  description: z.string().optional().default(""),
  pointCost: z.coerce.number().min(1, "必要ポイントを入力してください"),
  categories: z.array(z.string()).min(1, "カテゴリを1つ以上選択してください"),
  imageUrl: z.string().optional().default(""),
  isActive: z.boolean().default(true),
});

export type MenuInput = z.infer<typeof menuSchema>;
