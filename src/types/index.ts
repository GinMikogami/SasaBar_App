import type { Timestamp } from "firebase/firestore";

export type UserRole = "member" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  role: UserRole;
  memberNumber: string;
  fcmToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PointHistoryType = "earn" | "use" | "adjust";

export interface PointHistory {
  id: string;
  userId: string;
  type: PointHistoryType;
  point: number;
  description: string;
  createdAt: Timestamp;
}

export interface Menu {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  pointCost: number;
  category: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export type OrderStatus = "received" | "preparing" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  userName: string;
  menuId: string;
  menuName: string;
  pointCost: number;
  status: OrderStatus;
  createdAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  imageUrl: string;
  createdAt: Timestamp;
}

export interface QRCode {
  id: string;
  code: string;
  point: number;
  isUsed: boolean;
  usedBy?: string;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export const MENU_CATEGORIES = ["ドリンク", "フード", "おすすめ"] as const;
export type MenuCategory = typeof MENU_CATEGORIES[number];
