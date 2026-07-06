# admin-content-coverage 任務

## 1. 資料層

- [ ] 1.1 migration:`contact` 新增 `icon_url` / `icon_url2`(text, nullable),移除 `email` / `hours`
- [ ] 1.2 migration:`about` 新增 `image_url`、`value1_desc` / `value2_desc` / `value3_desc`(text, nullable)
- [ ] 1.3 migration:建立 `images` bucket(public read、admin write,比照 `pdfs` 的 RLS)
- [ ] 1.4 `packages/shared`:`types.ts` 更新 Contact(± 欄位)與 About(+ 欄位);`storage.ts` 新增 images bucket 公開網址 helper;確認全庫無 `email`/`hours` 殘留引用

## 2. 後台

- [ ] 2.1 `apps/admin` 新增圖片壓縮與上傳 util(canvas 壓縮:照片長邊 1600px、icon 長邊 256px;固定 key 覆寫 + `?v=<timestamp>` 破快取)
- [ ] 2.2 ContactView 新增兩組道場 icon 上傳欄位(含預覽、清除回預設 logo)
- [ ] 2.3 AboutView 新增意境照片上傳(含預覽)與三則理念內文 textarea,移除 `@todo :35`、`@todo :49`

## 3. 前台

- [ ] 3.1 about.vue 改讀 `image_url`(無值顯示既有 placeholder)與 `value1~3_desc`(無值 fallback 現行文案),文字經 `escapeHtml`
- [ ] 3.2 收整 working tree 既有的 contact icon 渲染改動,確認 icon 缺值/壞圖回退預設 logo

## 4. 驗證

- [ ] 4.1 `pnpm lint && pnpm typecheck && pnpm test && pnpm build:web && pnpm build:admin` 通過
- [ ] 4.2 RLS 驗證:匿名對 `images` bucket 上傳被拒、公開讀取正常;admin 上傳成功
- [ ] 4.3 端到端:後台上傳照片/icon、填理念內文 → 前台(ISR 後)正確顯示;清空後 fallback 正確
