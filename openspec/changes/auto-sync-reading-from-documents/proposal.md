## Why

「線上閱讀」與「佛法文檔下載」目前是兩份獨立資料（sutras / documents），對應關係靠人工維持：新增 PDF 後要另外手動建經文、對順序、對標題。用戶希望上傳文檔後線上閱讀自動同步一致。

## What Changes

- `sutras` 新增 `document_id` 欄位（FK → documents，migration）並回填既有 17 筆對應（標題已逐字一致）。
- 後台「佛法文檔」儲存流程自動同步線上閱讀：
  - 新增文檔 → 於瀏覽器自動抽取上傳檔（DOCX/PDF）文字為經文內文，建立對應 sutra（標題=文檔名稱、序號接續、狀態隨文檔）；抽不出文字（掃描檔）則建「草稿」，管理者於經文管理補內文後發布。
  - 編輯文檔名稱/狀態 → 同步更新對應 sutra 標題/狀態。
  - 刪除文檔 → 一併刪除對應 sutra（確認訊息載明）。
- 前台法寶略節「線上閱讀」改列「有對應文檔」的已發布經文（`document_id` 非空），取代現行以標題排除心經的寫法 — 件數/順序/標題自動與文檔一致。
- 後台新增依賴：`jszip`（DOCX 解壓）、`pdfjs-dist`（PDF 文字層抽取），僅 admin 使用。

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `sutra-library`: 線上閱讀清單改由文檔對應關係驅動；經文可與文檔連動建立。
- `admin-console`: 佛法文檔管理新增自動同步線上閱讀之行為（建立/改名/狀態/刪除）。

## Impact

- `supabase/migrations/`（sutras.document_id + 回填）
- `packages/shared/src/types.ts`（Sutra.document_id）
- `apps/admin`：`src/lib/docText.ts`（新）、`DocumentsView.vue`、`package.json`（jszip、pdfjs-dist）
- `apps/web/pages/primer.vue`（readingList 改依 document_id）
- 心經無對應文檔（document_id null），自然不列入線上閱讀，首頁 `/sutra` 入口不受影響
