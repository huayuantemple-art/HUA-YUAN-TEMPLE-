# site-copy-cms — 網站文案的後台管理

## Why

前台散落大量硬編碼的內容性文案(首頁佛經引文與詩句、關於頁 banner 詩句與 kicker、primer 頁華嚴經引文、課程頁報名提示、footer 品牌文案、首頁/primer 卡片文字等),每次修改都要動程式碼。目標:**前台所有內容性文案皆可透過後台編輯**;功能性文字(讀取中、驗證訊息、按鈕文字)明確排除、留在程式碼。

## What Changes

- 新增 `site_content` key-value 表(key 為主鍵、value 為文案),RLS:匿名僅 SELECT、admin 可寫
- `packages/shared` 定義 typed key 清單與**預設值(即現行硬編碼文案)**,前後台共用;key 打錯字成為編譯錯誤
- 前台各頁改讀 `site_content`,查無 key 或值為空時 fallback 至預設值 — 網站永不因缺資料開天窗
- 後台新增「網站文案」模組:依頁面分組列出所有 key,逐項編輯(以 Naive UI 實作,嚴格遵循現有 UI style)
- 納管範圍:首頁(引文、詩句、入門佛法三卡片文字)、關於頁(banner 詩句、kicker)、primer 頁(banner 引文、線上閱讀卡片文字)、課程頁(報名提示框)、footer(品牌文案);導覽選單與功能性文字不納入

## Capabilities

### New Capabilities

- `site-copy-management`:網站文案的儲存、後台編輯與前台 fallback 呈現

### Modified Capabilities

- `database-security`:新增 `site_content` 表的 RLS 要求

## Impact

- `supabase/migrations`:`site_content` 表 + RLS + 預設值 seed(可選)
- `packages/shared`:key 清單、預設值、repository
- `apps/web`:各頁面文案改接 DB(含 fallback)
- `apps/admin`:新「網站文案」模組
- **依賴 `admin-ui-framework`**(後台新頁面以 Naive UI 實作)
