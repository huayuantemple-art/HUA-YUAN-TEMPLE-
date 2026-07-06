## Context

華圓覺苑現有站台為三個單檔 HTML(`index.html` 793 行、`admin.html` 874 行、`signup-form.html` 322 行),各自內嵌 CSS/JS,並共用同一把寫死在前端的公開 Supabase anon key。後端為 Supabase(表:`announcements` / `courses` / `videos` / `documents` / `about` / `contact` / `registrations`),託管於 GitHub Pages。

實測確認的資安缺口:
- 匿名 `PATCH announcements` 回傳 HTTP 204 → RLS 未擋寫入,任何人可竄改內容。
- `registrations` 匿名 `SELECT` 回應 HTTP 200 → 一旦有報名資料即為個資外洩。
- `contact.map_embed` 於 `index.html:758` 以 `innerHTML` 直接輸出 → 儲存型 XSS。
- anon key 已存在於 git 歷史。

兩條最高原則貫穿整份設計:**功能 1:1 照搬**、**UI 1:1 照搬**;業務邏輯優化為後續獨立變更。

## Goals / Non-Goals

**Goals:**
- 立即修復資安(RLS 依角色、個資保護、消除 XSS、輪替 key),階段一可獨立交付。
- 以 pnpm workspace monorepo + Nuxt 3(前台)/ Vite+Vue 3(後台)重寫,消除重複設定與程式碼。
- 前後台功能與 UI 對照現有站台像素級、行為級還原,並以視覺回歸 + RLS 測試把關。
- 新增後台帳號管理(super_admin 建/刪子帳號),透過持有 `service_role` 的 Edge Function。
- 遷移至 Vercel(兩個獨立專案)與 Supabase Storage。

**Non-Goals:**
- 任何業務邏輯、流程、欄位或行為的優化與調整(留待後續獨立變更)。
- 變更既有資料表 schema(僅新增 `profiles` 表)。
- 保留舊 GitHub Pages 站(直接切換)。
- 多語系、SEO 進階優化以外的新功能。

## Decisions

### D1. 前台 Nuxt 3 + ISR;後台 Vite + Vue 3 SPA
- **為何**:前台為公開官網需 SEO,且內容由後台隨時更新——ISR 兼顧 SEO 與內容新鮮度。後台為登入後動態管理,無 SEO 需求,SPA 最單純。
- **替代方案**:純 Vite SSG(內容在 build 時烤死,新公告需重建才顯示,已否決);SSG + Vercel Deploy Hook(可行但有延遲,ISR 更佳)。
- Nuxt 3 底層即 Vue 3 + Vite,符合原「Vue + Vite」方向。

### D2. pnpm workspace monorepo,共用 `packages/shared`
- **為何**:消除三份重複的 Supabase 設定、`h()` 逃逸函式與型別;單一真實來源。
- 結構:`apps/web`、`apps/admin`、`packages/shared`、`supabase/`。
- **替代方案**:兩個獨立 repo(使用者一度提出並開了 ADMIN repo,最終決定改回 monorepo)。

### D3. RLS 依角色(`profiles` 表)而非「是否登入」
- **為何**:僅判斷登入,任何能在此 Supabase 專案註冊的帳號都算管理者;以 `role`(`super_admin` / `admin`)判斷才正確。
- policy 摘要:內容表匿名讀公開狀態、admin 全 CRUD;`about`/`contact` 匿名讀、admin 改;`registrations` 匿名只能 `INSERT`、admin 才能 `SELECT`。

### D4. 帳號管理走 Edge Function(持 `service_role`)
- **為何**:建立/刪除 `auth.users` 需 admin API 與 `service_role`,此 key 絕不可進前端。Edge Function 先驗證呼叫者為 `super_admin` 再操作。
- **替代方案**:Supabase 內建邀請流程(彈性較低);前端持 service_role(嚴重不安全,否決)。

