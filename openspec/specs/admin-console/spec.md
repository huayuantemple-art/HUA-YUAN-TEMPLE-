# admin-console

## Purpose

後台管理介面(apps/admin):登入、內容管理模組、報名資料檢視與匯出。

## Requirements

### Requirement: 後台登入

後台(`apps/admin`,Vite + Vue 3 SPA)SHALL 以 Supabase Auth 帳密登入,並在有既有 session 時自動進入;登入畫面、錯誤訊息與現有 `admin.html` 一致。未登入者 MUST 只看到登入畫面。

#### Scenario: 帳密正確登入
- **WHEN** 管理者輸入正確 email 與密碼
- **THEN** 進入後台總覽,顯示登入者 email

#### Scenario: 帳密錯誤
- **WHEN** 管理者輸入錯誤帳密
- **THEN** 顯示與現有一致的錯誤訊息,且不進入後台

#### Scenario: 既有 session 自動進入
- **WHEN** 已登入的管理者重新開啟後台
- **THEN** 略過登入畫面直接進入

### Requirement: 管理模組 1:1 還原

後台 SHALL 提供完整的管理模組:總覽 dashboard、公告管理、課程管理、報名資料、法師說法管理、佛法文檔管理、關於我們、聯絡與交通。每個模組的欄位與操作(新增/編輯/刪除/發布狀態切換)MUST 維持完整功能。功能得依內容管理需求擴充(不再受 legacy `admin.html` 功能 1:1 限制),但 UI 風格 MUST 嚴格遵循現有 UI style(金棕色系、卡片式版面、既有字體與間距規格):元件得以 Naive UI 實作,惟主題與元件樣式 MUST 客製至與既有手刻樣式無可見差異。

#### Scenario: 公告 CRUD
- **WHEN** 管理者在公告管理新增/編輯/刪除公告
- **THEN** 功能完整可用,並反映於資料庫

#### Scenario: 課程 CRUD 與狀態
- **WHEN** 管理者管理課程(含招生中/額滿等狀態)
- **THEN** 功能與欄位完整可用

#### Scenario: 元件庫頁面嚴格複刻現有風格
- **WHEN** 頁面以 Naive UI 元件實作或改寫,並與既有手刻樣式頁面比對
- **THEN** 色彩、字體、間距、圓角、邊框等視覺規格與現有 UI style 一致,使用者無法察覺元件庫替換

### Requirement: 報名資料檢視與 CSV 匯出

報名資料模組 SHALL 列出報名紀錄(姓名、課程、電話、Email、備註、報名時間)並提供 CSV 匯出;CSV MUST 含 BOM 以相容 Excel,檔名格式與現有一致。此模組資料讀取 MUST 受 RLS 限制,僅登入 admin 可存取。

#### Scenario: 檢視報名資料
- **WHEN** 管理者進入報名資料模組
- **THEN** 顯示所有報名紀錄

#### Scenario: 匯出 CSV
- **WHEN** 管理者點選匯出且有資料
- **THEN** 下載帶 BOM 的 CSV,欄位與檔名格式與現有一致

#### Scenario: 無資料時匯出
- **WHEN** 管理者在無報名資料時點選匯出
- **THEN** 顯示與現有一致的「沒有資料可匯出」提示

### Requirement: 關於與聯絡編輯

後台 SHALL 提供「關於我們」與「聯絡與交通」的編輯(upsert 至單一資料列);地圖欄位 MUST 依 `content-sanitization` 收取網址/座標而非原始 iframe HTML。「關於我們」SHALL 含意境照片上傳與三則核心理念(名稱與內文)的編輯;「聯絡與交通」SHALL 含兩組道場 icon 的上傳。圖片上傳 MUST 於瀏覽器端壓縮後上傳至 `images` bucket,欄位儲存公開網址;icon 清空時前台 MUST 回退為預設 logo。

#### Scenario: 更新關於我們
- **WHEN** 管理者儲存關於我們內容(含照片與理念內文)
- **THEN** 內容 upsert 至資料庫並反映於前台

