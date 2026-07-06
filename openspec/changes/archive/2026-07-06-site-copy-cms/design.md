# site-copy-cms 設計

## Context

全站普查(2026-07-06)確認硬編碼文案分布:index、about、primer、course、footer 為內容性文案重災區;dharma/sutra 的長文另由 `dharma-cms` / `sutra-library` 處理;signup 頁多為功能性文字,不納管。

## Goals / Non-Goals

**Goals:**

- 內容性文案全數可後台編輯,且缺值永遠有 fallback
- key 清單型別安全,前後台共用單一來源

**Non-Goals:**

- 功能性文字、導覽選單(綁路由,DB 化徒增壞連結風險)
- 長文內容(法要、經文,另有結構化表)
- 多語系

## Decisions

1. **單一 KV 表(而非每頁一張表)**
   - 文案皆為單例、無結構,KV 最省;新增文案不需 migration,加 key + 預設值即可
   - 替代方案:page_banners 等多張小表 → 每加一處文案都要動 schema,過度設計

2. **預設值即現行硬編碼文案,定義於 shared**
   - `SITE_COPY` 常數:`{ key, group, label, defaultValue }`;前台以 `getCopy(key)` 讀 DB 值 || 預設值
   - seed 可不做 — 空表也能上線,後台顯示預設值提示,編輯時才寫入

3. **後台以「分組 + 逐項編輯」呈現,不做自由新增 key**
   - key 由程式碼定義,後台只能編輯值 — 防止孤兒 key 與拼字錯誤

4. **ISR 60s 的內容延遲:接受並明示**
   - 儲存成功訊息註明「前台約一分鐘內更新」;on-demand revalidation 留待未來需要時再加

## Risks / Trade-offs

- [KV 值失去欄位語意] → shared 清單附 `label`/`group` 中文說明,後台呈現有語境
- [文案含換行/全形空白的呈現差異] → 預設值原樣搬移現行字串,渲染邏輯沿用各頁現行處理(如 headline 的全形空白轉 `<br>`)

## Migration Plan

1. migration 建表 + RLS → shared key 清單與 repository → 前台逐頁接上(每頁一個 commit,可獨立驗證)→ 後台模組
2. 回滾:前台 fallback 設計使 revert 任一階段皆安全

## Open Questions

(無)
