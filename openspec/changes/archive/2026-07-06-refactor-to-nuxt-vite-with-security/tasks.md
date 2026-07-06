# 實作原則(每個 task 都適用)

> **功能 1:1 照搬、UI 1:1 照搬**。任何與現有站台的功能或外觀差異都視為 bug,不是「順手改進」。業務邏輯優化不在本次範圍。

## 1. 階段一 — 資料庫安全(可先獨立交付)

- [x] 1.1 建立 `profiles` 表(`id` 對應 `auth.users`、`role` enum `super_admin|admin`、`email`、`created_at`),寫成 Supabase migration
- [x] 1.2 為既有最高權限帳號建立 `profiles` 紀錄並設為 `super_admin`
- [x] 1.3 撰寫 helper(如 SQL function)判斷目前 JWT 對應之角色,供 RLS policy 使用
- [x] 1.4 為 `announcements`/`courses`/`videos`/`documents` 建 RLS:匿名僅 `SELECT` 公開狀態;admin/super_admin 全 CRUD
- [x] 1.5 為 `about`/`contact` 建 RLS:匿名 `SELECT`;admin/super_admin `UPDATE`
- [x] 1.6 為 `registrations` 建 RLS:匿名僅 `INSERT`;禁止匿名 `SELECT`;admin/super_admin 可 `SELECT`
- [x] 1.7 加「登入但無 `profiles` 紀錄視為無權限」的防呆
- [x] 1.8 撰寫遷移腳本:將既有 `contact.map_embed` 由 iframe HTML 轉為網址/座標
- [x] 1.9 於現有前端暫時改為白名單安全組成地圖 iframe(消除 XSS,兼容舊站)
- [x] 1.10 輪替 anon key,並更新所有前端引用;確認 `service_role` 不在任何前端/版控檔案(前端改用 `sb_publishable` key,legacy anon key 已於 2026-07-05 停用)
- [x] 1.11 撰寫並執行安全驗證:以 anon key 對每張表嘗試 `INSERT/UPDATE/DELETE` 與讀 `registrations`,確認全被拒絕(`scripts/security-verify.sh`,24/24 PASS)

## 2. 階段二 — Monorepo 骨架與共用套件

- [x] 2.1 建立 pnpm workspace(`apps/web`、`apps/admin`、`packages/shared`、`supabase/`)與根 `pnpm-workspace.yaml`
- [x] 2.2 設定 TypeScript、ESLint、Prettier(根層共用設定)
- [x] 2.3 `packages/shared`:Supabase client 工廠(讀環境變數)
- [x] 2.4 `packages/shared`:以 axios 封裝的 api repository 層(集中讀寫、錯誤、loading)
- [x] 2.5 `packages/shared`:sanitize/逃逸模組 + 地圖網域白名單組 iframe helper
- [x] 2.6 `packages/shared`:所有資料表的 TypeScript 型別
- [x] 2.7 設定 `.env` 範本(`VITE_/NUXT_` 對應之 Supabase URL/anon key),確認金鑰不進版控
- [x] 2.8 為 `packages/shared` 寫 Vitest 單元測試(sanitize、api 層錯誤處理)(16/16 PASS)

## 3. 階段二 — 前台(apps/web,Nuxt 3 + ISR)

- [x] 3.1 建立 Nuxt 3 專案、接 `packages/shared`、設定 Tailwind
- [x] 3.2 原樣移植現有 `index.html` 的全域 CSS/字型/版面基底
- [x] 3.3 移植共用元件(footer、卡片、loading/空狀態)對照現有
- [x] 3.4 首頁 1:1 還原(含動態區塊)
- [x] 3.5 最新公告頁 1:1 還原(依狀態/時間)
- [x] 3.6 課程頁 1:1 還原(招生中/額滿呈現)
- [x] 3.7 法師說法頁 1:1 還原
- [x] 3.8 佛法文檔頁 1:1 還原,PDF 連結改指 Supabase Storage
- [x] 3.9 關於我們頁 1:1 還原
- [x] 3.10 聯絡與交通頁 1:1 還原,地圖以白名單 iframe 安全渲染
- [x] 3.11 設定 ISR(再生策略),確認頁面為可索引 HTML 且後台更新後會刷新

## 4. 階段二 — 課程報名(apps/web 或獨立入口)

