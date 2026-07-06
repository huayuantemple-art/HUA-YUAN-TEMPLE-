## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: 風格一致的刪除確認對話框

後台的刪除操作 SHALL 以主題化的確認對話框(Naive UI dialog)取得使用者確認,MUST NOT 使用原生 `confirm()`。對話框 MUST 明示刪除對象,且預設焦點不得落在確認刪除按鈕上。

#### Scenario: 刪除公告需確認
- **WHEN** 管理者點選刪除公告
- **THEN** 顯示主題化確認對話框,確認後才執行刪除,取消則不動作

### Requirement: 公告列表分頁

公告管理列表 SHALL 支援分頁(NDataTable),搜尋與分類篩選 MUST 與分頁正確組合(篩選後自動回到第一頁)。

#### Scenario: 公告超過單頁筆數
- **WHEN** 公告數量超過每頁筆數
- **THEN** 列表顯示分頁控制,切頁正確顯示對應資料

#### Scenario: 篩選與分頁組合
- **WHEN** 管理者輸入搜尋或選擇分類篩選
- **THEN** 結果自動回到第一頁,分頁數依篩選後資料重算

### Requirement: 公告日期以日期選擇器輸入

公告發佈日期 SHALL 以日期選擇器(NDatePicker)輸入,輸出格式 MUST 為 `yyyy.MM.dd` 文字;資料庫欄位 MUST 維持 text 型別不做 migration,既有 `yyyy.MM.dd` 資料 MUST 可正確回填至選擇器。

#### Scenario: 選擇日期
- **WHEN** 管理者以日期選擇器選定日期
- **THEN** 表單值為 `yyyy.MM.dd` 格式文字,儲存後前台顯示不變

#### Scenario: 編輯既有公告
- **WHEN** 管理者編輯既有 `yyyy.MM.dd` 日期的公告
- **THEN** 日期選擇器正確顯示原日期
