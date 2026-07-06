## ADDED Requirements

### Requirement: Monorepo 結構

專案 SHALL 組織為 pnpm workspace monorepo,包含 `apps/web`(Nuxt 3 前台)、`apps/admin`(Vite + Vue 3 SPA 後台)、`packages/shared`(Supabase client、以 axios 封裝的 api repository 層、sanitize、TypeScript 型別)、`supabase/`(migrations 與 Edge Functions)。前台與後台 SHALL 各自獨立 build,並共用 `packages/shared`。

#### Scenario: 前後台共用 shared 套件
- **WHEN** 前台或後台需要存取 Supabase 或逃逸邏輯
- **THEN** 兩者皆 import 自 `packages/shared`,無重複的 client 設定或逃逸函式

#### Scenario: 兩個獨立 build 產出
- **WHEN** 執行建置
- **THEN** 分別產出前台與後台兩份獨立產物

### Requirement: 技術堆疊

前後台 SHALL 使用 Vue 3 + TypeScript;前台以 Nuxt 3、後台以 Vite + Vue Router;狀態管理使用 Pinia。UI SHALL 以 Tailwind 組版並原樣移植現有客製中式 CSS;Naive UI MUST 僅在完全不影響外觀的前提下選用。

#### Scenario: 型別檢查通過
- **WHEN** 執行 TypeScript 型別檢查
- **THEN** 無型別錯誤

#### Scenario: UI 以現有 CSS 為準
- **WHEN** 移植任一頁面樣式
- **THEN** 以現有 HTML/CSS 為 source of truth,Naive UI 不改變既有外觀

### Requirement: 資料存取層

`packages/shared` SHALL 提供以 axios 封裝的 api repository 層,集中所有資料存取、錯誤處理與 loading 狀態;各頁面 MUST 透過此層而非直接散落呼叫。

#### Scenario: 集中資料存取
- **WHEN** 任一頁面讀寫資料
- **THEN** 皆透過 shared api repository 層,錯誤與 loading 行為一致

### Requirement: 環境變數與金鑰管理

Supabase URL 與 anon key SHALL 以環境變數(`.env`)注入,MUST NOT 寫死於程式碼或提交至版控;`service_role` MUST 僅存於 Supabase Edge Function 環境,絕不進前端。

#### Scenario: 設定來自環境變數
- **WHEN** 應用程式啟動
- **THEN** 自環境變數讀取 Supabase 設定,版控中不含金鑰明碼

### Requirement: Vercel 部署

前台與後台 SHALL 各自部署為獨立的 Vercel 專案,後台使用獨立子網域(如 `admin.*`)以強化隔離;兩專案 SHALL 接入 Vercel Analytics。

#### Scenario: 前後台獨立部署
- **WHEN** 觸發部署
- **THEN** 前台與後台各自部署至獨立 Vercel 專案與網域

### Requirement: PDF 與媒體託管

PDF 文檔與媒體檔案 SHALL 託管於 Supabase Storage(取代原 GitHub Pages `/pdfs/`);前後台 SHALL 引用 Supabase Storage 之連結。

#### Scenario: 文檔連結指向 Supabase Storage
- **WHEN** 前台或後台引用 PDF
- **THEN** 連結指向 Supabase Storage 而非 GitHub Pages

### Requirement: 品質保證與工具鏈

專案 SHALL 具備 Vitest 單元測試、Playwright E2E 測試(含 RLS 測試驗證「匿名不能改資料/讀取個資」與視覺回歸比對舊站 vs 新站)、ESLint 與 Prettier,以及 RWD 驗證。

#### Scenario: RLS 測試阻擋匿名寫入
- **WHEN** 執行 Playwright/整合測試以 anon key 嘗試寫入受保護資料表
- **THEN** 測試確認操作被拒絕

#### Scenario: 視覺回歸把關照搬
- **WHEN** CI 執行視覺回歸測試
- **THEN** 新站與舊站無可見差異方可通過

#### Scenario: Lint 與型別為綠燈
- **WHEN** 執行 ESLint / Prettier / 型別檢查
- **THEN** 全數通過
