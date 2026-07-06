# dharma-cms — 入佛門法要內容管理

## Why

dharma 頁(入佛門法要)有 150+ 行硬編碼教學內容(序經、三皈依、五戒、三學),為全站最大的不可後台維護區塊。內容有「章節 → 小節」層次,需結構化入庫供後台編輯。

## What Changes

- 新增 `dharma_sections` 表:以資料列表達層次(章節分組 + 小節標題 + 純文字內文 + 排序 + 狀態),**不引入 Markdown** — 結構由資料列承載,內文維持純文字
- 一次性 seed:現行 dharma.vue 硬編碼內容逐字搬入
- 前台 dharma.vue 改讀 DB:依分組渲染章節與小節,頁首錨點導覽(序經/三皈依/五戒/三學)由分組動態產生;移除硬編碼內容
- 後台新增「法要管理」模組:依章節分組的列表、小節 CRUD 與排序(Naive UI,嚴格遵循現有 UI style)

## Capabilities

### New Capabilities

- `dharma-content`:法要教學內容的儲存、後台維護與前台呈現

### Modified Capabilities

- `database-security`:新增 `dharma_sections` 表的 RLS 要求

## Impact

- `supabase/migrations`:`dharma_sections` 表 + RLS + 內容 seed
- `packages/shared`:型別與 repository
- `apps/web`:dharma.vue 改接 DB
- `apps/admin`:新「法要管理」模組
- **依賴 `admin-ui-framework`**;與 `sutra-library` 互不阻塞
