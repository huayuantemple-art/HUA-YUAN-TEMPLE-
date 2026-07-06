# sutra-library 設計

## Context

17 份 docx 結構一致:標題行 /(譯者行)/ 純段落散文,無小標與清單。僅 2 份含罕字內嵌圖(對應 `陀.jpg` = ⿰口陀、`麨.jpg` = 麨)。現行 sutra.vue 為硬編碼心經,primer.vue 為 2 張寫死卡片 + PDF 下載區。

## Goals / Non-Goals

**Goals:**

- 18 部經文(17 docx + 心經)入庫、可後台維護、前台依序閱讀
- 匯入與 docx 原文逐字一致

**Non-Goals:**

- 不做 Markdown/富文本(內容為純段落,不需要)
- 不做全文檢索、不做經文分卷結構
- PDF 下載區維持既有 documents 機制不動

## Decisions

1. **content 為純文字、換行分段,前台逐段 `escapeHtml` 包 `<p>`**
   - 完全沿用既有 XSS 鐵律,不引入 parser/sanitizer 新面向
   - 替代方案(Markdown)對純散文無收益、徒增安全審查面

2. **路由用數字 id(`/sutra/12`),不用中文 slug**
   - 寺院站無 SEO 競爭壓力,數字簡單穩定;中文 slug URL encode 醜且易變
   - 既有 `/sutra` 保留為心經入口(redirect 或直接渲染心經該筆);修改前檢查 `app/router.options.ts` 的 legacy hash 錨點邏輯

3. **匯入走「docx → 純文字 → seed migration」一次性腳本(`scripts/`)**
   - macOS `textutil` 轉純文字,人工抽查;seed 為 SQL migration,環境重建可重現
   - 排序依檔名編號 1–17,心經 seq 置於其後(後台可再調)

4. **罕字策略:優先 Unicode 正字**
   - `麨` = U+9EA8 直接用字
   - `⿰口陀` 需 spike:查 CBETA/Unicode 擴充區(Ext B+)是否收錄與 Noto Serif TC 覆蓋;查得到 → 用字 + 必要時罕字 webfont subset;查不到 → 以組字說明(如「(口+陀)」)標注,MUST NOT 在純文字管線裡混入行內圖片

## Risks / Trade-offs

- [docx 轉文字遺漏內嵌罕字圖位置] → 匯入腳本對含圖檔案(大般若 578、觀無量壽佛經)輸出警示,人工核對插入位置
- [長經文(無量壽經 45KB+)單頁載入] → 純文字體積小,ISR 靜態化後無實際負擔;不做分頁
- [`/sutra` 語意改變] → 保持該路徑呈現心經,外部舊連結行為不變

## Migration Plan

1. migration(表 + RLS)→ shared 型別/repository → 匯入腳本與 seed → 前台列表/閱讀頁 → 後台模組
2. 回滾:前台 primer 卡片與 sutra 硬編碼於本 change 才移除,revert 即回復

## Open Questions

- `⿰口陀` 的 Unicode 收錄與字型覆蓋(spike,見任務 1.4)— 不阻塞其他任務
