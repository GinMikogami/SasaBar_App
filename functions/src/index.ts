import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

admin.initializeApp();
const db = admin.firestore();

// ── Spreadsheet helper ────────────────────────────────────────
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function syncSheetFromCollection(
  sheetTitle: string,
  headers: string[],
  rows: string[][]
) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return;

  const sheets = await getSheets();

  // Get or create sheet
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetTitle
  );

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: sheetTitle } } },
        ],
      },
    });
  }

  const values = [headers, ...rows];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTitle}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

// ── Sync users on write ───────────────────────────────────────
export const syncUsersToSheet = functions
  .region("asia-northeast1")
  .firestore.document("users/{userId}")
  .onWrite(async () => {
    const snap = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const rows = snap.docs.map((d) => {
      const u = d.data();
      return [
        u.id ?? "",
        u.name ?? "",
        u.email ?? "",
        u.phone ?? "",
        String(u.points ?? 0),
        u.role ?? "",
        u.memberNumber ?? "",
        u.createdAt?.toDate().toISOString() ?? "",
      ];
    });

    await syncSheetFromCollection(
      "users",
      ["ID", "名前", "メール", "電話", "ポイント", "ロール", "会員番号", "登録日"],
      rows
    );
  });

// ── Sync orders on write ─────────────────────────────────────
export const syncOrdersToSheet = functions
  .region("asia-northeast1")
  .firestore.document("orders/{orderId}")
  .onWrite(async () => {
    const snap = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const rows = snap.docs.map((d) => {
      const o = d.data();
      return [
        o.id ?? "",
        o.userId ?? "",
        o.userName ?? "",
        o.menuName ?? "",
        String(o.pointCost ?? 0),
        o.status ?? "",
        o.createdAt?.toDate().toISOString() ?? "",
      ];
    });

    await syncSheetFromCollection(
      "orders",
      ["ID", "会員ID", "会員名", "商品名", "ポイント", "ステータス", "注文日時"],
      rows
    );
  });

// ── Sync point_history on write ──────────────────────────────
export const syncPointHistoryToSheet = functions
  .region("asia-northeast1")
  .firestore.document("point_history/{docId}")
  .onWrite(async () => {
    const snap = await db
      .collection("point_history")
      .orderBy("createdAt", "desc")
      .get();

    const rows = snap.docs.map((d) => {
      const p = d.data();
      return [
        p.id ?? "",
        p.userId ?? "",
        p.type ?? "",
        String(p.point ?? 0),
        p.description ?? "",
        p.createdAt?.toDate().toISOString() ?? "",
      ];
    });

    await syncSheetFromCollection(
      "point_history",
      ["ID", "会員ID", "種別", "ポイント", "説明", "日時"],
      rows
    );
  });

// ── Sync events on write ──────────────────────────────────────
export const syncEventsToSheet = functions
  .region("asia-northeast1")
  .firestore.document("events/{eventId}")
  .onWrite(async () => {
    const snap = await db
      .collection("events")
      .orderBy("createdAt", "desc")
      .get();

    const rows = snap.docs.map((d) => {
      const e = d.data();
      return [
        e.id ?? "",
        e.title ?? "",
        e.description ?? "",
        e.startDate?.toDate().toISOString() ?? "",
        e.imageUrl ?? "",
        e.createdAt?.toDate().toISOString() ?? "",
      ];
    });

    await syncSheetFromCollection(
      "events",
      ["ID", "タイトル", "説明", "開催日時", "画像URL", "作成日"],
      rows
    );
  });

// ── Send FCM notification on new event ────────────────────────
export const notifyOnNewEvent = functions
  .region("asia-northeast1")
  .firestore.document("events/{eventId}")
  .onCreate(async (snap) => {
    const event = snap.data();

    const usersSnap = await db
      .collection("users")
      .where("role", "==", "member")
      .get();

    const tokens: string[] = usersSnap.docs
      .map((d) => d.data().fcmToken)
      .filter((t): t is string => !!t);

    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: "新しいイベントが追加されました",
        body: event.title ?? "",
      },
      data: {
        type: "new_event",
        eventId: snap.id,
      },
    });
  });

// ── Send FCM notification on order completed ──────────────────
export const notifyOnOrderComplete = functions
  .region("asia-northeast1")
  .firestore.document("orders/{orderId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return;
    if (after.status !== "completed") return;

    const userSnap = await db.collection("users").doc(after.userId).get();
    const token = userSnap.data()?.fcmToken;
    if (!token) return;

    await admin.messaging().send({
      token,
      notification: {
        title: "注文が完成しました",
        body: `${after.menuName}がお準備できました`,
      },
      data: {
        type: "order_completed",
        orderId: change.after.id,
      },
    });
  });
