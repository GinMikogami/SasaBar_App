# DB定義書

## Firestore コレクション一覧

### users

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | Firebase Auth UID |
| name | string | 氏名 |
| email | string | メールアドレス |
| phone | string | 電話番号 |
| points | number | 保有ポイント数 |
| role | "member" \| "admin" | ロール |
| memberNumber | string | 会員番号 (SB + 8桁) |
| fcmToken | string? | FCM通知トークン |
| createdAt | Timestamp | 登録日時 |
| updatedAt | Timestamp | 更新日時 |

### point_history

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | ドキュメントID |
| userId | string | 会員ID |
| type | "earn" \| "use" \| "adjust" | 種別 |
| point | number | ポイント数 (負値=消費) |
| description | string | 内容 |
| createdAt | Timestamp | 日時 |

### menus

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | ドキュメントID |
| name | string | 商品名 |
| description | string | 説明文 |
| imageUrl | string | 画像URL |
| pointCost | number | 必要ポイント |
| category | string | カテゴリ (ドリンク/フード/おすすめ) |
| isActive | boolean | 公開ステータス |
| createdAt | Timestamp | 登録日時 |

### orders

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | 注文ID |
| userId | string | 会員ID |
| userName | string | 会員名 |
| menuId | string | メニューID |
| menuName | string | 商品名 |
| pointCost | number | 消費ポイント |
| status | OrderStatus | ステータス |
| createdAt | Timestamp | 注文日時 |

### events

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | イベントID |
| title | string | イベント名 |
| description | string | 説明 |
| startDate | Timestamp | 開催日時 |
| imageUrl | string | サムネイル画像 |
| createdAt | Timestamp | 登録日時 |

### qr_codes

| フィールド | 型 | 説明 |
|---|---|---|
| id | string | ドキュメントID |
| code | string | QRコード文字列 |
| point | number | 付与ポイント |
| isUsed | boolean | 使用済みフラグ |
| usedBy | string? | 使用した会員ID |
| expiresAt | Timestamp | 有効期限 |
| createdAt | Timestamp | 登録日時 |

---

## ER図 (関係図)

```
users 1 ---- * point_history  (userId)
users 1 ---- * orders         (userId)
menus 1 ---- * orders         (menuId)
qr_codes ←→ users           (qr_codes.usedBy = users.id)
events はスタンドアロン
```
