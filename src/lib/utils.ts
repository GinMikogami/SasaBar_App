import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(ts: Timestamp | Date | null | undefined): string {
  if (!ts) return "-";
  const date = "toDate" in (ts as Timestamp) ? (ts as Timestamp).toDate() : (ts as Date);
  return format(date, "yyyy年MM月dd日 HH:mm", { locale: ja });
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString()}pt`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: "受付済",
  preparing: "準備中",
  completed: "完了",
  cancelled: "キャンセル",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  received: "bg-blue-900/40 text-blue-300 border-blue-700",
  preparing: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  completed: "bg-green-900/40 text-green-300 border-green-700",
  cancelled: "bg-red-900/40 text-red-300 border-red-700",
};
