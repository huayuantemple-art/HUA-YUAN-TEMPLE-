# dharma-cms 任務

## 1. 資料層

- [x] 1.1 migration:建 `dharma_sections` 表(id、group_key、title nullable、content text、seq、status、created_at)+ RLS(匿名僅讀已發布、admin 全 CRUD)
- [x] 1.2 seed migration:現行 dharma.vue 硬編碼內容逐字整理入庫(序經/三皈依/五戒/三學 各章節小節與順序)
- [x] 1.3 `packages/shared`:DharmaSection 型別與 repository(前台僅撈已發布、group + seq 排序)

## 2. 前台

- [x] 2.1 dharma.vue 改讀 DB:依 group_key 分組渲染章節與小節,錨點導覽動態產生,內文逐段 escapeHtml
- [ ] 2.2 以現行頁面截圖為基準逐節比對(標題層級、縮排、段落),確認渲染一致後移除硬編碼內容(獨立 commit)

## 3. 後台

- [x] 3.1 新增「法要管理」模組:依章節分組列表、drawer 編輯(章節下拉/標題/內文/seq/狀態)、主題化刪除確認(嚴格遵循現有 UI style)
- [x] 3.2 後台側欄導覽加入模組入口

## 4. 驗證

- [x] 4.1 `pnpm lint && pnpm typecheck && pnpm test && pnpm build:web && pnpm build:admin` 通過
- [ ] 4.2 RLS:匿名讀草稿為空、寫入被拒
- [ ] 4.3 端到端:後台增修小節與排序 → 前台正確反映;空表情境確認頁面不致錯誤(顯示空狀態)
