## Context

最新公告頁（`apps/web/pages/news.vue`）目前為「跑馬燈 + 分類篩選 + 列表」。公告資料（`announcements` 表）含 `date` 欄位，為自由文字字串，慣例格式 `YYYY.MM.DD`（列表以 `.` 拆為「日 / 年.月」顯示，見 `dateParts()`）。頁面走 ISR 60 秒，資料經共用 api 層 `api.announcements.listPublished()` 取得。

## Goals / Non-Goals

**Goals:**

- 公告頁以月曆為唯一內容檢視（跑馬燈與分類篩選保留）。原規劃的「列表 / 月曆」切換做完後，用戶確認不需要列表，遂移除列表與切換鈕。
- 月曆為手刻元件，視覺沿用既有 style（深棕 `#3a211c`、金 `#c9a24b`、米 `#f2e4c8`、Noto Serif TC 標題字體、金色細分隔線 `rgba(201,162,75,.25)`）。
- 日期解析容錯：只有能解析為合法日期的公告才進月曆。

**Non-Goals:**

- 不新增 `events` 資料表或未來活動時程功能。
- 不動後台（admin）與資料庫 schema / RLS。
- 不引入外部日曆或日期套件（不加依賴）。
- 不改變 ISR 快取策略與跑馬燈行為。

## Decisions

1. **日期解析放 `packages/shared`（`parseAnnouncementDate`）**
   - 理由：與 `siteCopy` / `sanitize` 同層級的純函式，可被單元測試覆蓋（shared 是目前唯一有 Vitest 的套件）；未來後台若要驗證日期格式可直接重用。
   - 行為：輸入 `string | null`，以 `^(\d{4})\.(\d{1,2})\.(\d{1,2})$` 比對並驗證為真實存在的日期（例如 2 月 30 日視為無效），回傳 `{ year, month, day } | null`。不用 `new Date(string)` 寬鬆解析，避免瀏覽器間差異。
   - 替代方案：寫在 `apps/web` 內 → 否決，無法被現有測試基礎覆蓋、之後無法重用。

2. **月曆為獨立元件 `apps/web/components/NewsCalendar.vue`，資料由 news.vue 傳入**
   - 理由：news.vue 已載入全部已發布公告，月曆只做展示，不重複打 API；元件無自己的資料層，容易維護。
   - 月格以 `Date` 原生 API 計算（當月第一天星期、當月天數），週日起始，固定 7 欄。

3. **分類篩選直接作用於月曆**
   - 頁面既有 `.filter-btn` 分類按鈕組與 `useState('news-filter')` session 記憶模式保留，月曆吃篩選後的 `list` computed。
   - （歷史）初版有「列表 / 月曆」切換與 `useState('news-view')`，後依用戶決定移除列表，切換鈕一併拿掉。

4. **選日互動：點擊有標記的日期，於月曆下方顯示該日公告卡片**
   - 理由：不用 popover/tooltip（避免 RWD 與無障礙複雜度），下方列表直接重用列表項的視覺語彙。
   - 預設選中「今天」（若當月有公告則顯示，無則顯示空狀態文案「此日期無公告。」——功能性文案依規範留在程式碼，不進 site_content）。

5. **月曆初始月份 = 最新一筆可解析公告的年月**，切月按鈕（‹ ›）不設範圍上限，但顯示範圍外月份時空狀態正常呈現。

## Risks / Trade-offs

- [`date` 髒資料（如 `2026.13.40`、空字串）] → 解析器嚴格驗證，無效者不會出現在月曆；列表已移除，故後台輸入日期須維持 `YYYY.MM.DD`（跑馬燈仍會輪播標題，公告不至於完全隱形）。
- [同日多則公告] → 打點相同，點擊後全部列出（依 `created_at` 倒序）。
- [SSR/ISR 下「今天」的時區] → 預設選中日以客戶端 `new Date()` 於 mounted 後套用，避免 server 端時區差異快取進 ISR 頁面。
- [視覺不一致風險] → 只用頁面既有色票與字體變數，e2e `visual` 專案可加截圖比對（列入 tasks 的驗證項）。
