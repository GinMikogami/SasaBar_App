import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().min(1, "説明を入力してください"),
  startDate: z.string().min(1, "開催日時を入力してください"),
  imageUrl: z.string().optional().default(""),
});

export type EventInput = z.infer<typeof eventSchema>;
