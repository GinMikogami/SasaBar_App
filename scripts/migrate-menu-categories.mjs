import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection, writeBatch, doc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => line.split("=").map(s => s.trim()))
    .filter(([k]) => k)
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

async function migrate() {
  const snap = await getDocs(collection(db, "menus"));
  const batch = writeBatch(db);
  let count = 0;

  for (const d of snap.docs) {
    const data = d.data();
    if (data.category && !data.categories) {
      batch.update(doc(db, "menus", d.id), {
        categories: [data.category],
      });
      count++;
    }
  }

  if (count === 0) {
    console.log("マイグレーション不要（既に更新済みです）");
    process.exit(0);
  }

  await batch.commit();
  console.log(`✓ ${count} 件のメニューを categories 配列に移行しました`);
  process.exit(0);
}

migrate().catch((e) => { console.error(e); process.exit(1); });
