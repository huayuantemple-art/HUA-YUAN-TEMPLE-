## Why

華圓覺苑網站目前是三個單檔 HTML(`index.html` / `admin.html` / `signup-form.html`),共用一把寫死在前端的公開 Supabase anon key,且資料表未正確設定 RLS。實測證實:任何人拿這把公開 key 即可**匿名竄改**公告、課程、影音等資料(`PATCH announcements` 回傳 HTTP 204),後台登入形同虛設;`registrations` 一旦有報名資料即會**全世界可讀**(個資外洩、違反個資法);`map_embed` 以 `innerHTML` 直接輸出構成**儲存型 XSS**。這是現在進行式的資安風險,必須立即處理;同時三份重複的設定與程式碼難以維護,需要重構為有框架、可測試的架構。

## What Changes

本次為**純技術重構 + 資安修復**,遵守兩條最高原則:**功能 1:1 照搬**、**UI 1:1 照搬**(以現有 HTML/CSS 為唯一 source of truth,像素級還原)。業務邏輯優化不在本次範圍,留待重構完成後的另一輪獨立變更。

**階段一 — 資安(可先獨立完成)**
- 為所有資料表建立 Supabase RLS policy,改用**角色(role)**判斷而非只看「是否登入」。
- 新增 `profiles` 角色表(`super_admin` / `admin`),RLS 依 role 授權。
- `announcements` / `courses` / `videos` / `documents`:匿名僅能 `SELECT` 已發布;admin 全 CRUD。
- `about` / `contact`:匿名 `SELECT`;admin `UPDATE`。
- `registrations`:匿名僅能 `INSERT`,**禁止** `SELECT`(保護個資);admin 可讀取與匯出。
- **BREAKING**:`map_embed` 不再儲存原始 HTML,改存網址/座標由前端安全組成 iframe,消除儲存型 XSS。
- 輪替(換掉)已洩漏於 git 歷史的 anon key。
- 報名表加入防濫用機制(captcha/honeypot + rate limit)與隱私權同意 checkbox。

**階段二 — 重構**
- 建立 pnpm workspace monorepo:`apps/web`(Nuxt 3 前台,ISR)、`apps/admin`(Vite + Vue 3 SPA 後台)、`packages/shared`(Supabase client、以 axios 封裝的 api repository 層、sanitize、TypeScript 型別)、`supabase/`(migrations + Edge Functions)。
- 全面採用 TypeScript、Vue Router、Pinia。
- UI 以 Tailwind 組版並原樣移植現有客製中式 CSS;Naive UI 降級為可選,僅在完全不影響外觀時使用。
- 部署改用 Vercel 兩個獨立專案(前台、後台獨立子網域如 `admin.*`),接入 Vercel Analytics。
- 後台認證維持 Supabase Auth 帳密。
- 新增後台帳號管理介面,透過 Supabase Edge Function(存放 `service_role`,驗證呼叫者為 `super_admin` 才建/刪子帳號)。
- PDF/媒體從 GitHub Pages 搬到 Supabase Storage。
- 保留報名資料 CSV 匯出(RLS 鎖定後僅登入 admin 可匯出)。
- DB schema 除新增 `profiles` 表外不變動;直接切換,不保留舊站。

## Capabilities

### New Capabilities
- `database-security`: RLS policy、`profiles` 角色模型(super_admin / admin)、anon key 輪替,確保資料只能由授權角色寫入、個資不外洩。
- `content-sanitization`: `map_embed` 等使用者可控內容的安全輸出策略(改存網址/座標、前端安全組成 iframe),消除儲存型 XSS。
- `admin-account-management`: 後台帳號管理 CRUD,透過 Edge Function 以 super_admin 權限建立/刪除子帳號。
- `public-site`: 前台(Nuxt 3 + ISR)所有頁面之功能與 UI,對照現有 `index.html` 1:1 還原。
- `admin-console`: 後台(Vite + Vue 3 SPA)登入與所有管理模組之功能與 UI,對照現有 `admin.html` 1:1 還原。
- `course-signup`: 課程報名流程(對照現有 `signup-form.html` 1:1),含防濫用機制與隱私權同意。
- `platform-architecture`: pnpm workspace monorepo 結構、TypeScript/Router/Pinia、Tailwind、Vercel 雙專案部署、共用 api/sanitize 層與 QA(Vitest / Playwright / ESLint / Prettier)。

### Modified Capabilities
<!-- 無既有 specs,全部為新 capability。 -->

## Impact

- **前端**:`index.html`、`admin.html`、`signup-form.html`(共 ~1989 行)全數以 Nuxt/Vite + Vue 3 重寫;移除三份重複的 Supabase 設定與 `h()` 逃逸函式。
- **資料庫**:新增 RLS policy 與 `profiles` 表;既有資料表結構不變;`contact.map_embed` 內容格式改變(需資料遷移)。
- **後端函式**:新增 Supabase Edge Function(帳號管理,持有 `service_role`)。
- **金鑰**:輪替 anon key(影響所有前端呼叫);`service_role` 僅存於 Edge Function,絕不進前端。
- **部署**:從 GitHub Pages 遷至 Vercel(兩個獨立專案 + 子網域);PDF/媒體遷至 Supabase Storage;既有網域 `hua-yuan-temple.vercel.app`。
- **相依**:新增 Nuxt 3、Vite、Vue 3、pnpm、TypeScript、Pinia、Vue Router、Tailwind、axios、Naive UI(可選)、Vitest、Playwright、ESLint、Prettier、Vercel Analytics。
- **驗收基準**:任何與舊站的功能/外觀差異均視為 bug;以 Playwright 視覺回歸與 RLS 測試把關。
