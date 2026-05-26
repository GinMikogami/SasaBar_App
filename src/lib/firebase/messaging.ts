"use client";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import app from "./config";
import { db } from "./config";

export async function requestNotificationPermission(
  uid: string
): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token && uid) {
      await updateDoc(doc(db, "users", uid), { fcmToken: token });
    }
    return token;
  } catch {
    return null;
  }
}

export function setupMessageListener(
  callback: (payload: unknown) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}
