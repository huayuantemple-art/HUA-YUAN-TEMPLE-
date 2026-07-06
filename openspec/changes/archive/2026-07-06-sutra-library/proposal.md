# sutra-library — 法寶略節經文庫

## Why

《華圓覺苑網站頁面資料修改》指示「按順序放入法寶略節資料夾內容」:17 部經文節錄(docx)需成為法寶略節頁的正式內容,加上既有的心經頁,共 18 部。目前 primer 頁只有 2 張寫死的閱讀卡片、sutra 頁只有硬編碼心經 — 經文需可於後台維護(含最不常變動的心經)。

## What Changes

- 新增 `sutras` 表(seq 排序、title、translator、content 純文字段落、status),RLS 比照內容表(匿名僅讀已發布)
- **一次性匯入**:17 份 docx 轉純文字 + 現行心經,以 seed migration 匯入;罕字以 Unicode 正字取代(`麨` U+9EA8;`⿰口陀` 另行查證)
- 前台 primer 頁(法寶略節)改為依 seq 列出已發布經文的閱讀列表,保留既有 PDF 下載區
- 前台新增 `/sutra/[id]` 經文閱讀頁(標題/譯者/段落,段落以換行切分、逐段 `escapeHtml`);既有 `/sutra` 轉向心經該筆,舊連結不斷
- 後台新增「經文管理」模組:CRUD、排序、上下架(Naive UI,嚴格遵循現有 UI style)
- **不引入 Markdown**:經文皆為純段落文字,XSS 鐵律零增修

## Capabilities

### New Capabilities

- `sutra-library`:經文的儲存、後台維護與前台閱讀

### Modified Capabilities

- `database-security`:新增 `sutras` 表的 RLS 要求

## Impact

- `supabase/migrations`:`sutras` 表 + RLS + 內容 seed
- `packages/shared`:Sutra 型別與 repository
- `apps/web`:primer.vue 列表、`/sutra/[id]` 動態路由(改路由前檢查 `app/router.options.ts` 的 legacy hash 邏輯)
- `apps/admin`:新「經文管理」模組
- **依賴 `admin-ui-framework`**;來源檔案:`/Users/ray.shao/Downloads/華圓覺苑網站/法寶略節/`(17 份 docx + 罕字圖 2 張)
