# admin-ui-framework — 後台導入 Naive UI 元件庫

## Why

後台目前為手刻 CSS,已留下三個 `@todo`:刪除確認仍用原生 `confirm()`、公告列表無分頁、日期為純文字輸入。接下來的內容管理擴充(經文庫、法要、網站文案)都需要列表分頁與表單元件,若不先導入元件庫與共用 table pattern,新頁面會先手刻一次再重寫一次。

## What Changes

- apps/admin 導入 Naive UI,以 `NConfigProvider` 主題覆蓋(theme overrides)+ 必要的元件層級樣式覆寫,**嚴格遵循現有 UI style**(金棕色系 `#c9a24b` / `#3a211c`,`.card`/`.btn`/`.inp` 的視覺規格):換用元件庫後使用者不得察覺視覺差異,此為本 change 的驗收原則
- 刪除確認改用 Naive UI 對話框(`useDialog`),取代原生 `confirm()`(AnnouncementsView 及其他有刪除操作的頁面)
- 建立 `AdminDataTable` 共用元件,以 `NDataTable` + 獨立 `NPagination` 統一後台列表樣式、資料切片、空狀態、固定在 admin view 底部的分頁列
- 公告、課程、報名資料、佛法文檔、帳號管理列表改用共用 table component 並啟用分頁
- 佛法文檔表單支援 PDF / DOCX 上傳至 Supabase Storage,上傳成功後自動回填檔名;資料庫仍只存檔名
- 公告發佈日期改用 `NDatePicker`,`value-format` 設為 `yyyy.MM.dd` — 資料庫欄位維持 text,不做 migration(既有 `yyyy.MM.dd` 字串排序即等於時間排序)
- 僅逐元件引入(tree-shaking),不做全面改版;未觸碰的手刻樣式頁面維持不動,本 change 觸碰到的列表優先收斂到 Tailwind utility + Naive UI 元件

## Capabilities

### New Capabilities

(無)

### Modified Capabilities

- `admin-console`:刪除操作的確認機制由原生 confirm 改為風格一致的對話框;主要後台列表需使用共用 table component 並支援分頁;佛法文檔需支援 PDF / DOCX 上傳;公告日期欄位需以日期選擇器輸入並輸出 `yyyy.MM.dd` 格式

## Impact

- 受影響程式碼:主要為 `apps/admin`(`package.json` 新增 `naive-ui` 依賴、App 根組件加入 `NConfigProvider`/`NDialogProvider`、新增 `src/lib/theme.ts` 與 `src/components/AdminDataTable.vue`、改寫公告/課程/報名資料/佛法文檔/帳號管理列表)
- `apps/web/nuxt.config.ts` 僅因 workspace Vite/Tailwind 型別解析需要小幅調整,無前台行為變更
- 無資料庫 schema 變更、無 `packages/shared` 變更、無前台(apps/web)影響
- 後續 change(`sutra-library`、`dharma-cms`、`site-copy-cms`)的新後台頁面將直接以 Naive UI 元件實作,依賴本 change 先行
