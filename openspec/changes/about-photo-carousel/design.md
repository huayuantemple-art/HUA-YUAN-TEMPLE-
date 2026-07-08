## Context

關於頁照片：`about.image_url`（單張，後台上傳固定 key `about-image` 覆寫）＋一張寫死的 `/images/about-altar.jpg`。後台圖片一律經 `imageUpload.ts`（canvas 壓縮長邊 1600、webp、`?v=` cache-bust）。

## Goals / Non-Goals

**Goals:** 同一相框輪播、後台多張管理（上傳/刪除/上移）、無照片不開天窗。
**Non-Goals:** 不做拖曳排序、不做圖說文字、不動其他頁照片。

## Decisions

1. **`image_urls jsonb` 陣列為單一真相**，順序即輪播順序；回填 `[既有 image_url, altar 靜態檔網址]`。`image_url` 保留為後備（`image_urls` 為空時前台以其顯示單張），後台儲存時同步把第一張寫回 `image_url`（相容尚未部署的舊前台快取期）。
2. **上傳 key 改唯一值 `about-<timestamp>`**（多張不能共用固定 key 覆寫）；刪除僅自清單移除，不刪 storage 檔（與文檔管理「Storage 不受影響」慣例一致）。
3. **前台輪播手刻**（不引入套件）：`PhotoCarousel.vue` 接 `photos: string[]`，5 秒自動切換、淡入淡出、金色圓點可點選；僅一張時退化為靜態圖；`onMounted` 起動計時器避免 SSR 差異。相框沿用 `.about-photo` 尺寸與邊框樣式。
4. **後台清單 UI** 沿用 image-field 視覺：每張縮圖＋「上移/刪除」，下方為新增上傳 input;儲存整包寫 `image_urls`。

## Risks / Trade-offs

- [migration 未套用即部署前台 → image_urls undefined] → 前台以 `?? []` 容錯並退回 image_url;部署順序仍為 migration 先行。
- [輪播計時器記憶體洩漏] → onUnmounted 清除。
