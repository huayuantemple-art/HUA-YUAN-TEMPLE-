## 1. 資料庫與共用層

- [x] 1.1 migration：`sutras` 加 `document_id bigint references documents(id) on delete set null` + 索引，回填既有 17 筆（標題精確比對）並以 returning 驗證
- [x] 1.2 `packages/shared/src/types.ts`：`Sutra` 加 `document_id: number | null`

## 2. 後台：抽字與同步

- [x] 2.1 admin 加依賴 `jszip`、`pdfjs-dist`；新增 `src/lib/docText.ts`：`extractDocumentText(bytes, ext)` — DOCX 解 `word/document.xml` 段落、PDF 讀文字層（Y 座標斷行），失敗回空字串
- [x] 2.2 `DocumentsView.vue` 新增文檔：保留上傳 File（或依 filename 自 storage 取檔）→ 抽字 → 建立對應 sutra（標題/內文/seq=max+1/狀態規則）→ toast 明示結果（已同步／草稿待補內文）
- [x] 2.3 編輯文檔：名稱/狀態變更同步 update 對應 sutra；刪除文檔：確認訊息載明連動並一併刪除 sutra
- [x] 2.4 重新上傳檔案不重抽內文（既有 sutra 不動）

## 3. 前台

- [x] 3.1 `primer.vue` readingList 改為 `document_id` 非空（移除標題排除心經寫法）

## 4. 驗證

- [x] 4.1 lint / typecheck / shared 測試通過；docText 抽字以本機檔案驗證（DOCX 與文字型 PDF）
- [x] 4.2 migration 套用後回填核對 17 筆全中、心經為 null；前台兩清單 17:17
- [ ] 4.3 後台實測（待用戶）：上傳→自動建經文→前台同步；改名/刪除連動；掃描檔→草稿提示（抽字邏輯已以 bucket 真實檔驗證：DOCX 8866 字乾淨段落、直排 PDF 9126 字正確斷行）
