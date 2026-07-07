## Context

- documents（PDF/DOCX 檔案清單，前台依 `created_at.asc` 排序）與 sutras（線上閱讀，依 `seq.asc`）為獨立資料表；17 筆對應靠人工維持，心經（seq 18）僅有線上閱讀。
- 後台 DocumentsView 上傳檔案至 `pdfs` bucket（接受 pdf/docx），文檔列可手填 filename 引用既有檔案。
- 既有經文內文當初由離線腳本（`scripts/import-sutras.mjs`）從 DOCX 抽字灌入 — 證明 DOCX 抽字路徑可行。
- 用戶決策：上傳時自動抽字並發布；抽不出（掃描 PDF）建草稿待補。

## Goals / Non-Goals

**Goals:**

- 文檔的建立/改名/狀態/刪除自動同步對應經文，前台兩清單恆一致。
- 抽字在瀏覽器完成（DOCX via jszip 解 `word/document.xml`；PDF via pdfjs-dist 文字層），不經伺服器。
- 手填 filename（未經上傳按鈕）時自 storage 公開網址取檔抽字，行為一致。

**Non-Goals:**

- 不做 OCR（掃描 PDF 建草稿即可）。
- 不做既有經文內文的重抽或覆寫（回填只建關聯,不動內文）。
- 不改前台閱讀頁與心經入口。

## Decisions

1. **關聯欄位 `sutras.document_id`（FK, on delete set null）**：同步的真相來源。回填以標題精確比對（現已逐字一致）。刪除同步由後台顯式執行（確認對話框載明），FK 的 set null 僅為保險（直接動 DB 刪文檔時經文不會壞，只會退出清單）。
2. **前台清單改為 `document_id` 非空之已發布經文**：取代 primer.vue 以標題排除心經的寫法 — 排除規則由資料驅動，不再耦合標題字串。排序仍依 `seq`（建立時接續 max+1，與文檔 created_at 順序一致）。
3. **抽字策略**：DOCX 優先（品質同既有離線腳本：`w:p` 為段、`w:t` 串接）；PDF 以 pdfjs 文字層逐頁抽、`item.str` 串接,以 Y 座標變化斷行。抽出後 `trim`，空字串視為抽取失敗。
4. **狀態規則**：抽字成功 → sutra 狀態隨文檔（已發布/草稿）；抽字失敗 → 一律「草稿」+ 後台 toast 明示「請至經文管理補內文後發布」。
5. **編輯同步範圍**：名稱、狀態。內文編輯仍在經文管理（避免文檔表單膨脹）；重新上傳檔案不自動重抽（既有內文可能已人工修訂,重抽會蓋掉 — 保守）。
6. **依賴**：`jszip`（~100KB）與 `pdfjs-dist`（worker 以 `new URL(...,import.meta.url)` 掛載）僅入 admin bundle；web 不受影響。

## Risks / Trade-offs

- [PDF 文字層品質（斷行/頁眉）] → 抽出後管理者可於經文管理修訂；toast 提示可預覽。
- [手填 filename 引用之檔案不存在] → fetch 404 視為抽取失敗 → 草稿。
- [回填比對漏接] → 回填 SQL 帶 returning 驗證 17 筆全中；跑完以查詢核對。
- [同名文檔] → document_id 唯一約束不設（容許多版本），同步以文檔 id 為準不受影響。
