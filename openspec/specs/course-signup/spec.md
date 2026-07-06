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

表單 SHALL 沿用現有驗證:姓名與電話為必填,Email 若填寫 MUST 符合 email 格式;驗證失敗 MUST 以與現有一致的錯誤樣式與訊息提示,且不送出。

#### Scenario: 缺少必填欄位
- **WHEN** 使用者未填姓名或電話即送出
- **THEN** 對應欄位顯示錯誤且不送出

#### Scenario: Email 格式錯誤
- **WHEN** 使用者填入格式錯誤的 Email
- **THEN** 顯示 Email 錯誤且不送出

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
