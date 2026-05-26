# SASABar セットアップ手順書

誰でも同じ開発環境を再現できるよう、ゼロから起動するまでの手順をまとめています。  
**Docker を使う方法（推奨）** と **ローカルに直接インストールする方法** の 2 通りを記載します。

---

## 目次

1. [Firebase プロジェクトの準備](#1-firebase-プロジェクトの準備)
2. [リポジトリのクローン](#2-リポジトリのクローン)
3. [環境変数の設定](#3-環境変数の設定)
4. [アプリの起動 — Docker（推奨）](#4-アプリの起動--docker推奨)
5. [アプリの起動 — ローカル（代替）](#5-アプリの起動--ローカル代替)
6. [Firebase ルールのデプロイ](#6-firebase-ルールのデプロイ)
7. [管理者アカウントの作成](#7-管理者アカウントの作成)
8. [動作確認](#8-動作確認)

---

## 1. Firebase プロジェクトの準備

### 1-1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com) を開く
2. 「プロジェクトを追加」をクリック
3. プロジェクト名に `sasabar-app` と入力して作成

### 1-2. Authentication の有効化

1. 左メニュー → **構築 → Authentication**
2. 「始める」をクリック
3. **「ネイティブのプロバイダ」→「メール/パスワード」** を選択
4. 「有効にする」をオンにして「保存」

### 1-3. Firestore Database の有効化

1. 左メニュー → **構築 → Firestore Database**
2. 「データベースの作成」をクリック
3. ロケーション: `asia-northeast1`（東京）を選択
4. セキュリティルール: 「テストモードで開始」を選択して「完了」
   > ルールは後のステップで正式なものをデプロイします

### 1-4. ウェブアプリの登録と設定値の取得

1. 左メニュー上部の歯車アイコン → **「プロジェクトの設定」**
2. 「マイアプリ」セクションで `</>` をクリック
3. アプリのニックネームを入力して「アプリを登録」
4. 表示される `firebaseConfig` をコピーして手元に保管

```js
// コピーする内容の例
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sasabar-app.firebaseapp.com",
  projectId: "sasabar-app",
  storageBucket: "sasabar-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXX"
};
```

---

## 2. リポジトリのクローン

```bash
git clone https://github.com/GinMikogami/SasaBar_App.git
cd SasaBar_App
```

---

## 3. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` をテキストエディタで開き、手順 1-4 で取得した値を入力します。

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sasabar-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sasabar-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sasabar-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=  # 後で設定（FCM Push 通知を使う場合のみ）
```

> **`NEXT_PUBLIC_FIREBASE_VAPID_KEY` の取得方法（任意）**  
> Firebase Console → プロジェクト設定 → Cloud Messaging → 「Web Push 証明書」→「キーペアを生成」→ 公開鍵をコピー

---

## 4. アプリの起動 — Docker（推奨）

Docker を使うと Node.js のインストール不要で、誰でも同じ環境を再現できます。

### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) をインストール済みであること

### 起動

```bash
docker compose up
```

初回はイメージのビルドに数分かかります。  
`Ready in Xs` が表示されたら http://localhost:3000 を開いてください。

### 停止

```bash
docker compose down
```

---

## 5. アプリの起動 — ローカル（代替）

Docker を使わない場合の手順です。

### 前提条件

- Node.js 20 以上がインストールされていること
  - [nodejs.org](https://nodejs.org/) から LTS 版をダウンロード

### Windows (PowerShell) の注意

PowerShell でスクリプト実行が禁止されている場合、以下を実行してから進めてください。

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

または、コマンドプロンプト（cmd）を使用してください。

### インストールと起動

```bash
# 依存パッケージのインストール
npm install

# Firebase Functions の依存パッケージ
npm --prefix functions install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 を開いてください。

---

## 6. Firebase ルールのデプロイ

Firebase CLI を使って、Firestore のセキュリティルールとインデックスをデプロイします。

### Firebase CLI のインストール

```bash
npm install -g firebase-tools
```

### ログインとデプロイ

```bash
# Google アカウントでログイン（ブラウザが開きます）
firebase login

# Firestore ルール・インデックスのデプロイ
firebase deploy --only firestore:rules,firestore:indexes
```

> **Windows PowerShell で `firebase` コマンドが使えない場合**  
> コマンドプロンプト（cmd）で `firebase login` を実行してください。

---

## 7. 管理者アカウントの作成

1. http://localhost:3000/register を開き、アカウントを作成
2. [Firestore Console](https://console.firebase.google.com/project/sasabar-app/firestore) を開く
3. `users` コレクション → 登録したユーザーのドキュメントを開く
4. `role` フィールドの値を `"member"` から `"admin"` に変更して保存

```
users/
  └─ {uid}
       ├─ name: "管理者名"
       ├─ email: "admin@example.com"
       ├─ role: "admin"   ← ここを変更
       └─ ...
```

---

## 8. 動作確認

| URL | 内容 |
|-----|------|
| http://localhost:3000/login | ログイン画面 |
| http://localhost:3000/register | 会員登録画面 |
| http://localhost:3000/dashboard | 会員ダッシュボード |
| http://localhost:3000/admin | 管理者画面（admin ロールのみ） |

### 確認チェックリスト

- [ ] `/register` でアカウントを作成できる
- [ ] `/login` でログインできる
- [ ] `/dashboard` にリダイレクトされる
- [ ] Firestore Console の `users` コレクションにドキュメントが作成されている
- [ ] `role` を `admin` に変更後、`/admin` にアクセスできる
- [ ] ログアウトでログイン画面に戻る

---

## トラブルシューティング

### `auth/configuration-not-found`

Firebase Authentication の「メール/パスワード」が有効になっていません。  
→ 手順 [1-2](#1-2-authentication-の有効化) を実施してください。

### ログイン後にログイン画面に戻ってしまう

`.env.local` の設定値が間違っているか、Firestore にユーザードキュメントが存在しません。  
→ 手順 [3](#3-環境変数の設定) の設定値を確認してください。

### `firebase deploy` でインデックスエラー

単一フィールドのインデックスは Firestore が自動管理するため不要です。  
`firestore.indexes.json` から単一フィールドのエントリを削除してください。

### Docker で変更が反映されない

```bash
docker compose down
docker compose up --build
```
