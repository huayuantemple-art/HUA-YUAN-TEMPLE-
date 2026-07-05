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
- [ ] 1.10 輪替 anon key,並更新所有前端引用;確認 `service_role` 不在任何前端/版控檔案
- [x] 1.11 撰寫並執行安全驗證:以 anon key 對每張表嘗試 `INSERT/UPDATE/DELETE` 與讀 `registrations`,確認全被拒絕(`scripts/security-verify.sh`,24/24 PASS)

## 2. 階段二 — Monorepo 骨架與共用套件

- [ ] 2.1 建立 pnpm workspace(`apps/web`、`apps/admin`、`packages/shared`、`supabase/`)與根 `pnpm-workspace.yaml`
- [ ] 2.2 設定 TypeScript、ESLint、Prettier(根層共用設定)
- [ ] 2.3 `packages/shared`:Supabase client 工廠(讀環境變數)
- [ ] 2.4 `packages/shared`:以 axios 封裝的 api repository 層(集中讀寫、錯誤、loading)
- [ ] 2.5 `packages/shared`:sanitize/逃逸模組 + 地圖網域白名單組 iframe helper
- [ ] 2.6 `packages/shared`:所有資料表的 TypeScript 型別
- [ ] 2.7 設定 `.env` 範本(`VITE_/NUXT_` 對應之 Supabase URL/anon key),確認金鑰不進版控
- [ ] 2.8 為 `packages/shared` 寫 Vitest 單元測試(sanitize、api 層錯誤處理)

## 3. 階段二 — 前台(apps/web,Nuxt 3 + ISR)

- [ ] 3.1 建立 Nuxt 3 專案、接 `packages/shared`、設定 Tailwind
- [ ] 3.2 原樣移植現有 `index.html` 的全域 CSS/字型/版面基底
- [ ] 3.3 移植共用元件(footer、卡片、loading/空狀態)對照現有
- [ ] 3.4 首頁 1:1 還原(含動態區塊)
- [ ] 3.5 最新公告頁 1:1 還原(依狀態/時間)
- [ ] 3.6 課程頁 1:1 還原(招生中/額滿呈現)
- [ ] 3.7 弘法影音頁 1:1 還原
- [ ] 3.8 佛法文檔頁 1:1 還原,PDF 連結改指 Supabase Storage
- [ ] 3.9 關於我們頁 1:1 還原
- [ ] 3.10 聯絡與交通頁 1:1 還原,地圖以白名單 iframe 安全渲染
- [ ] 3.11 設定 ISR(再生策略),確認頁面為可索引 HTML 且後台更新後會刷新

## 4. 階段二 — 課程報名(apps/web 或獨立入口)

- [ ] 4.1 兩步驟報名流程 1:1 還原(選課 → 表單 → 完成畫面)
- [ ] 4.2 表單驗證 1:1 還原(姓名/電話必填、Email 格式)
- [ ] 4.3 新增隱私權同意 checkbox(未勾選不可送出)
- [ ] 4.4 加入防濫用(honeypot + rate limit;必要時 captcha),確保正常流程無感
- [ ] 4.5 送出寫入 `registrations`,確認在 RLS 下匿名 `INSERT` 正常

## 5. 階段二 — 後台(apps/admin,Vite + Vue 3 SPA)

- [ ] 5.1 建立 Vite + Vue 3 專案、Vue Router、Pinia、接 `packages/shared`、設定 Tailwind
- [ ] 5.2 原樣移植現有 `admin.html` 的全域 CSS/版面基底(Naive UI 僅在不影響外觀時選用)
- [ ] 5.3 登入頁與 Supabase Auth 流程 1:1 還原(含既有 session 自動進入、錯誤訊息)
- [ ] 5.4 依角色的路由守衛(未登入導向登入;帳號管理僅 super_admin)
- [ ] 5.5 總覽 dashboard 1:1 還原
- [ ] 5.6 公告管理 CRUD 1:1 還原
- [ ] 5.7 課程管理 CRUD + 狀態 1:1 還原
- [ ] 5.8 報名資料檢視 + CSV 匯出(含 BOM、檔名格式)1:1 還原
- [ ] 5.9 弘法影音管理 1:1 還原
- [ ] 5.10 佛法文檔管理 1:1 還原(檔案改存 Supabase Storage)
- [ ] 5.11 關於我們編輯(upsert)1:1 還原
- [ ] 5.12 聯絡與交通編輯 1:1 還原,地圖欄位收網址/座標而非原始 HTML

## 6. 階段二 — 帳號管理與 Edge Function

- [ ] 6.1 撰寫 Supabase Edge Function:驗證呼叫者為 super_admin,再以 service_role 建立/刪除 `auth.users` 與對應 `profiles`
- [ ] 6.2 設定 Edge Function 之 `service_role` 環境變數(僅存於 Supabase,不進前端)
- [ ] 6.3 後台帳號管理 CRUD 介面(僅 super_admin 可見/可用)
- [ ] 6.4 測試:非 super_admin/匿名呼叫 Edge Function 被拒絕

## 7. 媒體遷移與部署

- [ ] 7.1 將既有 PDF/媒體上傳至 Supabase Storage 並更新引用
- [ ] 7.2 建立 Vercel 前台專案(apps/web)+ 環境變數 + Vercel Analytics
- [ ] 7.3 建立 Vercel 後台專案(apps/admin)於獨立子網域 `admin.*` + 環境變數 + Analytics
- [ ] 7.4 設定各自 build 指令與 monorepo 之部署設定

## 8. QA 與切換

- [ ] 8.1 Playwright E2E:前後台主要流程
- [ ] 8.2 Playwright RLS 測試:匿名不能改任何資料、不能讀 `registrations`
- [ ] 8.3 視覺回歸:每個前台頁面與後台模組比對舊站 vs 新站,確認無可見差異
- [ ] 8.4 RWD 驗證(手機/平板/桌機)
- [ ] 8.5 ESLint / Prettier / 型別檢查全綠
- [ ] 8.6 為舊 GitHub Pages 版本打版控標籤(回滾用),DNS 切換至 Vercel,正式切換
