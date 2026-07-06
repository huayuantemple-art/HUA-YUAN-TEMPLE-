## 1. 資料庫

- [x] 1.1 新增 migration：`registrations` 加 `age`、`gender`、`venue`、`dharma_background`、`referral_source`、`expectation`（皆 text null）；附欄位註解
- [x] 1.2 更新 `packages/shared/src/types.ts` 的 `Registration`（NewRegistration 隨之涵蓋新欄位）

## 2. 前台報名表單

- [x] 2.1 `signup.vue` 基本資料區：年齡（必填，1~3 位數字）、Email 改必填、性別單選（男/女）、上課地點單選（華圓新莊講堂/華圓台東講堂）、招生對象說明文字
- [x] 2.2 學員背景區：修學背景單選 3 項、如何得知本課程複選 4 項、希望從課程中獲得什麼複選 3 項（選項文字與紙本逐字一致）
- [x] 2.3 送出 payload 帶新欄位（複選以「、」串接，未填為 null）；驗證錯誤訊息沿用既有樣式；honeypot、頻率上限、隱私權同意保留
- [x] 2.4 radio/checkbox 樣式沿用 signup 頁視覺（accent-color gold、既有 field/lbl 語彙），含手機版

## 3. 後台報名管理

- [x] 3.1 `RegistrationsView.vue` 列表加「年齡、性別、上課地點」欄
- [x] 3.2 CSV 匯出涵蓋全部欄位（姓名、課程、電話、Email、年齡、性別、上課地點、修學背景、如何得知本課程、課程期望、備註、報名時間）

## 4. 驗證

- [x] 4.1 `pnpm lint`、`pnpm typecheck`、shared 測試通過
- [x] 4.2 瀏覽器驗證表單：必填驗證（含年齡格式）、單/複選互動、未同意隱私不可送出；不實際送出（dev 連 production DB 且 migration 未套用）
- [ ] 4.3 提醒用戶：先於 Supabase Dashboard 套用 migration，再部署 web/admin（順序不可反）
