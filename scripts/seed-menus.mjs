import { initializeApp } from "firebase/app";
import { getFirestore, writeBatch, doc, collection, serverTimestamp } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local を手動でパース
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = Object.fromEntries(
  envContent.split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => line.split("=").map(s => s.trim()))
    .filter(([k]) => k)
);

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menus = [
  // アルコール
  { name: "ハイボール",           category: "アルコール", pointCost: 400 },
  { name: "ジンジャーハイ",       category: "アルコール", pointCost: 500 },
  { name: "コークハイ",           category: "アルコール", pointCost: 500 },
  { name: "キューバリブレ",       category: "アルコール", pointCost: 600 },
  { name: "ラムコーク",           category: "アルコール", pointCost: 800 },
  { name: "ジンリッキー",         category: "アルコール", pointCost: 500 },
  { name: "ジンライム",           category: "アルコール", pointCost: 500 },
  { name: "チャイナブルー",       category: "アルコール", pointCost: 800 },
  { name: "カシスオレンジ",       category: "アルコール", pointCost: 400 },
  { name: "カシスソーダ",         category: "アルコール", pointCost: 400 },
  { name: "カミカゼ",             category: "アルコール", pointCost: 600 },
  { name: "ニンジャタートル",     category: "アルコール", pointCost: 400 },
  { name: "ブルートレイン",       category: "アルコール", pointCost: 800 },
  { name: "ブルーデビル",         category: "アルコール", pointCost: 1000 },
  { name: "ブラックルシアン",     category: "アルコール", pointCost: 800 },
  { name: "カリモーチョ",         category: "アルコール", pointCost: 400 },
  { name: "アメリカンレモネード", category: "アルコール", pointCost: 1000 },
  { name: "オペレーター",         category: "アルコール", pointCost: 600 },
  { name: "レモンサワー",         category: "アルコール", pointCost: 300 },
  // ボトル
  { name: "鏡月",   category: "ボトル", pointCost: 3500 },
  { name: "黒霧島", category: "ボトル", pointCost: 3500 },
  { name: "トリス", category: "ボトル", pointCost: 3500 },
  { name: "角",     category: "ボトル", pointCost: 3500 },
  // ソフトドリンク
  { name: "パインジュース",   category: "ソフトドリンク", pointCost: 400 },
  { name: "オレンジジュース", category: "ソフトドリンク", pointCost: 400 },
  { name: "コーラ",           category: "ソフトドリンク", pointCost: 400 },
  { name: "レモネード",       category: "ソフトドリンク", pointCost: 500 },
];

async function seed() {
  const BATCH_SIZE = 499;
  let batch = writeBatch(db);
  let count = 0;

  for (const menu of menus) {
    const ref = doc(collection(db, "menus"));
    batch.set(ref, {
      id: ref.id,
      name: menu.name,
      description: "",
      imageUrl: "",
      pointCost: menu.pointCost,
      category: menu.category,
      isActive: true,
      createdAt: serverTimestamp(),
    });
    count++;
    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      batch = writeBatch(db);
    }
  }

  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
  }

  console.log(`✓ ${count} 件のメニューを追加しました`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
