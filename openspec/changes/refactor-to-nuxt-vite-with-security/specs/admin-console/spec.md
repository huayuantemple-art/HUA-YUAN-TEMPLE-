## ADDED Requirements

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

後台 SHALL 提供與現有 `admin.html` 完全相同的管理模組:總覽 dashboard、公告管理、課程管理、報名資料、弘法影音管理、佛法文檔管理、關於我們、聯絡與交通。每個模組的欄位、操作(新增/編輯/刪除/發布狀態切換)、版面與互動 MUST 與現有實作一致,行為 MUST NOT 增減或改變。

#### Scenario: 公告 CRUD
- **WHEN** 管理者在公告管理新增/編輯/刪除公告
- **THEN** 行為與現有一致,並反映於資料庫

#### Scenario: 課程 CRUD 與狀態
- **WHEN** 管理者管理課程(含招生中/額滿等狀態)
- **THEN** 行為與欄位與現有一致

#### Scenario: 各模組視覺回歸通過
- **WHEN** 對每個後台模組執行舊站 vs 新站視覺比對
- **THEN** 無可見差異

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

後台 SHALL 提供「關於我們」與「聯絡與交通」的編輯(upsert 至單一資料列);地圖欄位 MUST 依 `content-sanitization` 收取網址/座標而非原始 iframe HTML。

#### Scenario: 更新關於我們
- **WHEN** 管理者儲存關於我們內容
- **THEN** 內容 upsert 至資料庫並反映於前台

#### Scenario: 更新地圖為安全格式
- **WHEN** 管理者儲存聯絡地圖
- **THEN** 系統儲存網址/座標,前台以白名單 iframe 呈現
