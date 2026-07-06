# admin-content-coverage 設計

## Context

working tree 已有前台 contact icon 渲染與 `Contact` 型別的 `icon_url` 欄位,但 migration 與後台編輯缺席 — 欄位是「前台先行」的半成品。about 頁的照片是 placeholder、理念內文硬編碼。目前僅有 `pdfs` bucket,圖片無家可放。

## Goals / Non-Goals

**Goals:**

- 每個前台顯示的欄位都有後台編輯入口(contact icon、about 照片與理念內文)
- 建立圖片上傳的基礎設施(`images` bucket + client-side 壓縮),供後續 change 重用
- 移除 schema 中無用的 `contact.email` / `hours`

**Non-Goals:**

- 不處理詩句/banner 等純文案(屬 `site-copy-cms`)
- 不引入 Naive UI(在既有手刻表單加欄位即可,與 `admin-ui-framework` 平行)

## Decisions

1. **開獨立 `images` bucket(而非塞進 `pdfs`)**
   - 語意清楚、權限模式直接複製 pdfs 的 RLS;之後 site-copy-cms 等可重用

2. **client-side canvas 壓縮後上傳**
   - Supabase 免費方案無 server-side 縮圖;意境照片動輒數 MB,直接上傳會拖慢前台
   - 上限:意境照片長邊 1600px / icon 長邊 256px,輸出 JPEG/WebP;壓縮 util 放 `apps/admin/src/lib/`

3. **前台 fallback 到現行硬編碼內容**
   - DB 空值時關於頁顯示既有 placeholder 與現行理念文案,seed 不用一次到位、網站永不開天窗

4. **email/hours 直接 drop(而非保留不用)**
   - 前台從未顯示、後台從未提供編輯,保留只會誤導;working tree 的型別已朝此方向

5. **檔名策略**:上傳檔以固定 key 覆寫(`about-image`、`contact-icon-1/2` + 副檔名),避免孤兒檔案累積;URL 加時間戳 query 破快取

## Risks / Trade-offs

- [覆寫式檔名遇 CDN 快取舊圖] → 儲存的公開網址附 `?v=<timestamp>` query
- [drop 欄位不可逆] → migration 前確認無程式引用(型別/前後台皆已無使用);資料本身皆為空值,無資料損失
- [大圖壓縮在低階裝置耗時] → 上傳中顯示 loading 狀態,壓縮目標尺寸保守

## Migration Plan

1. migration:contact ± 欄位、about + 欄位、images bucket(含 RLS)
2. shared 型別與 storage helper → 後台上傳/欄位 → 前台渲染
3. 回滾:前台有 fallback,revert 前端即可;欄位新增為 nullable 不影響既有查詢

## Open Questions

(無)
