# site-copy-cms 任務

## 1. 資料層與共用層

- [x] 1.1 migration:建 `site_content` 表(key text PK、value text、updated_at)+ RLS(匿名 SELECT、admin 全寫)
- [x] 1.2 `packages/shared`:定義 `SITE_COPY` typed key 清單(key/group/label/defaultValue),預設值原樣搬移現行硬編碼文案
- [x] 1.3 `packages/shared`:`site_content` repository 與 `getCopy` helper(DB 值 || 預設值),補 Vitest 測試

## 2. 前台接線(每頁獨立可驗證)

- [x] 2.1 index.vue:佛經引文、hero 詩句、入門佛法三卡片文字
- [x] 2.2 about.vue:banner 詩句、kicker
- [x] 2.3 primer.vue:banner 華嚴經引文、線上閱讀卡片文字
- [x] 2.4 course.vue:報名提示框文案
- [x] 2.5 SiteFooter.vue:品牌文案
- [x] 2.6 全站檢查:各頁在 `site_content` 空表時顯示與現行完全一致(fallback 驗證)

## 3. 後台模組

- [x] 3.1 新增「網站文案」view:依 group 分組列出 key(中文 label),顯示現值或預設值提示,逐項編輯儲存(Naive UI,嚴格遵循現有 UI style)
- [x] 3.2 儲存成功訊息註明「前台約一分鐘內更新」
- [x] 3.3 後台側欄導覽加入模組入口

## 4. 驗證

- [x] 4.1 `pnpm lint && pnpm typecheck && pnpm test && pnpm build:web && pnpm build:admin` 通過
- [ ] 4.2 RLS:匿名寫入 `site_content` 被拒
- [ ] 4.3 端到端:後台改一則文案 → 前台 ISR 後更新;清空該值 → 前台回 fallback
