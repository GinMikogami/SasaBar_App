# 本番運用手順書

## 日常進核

### 階層管理のモニタリング

1. Firebase Console → Firestore でデータ確認
2. 管理画面 `/admin` で注文ステータス確認
3. Functions Logs でエラー確認

```bash
firebase functions:log --only syncUsersToSheet,notifyOnNewEvent
```

---

## QRコード発行フロー

1. `/admin/qr-codes` でQRを生成
2. 生成されたQR画像をダウンロード
3. 印刷して店内に設置またはデジタル配信

---

## 会員ポイント手動変更

1. `/admin/members` で対象会員を検索
2. 「Pt調整」をクリック
3. 加算 / 減算を選び履歴メモを入力

---

## バックアップ

Firestoreのデータは以下でエクスポート可能:

```bash
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)
```

---

## 緊急対応

### Firebase Authの収色
- Firebase Console → Authentication で直接操作

### Firestore Rulesの封鎖
```bash
# 一時的に全アクセスを封鎖
firebase deploy --only firestore:rules
```

### ロールバック
- Vercel Dashboard → Deployments で前のデプロイにロールバック

---

## スケーリング

- Firestore: 自動スケール
- Cloud Functions: 自動スケール (asia-northeast1)
- Vercel: Edge Networkで自動配信

---

## Phase 3 将来拡張メモ

- LINEログイン: `next-auth` + LINE Provider
- 会員ランク: `users.rank` フィールドと点数閘唃ルールを追加
- クーポン: `coupons` コレクションを追加 (QRコードと同様のフロー)
- 予約: `reservations` コレクションとCalendar連携
