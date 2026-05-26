# SASABar デプロイ手順書

## 本番デプロイ (Vercel 推奨)

### 1. Vercel セットアップ

```bash
npm install -g vercel
vercel login
```

### 2. 初回デプロイ

```bash
vercel
# 設定ウィザードに従い設定
```

### 3. 環境変数をVercelに設定

Vercel Dashboard → Project Settings → Environment Variables に `.env.local.example` の全値を登録。

### 4. 本番デプロイ

```bash
vercel --prod
```

---

## Firebase Cloud Functions デプロイ

```bash
# Functionsビルド
npm --prefix functions run build

# デプロイ
firebase deploy --only functions
```

---

## CI/CD (一例: GitHub Actions)

`.github/workflows/deploy.yml` を作成し、
`main` ブランチへのマージ時に自動デプロイする構成を推奨。

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```
