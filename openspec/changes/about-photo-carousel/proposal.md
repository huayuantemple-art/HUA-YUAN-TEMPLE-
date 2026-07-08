## Why

關於頁目前一張照片由後台管理，第二張（大殿三寶佛）是寫死的靜態檔，後台無法更換；用戶希望照片集中在同一個相框中輪播，且全部可由後台管理（新增/刪除/排序）。

## What Changes

- `about` 表新增 `image_urls jsonb`（照片網址陣列，migration＋回填既有兩張）。
- 前台關於頁照片區改為單一相框輪播：多張時自動輪播（淡入淡出）＋金色圓點指示可點選；一張時靜態顯示；無照片時維持既有占位樣式。
- 後台「關於我們」的意境照片欄位改為照片清單管理：逐張上傳（沿用 imageUpload 壓縮）、刪除、上移排序，儲存寫入 `image_urls`。
- 既有 `image_url` 欄位保留為舊資料後備（`image_urls` 空時前台退回單張）。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `public-site`: 關於頁照片需求由單張改為輪播相框（含 fallback 規則）。
- `admin-console`: 關於我們編輯之照片管理由單張改為多張清單。

## Impact

- `supabase/migrations/`（about.image_urls＋回填）
- `packages/shared/src/types.ts`（About.image_urls）
- `apps/web/components/PhotoCarousel.vue`（新）、`apps/web/pages/about.vue`、`main.css`
- `apps/admin/src/views/AboutView.vue`
- 部署順序：migration 先行（前台讀新欄位）
