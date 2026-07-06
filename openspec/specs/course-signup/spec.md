# course-signup

## Purpose

課程報名表單:匿名報名、防濫用與隱私同意。

## Requirements

### Requirement: 報名流程 1:1 還原

課程報名(對照現有 `signup-form.html`)SHALL 保留兩步驟流程:先選課程、再填表送出,並於成功後顯示完成畫面。可報名課程 SHALL 僅顯示「招生中/額滿」,額滿課程 MUST NOT 可選。版面、互動與訊息 MUST 與現有一致。

#### Scenario: 選擇課程進入表單
- **WHEN** 使用者點選一個招生中的課程
- **THEN** 進入報名表單並顯示所選課程資訊

#### Scenario: 額滿課程不可選
- **WHEN** 使用者點選額滿課程
- **THEN** 無法進入表單,呈現與現有一致的候補提示

#### Scenario: 送出成功顯示完成畫面
- **WHEN** 使用者填妥必填欄位並送出
- **THEN** 報名寫入 `registrations` 並顯示完成畫面

### Requirement: 表單驗證

表單 SHALL 驗證:姓名、電話、Email、年齡為必填;Email MUST 符合 email 格式;年齡 MUST 為 1~3 位數字。驗證失敗 MUST 以與現有一致的錯誤樣式與訊息提示,且不送出。

#### Scenario: 缺少必填欄位
- **WHEN** 使用者未填姓名、電話、Email 或年齡即送出
- **THEN** 對應欄位顯示錯誤且不送出

#### Scenario: Email 格式錯誤
- **WHEN** 使用者填入格式錯誤的 Email
- **THEN** 顯示 Email 錯誤且不送出

#### Scenario: 年齡非數字
- **WHEN** 使用者於年齡填入非數字內容
- **THEN** 顯示年齡錯誤且不送出

### Requirement: 報名欄位比照紙本報名表

報名表單 SHALL 比照實體「佛法入門班報名表」收集下列欄位,選項文字 MUST 與紙本逐字一致:

- 性別(單選):男/女
- 上課地點(單選):華圓新莊講堂/華圓台東講堂
- 修學背景(單選):初次接觸佛法/曾自行閱讀相關書籍/曾於道場或寺院修學
- 如何得知本課程(複選):親友介紹/道場網站/社群媒體(Facebook、Instagram)/其他
- 希望從課程中獲得什麼(複選):頂戴正信佛教/希望有世間活動(例如:園遊會、團康活動)/其他
- 年齡(必填)

表單 SHALL 顯示招生對象說明「18~65 歲,無不良嗜好之四眾弟子」。上述單/複選欄位為選填,未填以 null 寫入;複選以「、」串接為單一文字值寫入 `registrations` 對應欄位。

#### Scenario: 完整填寫送出
- **WHEN** 使用者填妥必填欄位並勾選單/複選項目後送出
- **THEN** 各欄位值(複選以「、」串接)寫入 `registrations` 並顯示完成畫面

#### Scenario: 選填欄位未填仍可送出
- **WHEN** 使用者僅填必填欄位(未選性別、地點、背景等)並送出
- **THEN** 報名成功,未填欄位以 null 寫入

### Requirement: 隱私權同意

報名表 SHALL 新增隱私權同意 checkbox,使用者 MUST 勾選同意後才能送出報名;未勾選 MUST NOT 送出。

#### Scenario: 未勾選同意無法送出
- **WHEN** 使用者未勾選隱私權同意即送出
- **THEN** 提示需同意隱私權條款且不送出

#### Scenario: 勾選後可送出
- **WHEN** 使用者勾選同意並通過其他驗證
- **THEN** 報名正常送出

### Requirement: 防濫用機制

報名送出 SHALL 加入防濫用機制(captcha 或 honeypot 加上 rate limit),以阻擋機器人大量灌入 `registrations`;正常使用者的送出流程 MUST NOT 受可感知影響。

#### Scenario: 機器人式重複送出被限制
- **WHEN** 短時間內出現異常大量報名送出
- **THEN** 系統以 rate limit / captcha / honeypot 阻擋

#### Scenario: 正常送出不受影響
- **WHEN** 一般使用者正常填寫並送出
- **THEN** 順利完成,無額外可感知阻礙
