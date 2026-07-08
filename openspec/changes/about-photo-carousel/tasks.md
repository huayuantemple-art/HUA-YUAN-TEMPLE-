## 1. 資料庫與共用層

- [x] 1.1 migration：`about.image_urls jsonb` + 回填 `[image_url, altar 靜態檔網址]`，套用並驗證
- [x] 1.2 `types.ts`：`About.image_urls: string[] | null`

## 2. 前台

- [x] 2.1 `PhotoCarousel.vue`：多張 5 秒淡入淡出輪播＋金色圓點；單張靜態；計時器 onUnmounted 清除
- [x] 2.2 `about.vue` 以輪播取代雙圖（fallback：image_urls → image_url → placeholder）；移除寫死的 altar `<img>`；`main.css` 輪播樣式沿用 .about-photo 相框

## 3. 後台

- [x] 3.1 `AboutView.vue` 照片清單管理：縮圖＋上移/刪除、新增上傳（唯一 key `about-<timestamp>`）、儲存寫 image_urls 並同步第一張至 image_url

## 4. 驗證

- [x] 4.1 lint / typecheck / 測試通過；瀏覽器驗證輪播切換、圓點、單張/無照片 fallback
- [x] 4.2 部署（migration 已先行）；正式站確認輪播
