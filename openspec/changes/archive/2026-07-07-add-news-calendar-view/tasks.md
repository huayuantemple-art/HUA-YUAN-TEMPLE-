## 1. 共用層：日期解析

- [x] 1.1 在 `packages/shared/src` 新增 `parseAnnouncementDate(date: string | null)`：以 `^(\d{4})\.(\d{1,2})\.(\d{1,2})$` 比對並驗證真實日期，回傳 `{ year, month, day } | null`，並自 `index.ts` 匯出
- [x] 1.2 新增 `packages/shared/test/parseAnnouncementDate` 單元測試：合法日期、格式錯誤、不存在日期（2 月 30）、空字串與 null

## 2. 前台：月曆元件

- [x] 2.1 新增 `apps/web/components/NewsCalendar.vue`：props 接公告陣列，內部以原生 `Date` 計算月格（週日起始、7 欄），可切換上一月／下一月並顯示當前年月
- [x] 2.2 有公告日期打金色圓點標記；點擊該日於月曆下方列出當日公告（標題、標籤、內容，`created_at` 倒序），無公告日期顯示「此日期無公告。」
- [x] 2.3 初始月份取最新一筆可解析公告之年月；「今天」的預設選中於 mounted 後在客戶端套用（避免 ISR 時區問題）
- [x] 2.4 視覺沿用既有 style：`#3a211c` / `#c9a24b` / `#f2e4c8`、Noto Serif TC 標題、`rgba(201,162,75,.25)` 分隔線，含手機版 RWD

## 3. 前台：公告頁整合

- [x] 3.1 `apps/web/pages/news.vue` 新增「列表 / 月曆」切換鈕（複用 `.filter-btn` 樣式），檢視狀態存 `useState('news-view')`，預設列表
- [x] 3.2 月曆檢視共用既有分類篩選結果（`list` computed），切換分類時兩種檢視結果一致

## 4. 驗證

- [x] 4.1 `pnpm --filter @huayuan/shared test`、`pnpm lint`、`pnpm typecheck` 全數通過
- [x] 4.2 本機 `pnpm dev:web` 手動驗證：切換檢視、切月、點日、分類篩選、手機寬度版面
- [x] 4.3 確認無效 `date` 公告僅缺席月曆、列表照常（可用現有資料或暫時 mock 驗證）

## 5. 調整：移除列表檢視（用戶決定）

- [x] 5.1 `news.vue` 移除列表渲染、「列表 / 月曆」切換鈕與 `dateParts()`；月曆為唯一內容檢視，跑馬燈與分類篩選保留
- [x] 5.2 重跑 lint / typecheck 並於瀏覽器驗證：進頁即月曆、分類篩選、手機版面
