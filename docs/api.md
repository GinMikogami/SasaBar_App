# API設計書

## 主要データフロー

### 会員登録
```
Client -> Firebase Auth (createUser)
       -> Firestore (users/{uid} 作成)
```

### QRコードポイント付与
```
Client -> Firestore Transaction:
  1. qr_codesの code 照合
  2. isUsed チェック
  3. expiresAt チェック
  4. qr_codes.isUsed = true
  5. users.points += qr.point
  6. point_history 追加
```

### 注文
```
Client -> Firestore Transaction:
  1. users.points 確認 (不足時エラー)
  2. users.points -= menu.pointCost
  3. orders 追加 (status: "received")
  4. point_history 追加 (type: "use")
  -> Cloud Function:
     5. 会員にFCM通知 (status: completed 時)
```

### イベント作成
```
Admin Client -> Firestore (events 追加)
             -> Cloud Function (onCreate):
                全会員にFCM Push通知
```

### スプレッドシート同期
```
Firestore onWrite
  -> Cloud Function
  -> Google Sheets API
  -> 対応シート更新
```

## セキュリティ考慮

- 全データ操作はFirestore Rulesで保護
- QRコードはTransactionで二重付与を防止
- ポイント加減はTransactionで原子性を満たす
- AdminロールはFirestoreから取得しフロントエンドで検証