- [x] 4.1 兩步驟報名流程 1:1 還原(選課 → 表單 → 完成畫面)
- [x] 4.2 表單驗證 1:1 還原(姓名/電話必填、Email 格式)
- [x] 4.3 新增隱私權同意 checkbox(未勾選不可送出)
- [x] 4.4 加入防濫用(honeypot + rate limit;必要時 captcha),確保正常流程無感(防護為前端層:honeypot + 成功送出頻率上限,僅計成功寫入且額度高於正常代報名;繞過瀏覽器直呼 REST 者僅受 RLS 限制只能 INSERT——server-side rate limit / captcha 遞延至後續變更,依 design.md open question 視實際流量決定)
- [x] 4.5 送出寫入 `registrations`,確認在 RLS 下匿名 `INSERT` 正常

## 5. 階段二 — 後台(apps/admin,Vite + Vue 3 SPA)

- [x] 5.1 建立 Vite + Vue 3 專案、Vue Router、Pinia、接 `packages/shared`、設定 Tailwind
- [x] 5.2 原樣移植現有 `admin.html` 的全域 CSS/版面基底(Naive UI 僅在不影響外觀時選用)(以現有 CSS 為 source of truth,未引入 Naive UI)
- [x] 5.3 登入頁與 Supabase Auth 流程 1:1 還原(含既有 session 自動進入、錯誤訊息;無 profile 帳號登入即登出並顯示無權限,對應 1.7 防呆)
- [x] 5.4 依角色的路由守衛(未登入導向登入;`meta.superAdminOnly` 已備妥,帳號管理頁於 6.3 掛上)
- [x] 5.5 總覽 dashboard 1:1 還原
- [x] 5.6 公告管理 CRUD 1:1 還原
- [x] 5.7 課程管理 CRUD + 狀態 1:1 還原
- [x] 5.8 報名資料檢視 + CSV 匯出(含 BOM、檔名格式)1:1 還原(課程篩選選單改由 courses 直接供給,修舊站「未進課程頁前選單為空」問題)
- [x] 5.9 法師說法管理 1:1 還原
- [x] 5.10 佛法文檔管理 1:1 還原(檔案改存 Supabase Storage:連結/預覽走 `storagePublicUrl`,上傳區文案改指 `pdfs` bucket)
- [x] 5.11 關於我們編輯(upsert)1:1 還原(shared `singletonRepo.upsert` 改為先 UPDATE、無列才 INSERT:RLS 只授 admin UPDATE,PostgREST POST upsert 需 INSERT 權限會被拒)
- [x] 5.12 聯絡與交通編輯 1:1 還原,地圖欄位收網址/座標而非原始 HTML(貼 iframe 自動抽出 src,非白名單網址拒存)

## 6. 階段二 — 帳號管理與 Edge Function

- [x] 6.1 撰寫 Supabase Edge Function:驗證呼叫者為 super_admin,再以 service_role 建立/刪除 `auth.users` 與對應 `profiles`(`supabase/functions/admin-accounts/index.ts`;已部署至正式專案,狀態 ACTIVE)
- [x] 6.2 設定 Edge Function 之 `service_role` 環境變數(僅存於 Supabase,不進前端)(採用平台自動注入之 `SUPABASE_SERVICE_ROLE_KEY`,無需手動設定;部署後已生效,create/delete 實測可用)
- [x] 6.3 後台帳號管理 CRUD 介面(僅 super_admin 可見/可用)(側欄「系統 → 帳號管理」僅 super_admin 顯示,路由 `meta.superAdminOnly` 守衛;建立/刪除走 Edge Function)
- [x] 6.4 測試:非 super_admin/匿名呼叫 Edge Function 被拒絕(`scripts/edge-fn-verify.sh` 3/3 PASS,2026-07-05:匿名 401、anon key 401、非 super_admin JWT 403;super_admin create/delete 200 亦實測通過,臨時測試帳號已清除)

## 7. 媒體遷移與部署

