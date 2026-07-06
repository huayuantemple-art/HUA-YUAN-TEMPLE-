# admin-content-coverage — 補齊欄位級的後台編輯能力

## Why

盤點後發現前台已顯示(或即將顯示)的欄位缺後台編輯入口:聯絡頁的道場 icon(working tree 已有前台渲染與型別,但無 migration、無後台欄位)、關於頁的意境照片仍是 placeholder、核心理念只有名稱沒有內文。內容應由後台維護,不該由工程師改码。

## What Changes

- **contact 表**:新增 `icon_url` / `icon_url2` 欄位;**BREAKING** 移除未使用的 `email` / `hours` 欄位
- **about 表**:新增 `image_url`(道場意境照片)、`value1_desc` / `value2_desc` / `value3_desc`(核心理念內文)
- **新增 `images` storage bucket**(public 讀取、admin 寫入),沿用 `pdfs` bucket 的 RLS 模式
- **後台 ContactView**:新增兩組道場 icon 上傳欄位(收 working tree 既有前台改動的後台缺口)
- **後台 AboutView**:新增意境照片上傳與三則理念內文編輯(收掉 `@todo :35`、`@todo :49`)
- **圖片上傳一律先做 client-side canvas 壓縮**再上傳,避免大圖拖慢前台
- **前台 about.vue**:改讀 DB 的照片與理念內文,DB 無值時 fallback 至現行硬編碼內容(不開天窗)
- 前台「像素級 1:1」原則正式退役:cutover 已完成,前台改為**遵循既有 style 做補強**;既有視覺規格(色彩/字體/版面)仍為基準

## Capabilities

### New Capabilities

(無)

### Modified Capabilities

- `admin-console`:「關於與聯絡編輯」擴充 — 新增 icon/照片上傳與理念內文欄位
- `database-security`:新增 images bucket 的存取權限要求
- `public-site`:「前台頁面與導覽 1:1 還原」退役為「遵循既有 style 補強」;關於頁與聯絡頁新增 DB 驅動的圖片/內文呈現

## Impact

- `supabase/migrations`:contact/about 欄位增刪 + images bucket
- `packages/shared`:`types.ts`(Contact/About)、`storage.ts`(images bucket URL helper)
- `apps/admin`:ContactView、AboutView、上傳與壓縮 util
- `apps/web`:about.vue(contact.vue 的 icon 渲染已在 working tree,一併納入本 change 收尾提交)
- 不依賴 `admin-ui-framework`(僅在既有手刻表單加欄位),可平行進行
