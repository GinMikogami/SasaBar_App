# SASABar セットアップ手順書

## 前提条件

- Node.js 20+
- npm / yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud アカウント (スプレッドシート連携用)

---

## 1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. 「プロジェクトを追加」 → プロジェクト名: `sasabar-app`
3. 以下サービスを有効化:
   - Authentication (メール/パスワード)
   - Firestore Database
   - Storage
   - Cloud Messaging

---

## 2. リポジトリのセットアップ

```bash
# 依存パッケージインストール
npm install

# Firebase Functions の依存パッケージ
npm --prefix functions install
```

---

## 3. 環境変数設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集し、Firebase Console の 「ウェブアプリの設定」から各値をコピーする。

### FCM VAPID Key の取得

1. Firebase Console → プロジェクト設定 → Cloud Messaging
2. 「Web Push 証明書」 → キーペアを生成
3. 公開鍵を `NEXT_PUBLIC_FIREBASE_VAPID_KEY` に設定

---

## 4. Firebase 設定

```bash
# Firebaseにログイン
firebase login

# プロジェクトIDを設定
firebase use --add

# Firestore Rules デプロイ
firebase deploy --only firestore:rules,firestore:indexes

# Storage Rules デプロイ
firebase deploy --only storage
```

---

## 5. 管理者アカウントの作成

Firestore Console から `users` コレクションの対象ユーザーに対して `role` フィールドを `"admin"` に変更する。

```json
{
  "role": "admin"
}
```

---

## 6. 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開く。

---

## 7. Google Spreadsheet 連携設定 (Phase 2)

1. Google Cloud Console でサービスアカウント作成
2. JSON キーをダウンロード
3. 対象スプレッドシートをサービスアカウントのメールアドレスと共有
4. Cloud Functions に環境変数を設定:

```bash
firebase functions:config:set \
  google.spreadsheet_id="YOUR_SPREADSHEET_ID" \
  google.service_account_email="your@service-account.com" \
  google.private_key="-----BEGIN PRIVATE KEY-----\n..."
```