- [x] 7.1 將既有 PDF/媒體上傳至 Supabase Storage 並更新引用(2026-07-05 盤點:無既有實體檔案可遷移——舊站 GitHub Pages `pdfs/` 目錄不存在(三個 PDF 連結本已 404)、git 歷史無任何 PDF、videos 皆為 YouTube 連結、HTML 無靜態媒體;引用端已於 3.8/5.10 完成。已套用 `supabase/migrations/20260705120000_create_pdfs_storage_bucket.sql`:`pdfs` bucket(public)+ 4 條 Storage RLS;實測匿名上傳/刪除 403、公開讀取路徑正常;真實 PDF 之後由後台 5.10 介面上傳即可)
- [x] 7.2 建立 Vercel 前台專案(apps/web)+ 環境變數 + Vercel Analytics(2026-07-05:專案 `huayuan-web` 已建立並部署 production,https://huayuan-web.vercel.app 200/標題正常;`NUXT_PUBLIC_SUPABASE_URL/ANON_KEY` 已設 prod/preview/dev;`@vercel/analytics/nuxt` module 已接;Web Analytics 已於 dashboard 啟用並重新部署,`/_vercel/insights/script.js` 200)
- [x] 7.3 建立 Vercel 後台專案(apps/admin)於獨立子網域 `admin.*` + 環境變數 + Analytics(2026-07-05:專案 `huayuan-admin` 已建立;`VITE_SUPABASE_URL/ANON_KEY/SITE_URL` 已設 prod/preview/dev;`<Analytics />` 已接;已 promote 至 production,https://huayuan-admin-delta.vercel.app 根路徑與 `/login` 皆 200;Web Analytics 已啟用(insights script 200)。網址策略經使用者決定沿用 vercel.app(見 8.6),前後台以兩個獨立 vercel.app 網域隔離,`admin.*` 自訂子網域不適用——若日後購置網域再補)
- [x] 7.4 設定各自 build 指令與 monorepo 之部署設定(2026-07-05:`vercel link --repo` 建 `.vercel/repo.json` 目錄對應(不進版控);兩專案 `rootDirectory` 各指 `apps/web`/`apps/admin`,framework preset nuxtjs/vite 自動處理 pnpm workspace 安裝與 build;admin 加 `apps/admin/vercel.json` SPA rewrite(修 `/login` 直開 404);兩專案皆已在 Vercel 上建置成功)

## 8. QA 與切換

- [x] 8.1 Playwright E2E:前後台主要流程(2026-07-05:`e2e/web`(9 頁渲染 + SSR 可索引 + 報名兩步驟含 4.2/4.3 驗證)、`e2e/admin`(路由守衛、錯誤登入)對 production 部署全過;登入後 CRUD 不納自動化——會寫正式資料庫,已於 5.x/6.4 人工實測)
- [x] 8.2 Playwright RLS 測試:匿名不能改任何資料、不能讀 `registrations`(`e2e/rls` 對齊 `security-verify.sh`:4 內容表 INSERT/UPDATE/DELETE、about/contact/registrations 寫入全拒,SELECT registrations 空集合,公開讀正常,Storage pdfs 匿名上傳拒;全過)
- [x] 8.3 視覺回歸:每個前台頁面與後台模組比對舊站 vs 新站,確認無可見差異(`e2e/visual` 9 頁 pixelmatch 全 0.00% 差異——與舊站像素級一致,並以獨立截圖驗證非測試假象;後台無舊站對照基準(舊 admin.html 需登入),以 8.1 守衛測試 + 5.x 人工比對涵蓋)
- [x] 8.4 RWD 驗證(手機/平板/桌機)(`e2e/rwd` 375/768/1440 × 7 頁無水平溢出全過;唯一例外 `/contact` 375px 溢出 122px 為舊站既有破版、新站溢出像素完全相同,依 1:1 原則列為已知例外,修復留待後續 UI 變更)
- [x] 8.5 ESLint / Prettier / 型別檢查全綠(2026-07-05:`pnpm lint` 0 issues、`pnpm format` 全過(`.agents/` vendored skills 加入 `.prettierignore`、`.mcp.json` 已格式化)、`pnpm typecheck` shared/web/admin 三專案皆過)
- [x] 8.6 為舊 GitHub Pages 版本打版控標籤(回滾用),DNS 切換至 Vercel,正式切換(2026-07-05:標籤 `legacy-github-pages` 已打在 Pages 現行伺服版本 `485ca5f` 並推上遠端。盤點:舊站無自訂網域(純 github.io),故無 DNS 可切——使用者已決定:正式網址沿用 vercel.app(前台 huayuan-web.vercel.app、後台 huayuan-admin-delta.vercel.app),舊 GitHub Pages 直接關閉。重構完成後已依計畫移除舊單檔 HTML 入口:`index.html`、`admin.html`、`signup-form.html`)
