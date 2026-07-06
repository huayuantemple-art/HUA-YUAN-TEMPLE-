---
name: huayuan-ops
description: 華圓覺苑專案的維運手冊 — 部署(Vercel)、資料庫 migration(Supabase)、正式站驗證與協作守則。凡涉及部署上線、套用 migration、驗證 production、或處理 Vercel/Supabase 相關操作時使用。
---

# 華圓覺苑維運手冊

本 skill 是專案維運知識的正典(隨 repo 攜帶,跨機器不遺失)。與 `CLAUDE.md` 分工:CLAUDE.md 記架構與開發鐵律,這裡記操作程序與踩過的坑。

## 部署(Vercel)

兩個專案同源一個 repo:`huayuan-web`(Root Directory `apps/web`)與 `huayuan-admin`(`apps/admin`),team `hua-yuan-temple`。repo 根目錄 `.vercel/repo.json` 已 link。

**關鍵限制:Git 觸發的自動部署會被擋。** Vercel 會檢查 commit 作者 email 是否屬於團隊 Git 帳號;本 repo 的 `git config user.email`(`ray11.shao@china.nttdata.com`)無法綁定/驗證到 GitHub 帳號,故 push 產生的部署會被「commit email could not be matched to a Git account」阻擋。

實際部署方式(擇一):

1. **Dashboard 手動**:專案 → Deployments → Create Deployment → 選 main 最新 commit(請使用者操作)
2. **CLI**:`vercel deploy --prod --cwd apps/web` / `--cwd apps/admin`(CLI 部署不做作者檢查;需先 `vercel login`)

其他注意:

- monorepo 變更偵測:commit 沒動到該專案 Root Directory 內的檔案就會自動跳過建置(空 commit 觸發不了任何部署)
- 部署狀態用 `vercel ls huayuan-web` / `vercel ls huayuan-admin` 查
- 治本方法(尚未做):把 repo 的 `git config user.email` 改成 GitHub 帳號綁定的信箱,之後 push 即自動部署

## 資料庫 migration(Supabase)

正式專案 ref:`cnsgjxqdyuondthmoqwf`。**agent 的 SQL 連線是唯讀**(MCP `execute_sql` 不能寫入,`apply_migration` 會被權限系統擋下),所以:

1. migration 檔一律先寫進 `supabase/migrations/<version>_<name>.sql`(版本號 = 日期時間戳)
2. 套用由**使用者**執行,擇一:
   - **SQL Editor**(慣用):把 migration 內容貼進 Supabase Dashboard SQL Editor 執行,並補記歷史:
     ```sql
     insert into supabase_migrations.schema_migrations (version, name)
     values ('<version>', '<name>') on conflict (version) do nothing;
     ```
   - `SUPABASE_ACCESS_TOKEN=... ./scripts/run-migration.sh supabase/migrations/<file>`(自動記歷史)
3. `supabase/migrations/` 是只增不刪的歷史帳本,與 DB 的 `schema_migrations` 一一對應 — 回退用新的 drop/revert migration,不刪舊檔

寫入型的端到端驗證(如測 RLS、模擬後台編輯)同樣請使用者在 SQL Editor 跑準備/清理 SQL;讀取驗證用 MCP `execute_sql`。

## 正式站驗證

- **RLS 全面探測**:`./scripts/security-verify.sh`(anon key 對每張表/bucket 試讀寫,新增資料表時記得把該表加進腳本)
- **E2E**:`pnpm test:e2e --project web`(預設打 production;`WEB_URL=http://localhost:3000` 可打本機)。部署剛完成時首次 ISR 再生偶發 5xx,重跑該測試即可
- 前台是 ISR 60s:後台改內容約一分鐘後才反映到正式站;本機 dev 即時

## 協作守則

- **不要跑長時間輪詢迴圈**(sleep + curl 等部署完成之類):使用者會中斷。改用一次性探測或 `vercel ls` 回報現況;需要等待就明說,或請使用者操作 dashboard
- 需要使用者在自己終端跑互動指令(如 `vercel login`)時,提示他用 `! <command>` 前綴在 session 內執行
- UI 原則見 CLAUDE.md:新頁面/元件庫必須嚴格複刻現有視覺(theme token 逐項對照既有 CSS 實際值,改寫前後截圖比對),使用者不得察覺差異
