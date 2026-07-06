## Why

線上報名（`/signup`）目前僅收姓名、電話、Email（選填）、備註，與實體「佛法入門班報名表」不一致；紙本表另收年齡、性別、上課地點、修學背景、如何得知課程、課程期望等欄位。線上/紙本欄位對齊後，招生資料才完整可比。

## What Changes

- `registrations` 資料表新增欄位（migration，由用戶於 Supabase Dashboard 套用）：`age`、`gender`、`venue`、`dharma_background`、`referral_source`、`expectation`（皆 text、可空；複選以「、」串接存單一欄位）。
- 前台 `/signup` 表單比照紙本報名表：
  - 必填：姓名、電話、Email（改為必填）、年齡（紙本帶 * 者）。
  - 單選：性別（男/女）、上課地點（華圓新莊講堂/華圓台東講堂）、修學背景（初次接觸佛法/曾自行閱讀相關書籍/曾於道場或寺院修學）。
  - 複選：如何得知本課程（親友介紹/道場網站/社群媒體（Facebook、Instagram）/其他）、希望從課程中獲得什麼（頂戴正信佛教/希望有世間活動（例如：園遊會、團康活動）/其他）。
  - 顯示招生對象說明「18~65 歲，無不良嗜好之四眾弟子」。
  - 既有防濫用（honeypot＋頻率上限）與隱私權同意勾選 MUST 保留（安全不變量）。
- 後台報名列表新增性別/年齡/上課地點欄位顯示，CSV 匯出涵蓋全部新欄位。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `course-signup`: 報名表單欄位比照紙本報名表擴充；Email 改必填、新增年齡必填與單/複選欄位。
- `admin-console`: 報名管理顯示與 CSV 匯出涵蓋新欄位。

## Impact

- `supabase/migrations/`（新增 migration；RLS 為列層級不需調整）
- `packages/shared/src/types.ts`（Registration/NewRegistration）
- `apps/web/pages/signup.vue`（表單欄位、驗證、送出 payload）
- `apps/admin/src/views/RegistrationsView.vue`（欄位、CSV）
- 注意：migration 未套用前，新表單送出會失敗（PostgREST 不認得新欄位）——部署前務必先跑 migration。