#### Scenario: 上傳意境照片
- **WHEN** 管理者選擇一張大尺寸照片上傳
- **THEN** 照片經 client-side 壓縮後存入 `images` bucket,`about.image_url` 更新為公開網址

#### Scenario: 上傳道場 icon
- **WHEN** 管理者為道場一或道場二上傳 icon
- **THEN** icon 存入 `images` bucket,對應 `icon_url` / `icon_url2` 更新

#### Scenario: 更新地圖為安全格式
- **WHEN** 管理者儲存聯絡地圖
- **THEN** 系統儲存網址/座標,前台以白名單 iframe 呈現

### Requirement: 風格一致的刪除確認對話框

後台的刪除操作 SHALL 以主題化的確認對話框(Naive UI dialog)取得使用者確認,MUST NOT 使用原生 `confirm()`。對話框 MUST 明示刪除對象,且預設焦點不得落在確認刪除按鈕上。

#### Scenario: 刪除公告需確認
- **WHEN** 管理者點選刪除公告
- **THEN** 顯示主題化確認對話框,確認後才執行刪除,取消則不動作

### Requirement: 共用後台列表表格與分頁

公告、課程、報名資料、佛法文檔、帳號管理等後台資料列表 SHALL 使用共用 table component 實作。該 component MUST 以 Naive UI table 呈現資料,並以固定在 admin view 最下方的分頁列控制資料切片;分頁列 MUST 避開左側 sidebar,且不得覆蓋表格最後一列。

#### Scenario: 公告超過單頁筆數
- **WHEN** 公告數量超過每頁筆數
- **THEN** 列表顯示分頁控制,切頁正確顯示對應資料

#### Scenario: 課程與其他列表超過單頁筆數
- **WHEN** 課程、報名資料、佛法文檔或帳號數量超過每頁筆數
- **THEN** 列表顯示共用分頁控制,切頁正確顯示對應資料

#### Scenario: 篩選與分頁組合
- **WHEN** 管理者輸入搜尋或選擇分類篩選
- **THEN** 結果自動回到第一頁,分頁數依篩選後資料重算

#### Scenario: 分頁固定於 view 底部
- **WHEN** 列表資料少於或多於一頁,或使用者捲動頁面
- **THEN** 分頁列維持在 admin 主內容 view 的最下方,且不延伸到左側 sidebar

### Requirement: 公告日期以日期選擇器輸入

公告發佈日期 SHALL 以日期選擇器(NDatePicker)輸入,輸出格式 MUST 為 `yyyy.MM.dd` 文字;資料庫欄位 MUST 維持 text 型別不做 migration,既有 `yyyy.MM.dd` 資料 MUST 可正確回填至選擇器。

#### Scenario: 選擇日期
- **WHEN** 管理者以日期選擇器選定日期
- **THEN** 表單值為 `yyyy.MM.dd` 格式文字,儲存後前台顯示不變

#### Scenario: 編輯既有公告
- **WHEN** 管理者編輯既有 `yyyy.MM.dd` 日期的公告
- **THEN** 日期選擇器正確顯示原日期

### Requirement: 佛法文檔檔案上傳

佛法文檔管理 SHALL 支援管理者上傳 PDF 或 DOCX 檔案至 Supabase Storage。上傳成功後 MUST 自動回填檔名欄位;資料庫 MUST 僅儲存檔名,下載 URL 由 Supabase URL、Storage bucket 與檔名動態組合。

#### Scenario: 上傳 PDF
- **WHEN** 管理者在佛法文檔表單選擇 `.pdf` 檔案
- **THEN** 檔案上傳至 Storage,檔名自動回填,下載預覽 URL 正確更新

#### Scenario: 上傳 DOCX
- **WHEN** 管理者在佛法文檔表單選擇 `.docx` 檔案
- **THEN** 檔案上傳至 Storage,檔名自動回填,下載預覽 URL 正確更新

#### Scenario: 拒絕非文件格式
- **WHEN** 管理者選擇非 PDF / DOCX 檔案
- **THEN** 系統拒絕上傳並提示錯誤
