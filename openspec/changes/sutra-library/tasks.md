# sutra-library 任務

## 1. 資料層與匯入

- [x] 1.1 migration:建 `sutras` 表(id、seq、title、translator nullable、content text、status、created_at)+ RLS(匿名僅讀已發布、admin 全 CRUD)
- [x] 1.2 `packages/shared`:Sutra 型別與 repository(前台僅撈已發布、依 seq 排序)
- [x] 1.3 匯入腳本(`scripts/`):17 份 docx 轉純文字(標題/譯者/段落解析)+ 現行心經,產出 seed migration;對含罕字圖的 2 份輸出警示供人工核對
- [x] 1.4 (已延後)罕字查證暫不處理:`麨` 先以 U+9EA8 取代;`⿰口陀` 匯入時以「(口+陀)」組字標注佔位,Unicode 查證與字型另案處理
- [x] 1.5 匯入後抽查 3 部經文與 docx 原文逐字比對(含標點、全形空白、段落切分)

## 2. 前台

- [x] 2.1 檢查 `app/router.options.ts` legacy hash 邏輯後,新增 `/sutra/[id]` 閱讀頁(標題/譯者/段落,逐段 escapeHtml;草稿回 404)
- [x] 2.2 既有 `/sutra` 改為心經入口(呈現心經該筆),移除硬編碼經文
- [x] 2.3 primer.vue:線上閱讀區改為依 seq 列出已發布經文(取代 2 張寫死卡片),保留 PDF 下載區;風格遵循既有卡片樣式

## 3. 後台

- [x] 3.1 新增「經文管理」模組:NDataTable 列表(分頁)、drawer 編輯(標題/譯者/內文/seq/狀態)、主題化刪除確認(嚴格遵循現有 UI style)
- [x] 3.2 後台側欄導覽加入模組入口

## 4. 驗證

- [x] 4.1 `pnpm lint && pnpm typecheck && pnpm test && pnpm build:web && pnpm build:admin` 通過
- [ ] 4.2 RLS:匿名讀草稿經文為空、寫入被拒
- [ ] 4.3 端到端:後台編輯/排序/上下架 → 前台列表與閱讀頁正確反映;`/sutra` 舊路徑呈現心經