### D5. `map_embed` 只存網址/座標,前端白名單組 iframe
- **為何**:根除儲存型 XSS。不再儲存或輸出原始 HTML;前端以受控樣板組成 iframe,`src` 限 Google Maps 嵌入網域白名單。
- 需一次性資料遷移:將既有 `map_embed` 由 iframe HTML 轉為網址/座標。

### D6. UI 以現有 CSS 為 source of truth;Naive UI 降級為可選
- **為何**:目標是像素級照搬客製中式風格;硬套 Naive UI 主題反而難 100% 還原。Tailwind 負責組版並原樣移植現有 CSS,Naive UI 僅在完全不影響外觀時用於後台元件。

### D7. 資料存取層以 axios 封裝的 repository
- **為何**:集中所有 Supabase 讀寫、錯誤處理與 loading 狀態於 `packages/shared`,前後台一致。

### D8. 部署 Vercel 兩個獨立專案 + 子網域隔離
- **為何**:前後台獨立部署、後台放 `admin.*` 子網域強化隔離;接 Vercel Analytics。單一 env(不分 preview/prod)。

### D9. 遷移策略:資安先行、直接切換
- 階段一(RLS/角色/sanitize/key 輪替)可在舊站上先套用(RLS 與 sanitize 對現有前端相容),降低現在進行式風險;階段二重構完成後直接切換至 Vercel,不保留舊站。

## Risks / Trade-offs

- **anon key 輪替造成舊站中斷** → 於切換視窗內同步更新前端;因最終直接切換至新站,影響有限。
- **`map_embed` 遷移遺漏** → 遷移腳本需覆蓋既有資料;前端對非白名單/無效值顯示安全預設,不致破版。
- **ISR 內容延遲** → 選定合理再生間隔;必要時於後台發布串接 on-demand revalidation。
- **UI 照搬與 Naive UI 主題衝突** → 以現有 CSS 為準、Naive UI 可選,並以視覺回歸測試把關,任何差異即 bug。
- **RLS 依 `profiles` 但既有帳號未建 profile** → 遷移時為既有最高權限帳號補 `super_admin` 紀錄,並加「登入但無 profile 視為無權限」的防呆。
- **Edge Function 授權判斷疏漏** → 函式內嚴格驗證呼叫者 JWT 與 `super_admin` 角色,並加測試涵蓋未授權呼叫。
- **防濫用影響正常報名** → 優先 honeypot + rate limit,captcha 僅在必要時,確保正常流程無感。

## Migration Plan

1. **階段一(資安,可先上線)**:建立 `profiles` 表並為既有最高權限帳號設 `super_admin`;套用 RLS policy;遷移 `map_embed` 為網址/座標並在現有前端改為安全渲染;輪替 anon key。
2. **階段二(重構)**:建立 monorepo 骨架(`apps/web` / `apps/admin` / `packages/shared` / `supabase/`)→ 移植 `packages/shared`(client/api/sanitize/型別)→ 前台逐頁 1:1 移植 → 後台逐模組 1:1 移植 + 帳號管理 + Edge Function → PDF/媒體遷移至 Supabase Storage。
3. **QA**:Vitest + Playwright(RLS 測試、視覺回歸)、ESLint/Prettier、RWD 驗證全綠。
4. **切換**:部署 Vercel 兩專案(前台 + `admin.*`),接 Analytics,DNS 指向後直接切換,不保留舊站。
5. **回滾**:切換前保留舊 GitHub Pages 版本於版控標籤,必要時可暫時指回。

## Open Questions

- 防濫用最終採用 honeypot+rate limit 是否足夠,或需接第三方 captcha(如 hCaptcha)?待階段二實作時依實際流量決定。
- ISR 再生間隔與是否加 on-demand revalidation,待前台實作時定案。
- 報名個資保存期限與後台是否需去識別化/遮蔽顯示,屬個資合規細節,可於後續業務邏輯輪次處理。
