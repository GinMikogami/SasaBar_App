import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import type { User, Menu, Order, Event, QRCode, PointHistory, OrderStatus } from "@/types";

// ── Users ──────────────────────────────────────────────
export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as User);
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserDoc(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}

// ── Points ─────────────────────────────────────────────
export async function adjustPoints(
  uid: string,
  points: number,
  type: "earn" | "use" | "adjust",
  description: string
) {
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const current = userSnap.data().points as number;
    const next = current + points;
    if (next < 0) throw new Error("ポイントが不足しています");

    tx.update(userRef, { points: next, updatedAt: serverTimestamp() });

    const histRef = doc(collection(db, "point_history"));
    tx.set(histRef, {
      id: histRef.id,
      userId: uid,
      type,
      point: points,
      description,
      createdAt: serverTimestamp(),
    });
  });
}

export async function getPointHistory(uid: string): Promise<PointHistory[]> {
  const snap = await getDocs(
    query(
      collection(db, "point_history"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    )
  );
  return snap.docs.map((d) => d.data() as PointHistory);
}

// ── QR Codes ───────────────────────────────────────────
export async function redeemQRCode(code: string, uid: string): Promise<number> {
  return runTransaction(db, async (tx) => {
    const qrSnap = await getDocs(
      query(collection(db, "qr_codes"), where("code", "==", code))
    );
    if (qrSnap.empty) throw new Error("QRコードが見つかりません");

    const qrDoc = qrSnap.docs[0];
    const qrData = qrDoc.data() as QRCode;

    if (qrData.isUsed) throw new Error("このQRコードは既に使用済みです");
    if (qrData.expiresAt.toDate() < new Date())
      throw new Error("このQRコードは有効期限切れです");

    tx.update(qrDoc.ref, { isUsed: true, usedBy: uid });

    const userRef = doc(db, "users", uid);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const current = userSnap.data().points as number;
    tx.update(userRef, {
      points: current + qrData.point,
      updatedAt: serverTimestamp(),
    });

    const histRef = doc(collection(db, "point_history"));
    tx.set(histRef, {
      id: histRef.id,
      userId: uid,
      type: "earn",
      point: qrData.point,
      description: `QRコード（${code}）スキャン`,
      createdAt: serverTimestamp(),
    });

    return qrData.point;
  });
}

export async function createQRCode(
  point: number,
  expiresAt: Date
): Promise<string> {
  const code = `SASABAR-${point}-${Date.now()}`;
  const ref = doc(collection(db, "qr_codes"));
  await addDoc(collection(db, "qr_codes"), {
    id: ref.id,
    code,
    point,
    isUsed: false,
    expiresAt: Timestamp.fromDate(expiresAt),
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function getAllQRCodes(): Promise<QRCode[]> {
  const snap = await getDocs(
    query(collection(db, "qr_codes"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as QRCode);
}

// ── Menus ──────────────────────────────────────────────
export async function getActiveMenus(): Promise<Menu[]> {
  const snap = await getDocs(
    query(
      collection(db, "menus"),
      where("isActive", "==", true),
      orderBy("category")
    )
  );
  return snap.docs.map((d) => d.data() as Menu);
}

export async function getAllMenus(): Promise<Menu[]> {
  const snap = await getDocs(
    query(collection(db, "menus"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as Menu);
}

export async function createMenu(
  data: Omit<Menu, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "menus"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function updateMenu(id: string, data: Partial<Menu>) {
  await updateDoc(doc(db, "menus", id), data);
}

export async function deleteMenu(id: string) {
  await deleteDoc(doc(db, "menus", id));
}

// ── Orders ─────────────────────────────────────────────
export async function createOrder(
  userId: string,
  userName: string,
  menu: Menu
): Promise<string> {
  return runTransaction(db, async (tx) => {
    const userRef = doc(db, "users", userId);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const current = userSnap.data().points as number;
    if (current < menu.pointCost) throw new Error("ポイントが不足しています");

    tx.update(userRef, {
      points: current - menu.pointCost,
      updatedAt: serverTimestamp(),
    });

    const orderRef = doc(collection(db, "orders"));
    tx.set(orderRef, {
      id: orderRef.id,
      userId,
      userName,
      menuId: menu.id,
      menuName: menu.name,
      pointCost: menu.pointCost,
      status: "received",
      createdAt: serverTimestamp(),
    });

    const histRef = doc(collection(db, "point_history"));
    tx.set(histRef, {
      id: histRef.id,
      userId,
      type: "use",
      point: -menu.pointCost,
      description: `注文: ${menu.name}`,
      createdAt: serverTimestamp(),
    });

    return orderRef.id;
  });
}

export async function getUserOrders(uid: string): Promise<Order[]> {
  const snap = await getDocs(
    query(
      collection(db, "orders"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(30)
    )
  );
  return snap.docs.map((d) => d.data() as Order);
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, "orders"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => d.data() as Order);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), { status });
}

export function subscribeOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(
    query(collection(db, "orders"), orderBy("createdAt", "desc")),
    (snap) => callback(snap.docs.map((d) => d.data() as Order))
  );
}

// ── Events ─────────────────────────────────────────────
export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(
    query(collection(db, "events"), orderBy("startDate", "desc"))
  );
  return snap.docs.map((d) => d.data() as Event);
}

export async function createEvent(
  data: Omit<Event, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "events"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(ref, { id: ref.id });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<Event>) {
  await updateDoc(doc(db, "events", id), data);
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, "events", id));
}
