# admin-ui-framework 任務

## 1. 基礎建置

- [ ] 1.1 apps/admin 安裝 `naive-ui`(pnpm --filter @huayuan/admin add naive-ui)
- [ ] 1.2 盤點既有 CSS 的視覺規格(色彩/字體/間距/圓角/邊框實際值),建立 `src/lib/theme.ts` 的 `GlobalThemeOverrides` 逐項對照
- [ ] 1.3 App 根組件包 `NConfigProvider`(套 theme)+ `NDialogProvider`,確認既有頁面視覺無回歸
- [ ] 1.4 對公告頁截圖存檔,作為改寫後嚴格比對的基準

## 2. 收掉 AnnouncementsView 三個 @todo

- [ ] 2.1 刪除確認改用 `useDialog` 主題化對話框,移除原生 `confirm()`(@todo :76)
- [ ] 2.2 發佈日期改用 `NDatePicker`,`value-format: yyyy.MM.dd`,驗證既有資料回填與儲存格式不變(@todo :160)
- [ ] 2.3 公告列表改用 `NDataTable` 並啟用分頁;搜尋/分類篩選變更時重設回第一頁(@todo :107)
- [ ] 2.4 移除已完成的三個 `@todo` 註解

## 3. 驗證

- [ ] 3.1 `pnpm lint && pnpm typecheck && pnpm build:admin` 全數通過
- [ ] 3.2 手動驗證:公告 CRUD 全流程(新增/編輯/刪除/篩選/分頁/日期選擇)行為正確
- [ ] 3.3 視覺驗收:與 1.4 基準截圖逐項比對(色彩/字體/間距/圓角/邊框),達到「使用者無法察覺元件庫替換」;不通過則補元件層級樣式覆寫
