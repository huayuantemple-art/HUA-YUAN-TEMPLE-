## Why

最新公告頁目前僅有列表檢視，訪客無法以「日期」的角度快速瀏覽公告分佈（例如查看某月有哪些法會或課程消息）。公告資料已含 `date` 欄位，加上月曆檢視即可提升瀏覽體驗，且不需任何後端變更。

## What Changes

- 最新公告頁（`apps/web/pages/news.vue`）改以月曆為唯一內容檢視：原列表檢視與「列表 / 月曆」切換鈕移除（用戶決定不需要列表），跑馬燈與分類篩選保留。
- 新增手刻月曆元件（`apps/web/components/NewsCalendar.vue`）：
  - 月格檢視，可切換上一月／下一月，顯示當前年月。
  - 有公告的日期顯示標記（金色圓點），點擊該日期於月曆下方顯示當日公告（標題、標籤、內容）。
  - 視覺嚴格沿用既有風格：深棕 `#3a211c`、金色 `#c9a24b`、米色 `#f2e4c8`、標題字體 Noto Serif TC。
- 公告 `date` 為自由文字字串（預期格式 `YYYY.MM.DD`）：新增共用解析函式，解析失敗（格式不符或非法日期）的公告不出現在月曆；因列表已移除，後台輸入日期須維持正確格式（跑馬燈不受影響）。
- 不新增資料表、不修改後台、不引入外部套件。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `public-site`: 最新公告頁新增「列表 / 月曆」檢視切換之需求；月曆僅顯示可成功解析日期的已發布公告，視覺遵循既有 UI style。

## Impact

- `apps/web/pages/news.vue` — 加入檢視切換與月曆掛載。
- `apps/web/components/NewsCalendar.vue` — 新增月曆元件。
- `packages/shared/src/`（`sanitize.ts` 旁新增或併入合適模組）— 新增 `parseAnnouncementDate` 日期解析工具與單元測試。
- 無資料庫、RLS、後台、部署設定變更；ISR 快取行為不變。
