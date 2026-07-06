## MODIFIED Requirements

### Requirement: 報名資料檢視與 CSV 匯出

報名資料模組 SHALL 列出報名紀錄（姓名、課程、電話、Email、年齡、性別、上課地點、備註、報名時間）並提供 CSV 匯出；CSV MUST 含 BOM 以相容 Excel，檔名格式與現有一致，且 MUST 涵蓋全部報名欄位（含修學背景、如何得知本課程、希望從課程中獲得什麼）。此模組資料讀取 MUST 受 RLS 限制，僅登入 admin 可存取。

#### Scenario: 檢視報名資料

- **WHEN** 管理者進入報名資料模組
- **THEN** 顯示所有報名紀錄（含年齡、性別、上課地點；舊資料缺值顯示「—」）

#### Scenario: 匯出 CSV

- **WHEN** 管理者點選匯出且有資料
- **THEN** 下載帶 BOM 的 CSV，涵蓋全部報名欄位，檔名格式與現有一致

#### Scenario: 無資料時匯出

- **WHEN** 管理者在無報名資料時點選匯出
- **THEN** 顯示與現有一致的「沒有資料可匯出」提示
