# dharma-cms 設計

## Context

dharma.vue 的教學內容有兩層結構:章節(序經/三皈依/五戒/三學,對應頁首錨點)與小節(如「釋名」「稱『寶』六義」「分別解說」),小節內為純段落文字。這是全站唯一有層次的長文,但層次淺而固定 — 不需要富文本。

## Goals / Non-Goals

**Goals:**

- 教學內容結構化入庫,住持可自行增修小節
- 現行內容逐字搬移,前台呈現不變

**Non-Goals:**

- 不做 Markdown/富文本編輯器(層次由資料列承載即足)
- 不做任意深度的章節樹(固定兩層:章節分組 → 小節)
- 章節(group)本身不開放後台增刪 — 錨點與版面樣式綁章節,新增章節屬改版

## Decisions

1. **「資料列即結構」而非 Markdown**
   - 兩層結構用 `group_key + title + seq` 表達,內文純文字換行分段 → XSS 鐵律零增修
   - 替代方案(Markdown + sanitizer):為淺層固定結構引入整條安全審查面,不值

2. **`group_key` 為固定枚舉(序經/三皈依/五戒/三學)**
   - 前台錨點與章節標題樣式依枚舉渲染;後台以分組下拉選擇
   - 若未來需自訂章節,屆時再開 `dharma_groups` 表,本次不預作

3. **seed 由現行 dharma.vue 內容產生**
   - 搬移腳本或人工整理皆可(內容量 150 行,一次性);驗收標準是前台渲染與現行頁面逐字一致

## Risks / Trade-offs

- [硬編碼移除後 DB 空表 = 空頁] → seed 與前台改動同一 change 內完成;上線順序:先套 migration(含 seed)再部署前端
- [小節標題層級呈現(釋名/分別解說)與現行縮排差異] → 驗收以現行頁面截圖為基準逐節比對

## Migration Plan

1. migration(表 + RLS + seed)→ shared → 前台改讀 DB → 後台模組
2. 回滾:revert 前端即回硬編碼(本 change 移除硬編碼的 commit 獨立,便於單獨 revert)

## Open Questions

(無)
