# database-security

## Purpose

資料庫安全:角色模型、RLS 權限與金鑰管理。

## Requirements

### Requirement: 角色模型

系統 SHALL 以 `profiles` 表定義管理者角色,角色值 MUST 為 `super_admin` 或 `admin`,且每筆 `profiles` 紀錄 MUST 對應一個 `auth.users` 帳號。RLS 授權判斷 SHALL 依角色,而非僅依「是否已登入」。

#### Scenario: 已登入帳號解析為對應角色
- **WHEN** 一個已通過 Supabase Auth 登入的帳號存取受保護資源
- **THEN** 系統依其 `profiles.role` 決定授權範圍

#### Scenario: 登入但無 profiles 紀錄的帳號視為無權限
- **WHEN** 一個已登入帳號在 `profiles` 表沒有對應紀錄
- **THEN** 系統拒絕其所有管理寫入操作

### Requirement: 內容資料表的匿名讀取限制

匿名(anon)角色 SHALL 僅能 `SELECT` `announcements` / `courses` / `videos` / `documents` 中狀態為「已發布/招生中/額滿」等公開狀態的資料列;`admin` 與 `super_admin` SHALL 可對這些表進行完整 CRUD。

#### Scenario: 匿名讀取已發布公告
- **WHEN** 匿名使用者查詢 `announcements`
- **THEN** 僅回傳狀態為「已發布」的資料列

#### Scenario: 匿名嘗試寫入公告被拒絕
- **WHEN** 匿名使用者以 anon key 對 `announcements` 發出 `INSERT` / `UPDATE` / `DELETE`
- **THEN** 資料庫拒絕該操作(RLS 阻擋)

#### Scenario: admin 完整管理內容
- **WHEN** 具 `admin` 角色的帳號對 `courses` 進行新增/修改/刪除
- **THEN** 操作成功

### Requirement: 關於與聯絡資訊的權限

匿名角色 SHALL 可 `SELECT` `about` 與 `contact`;僅 `admin` / `super_admin` SHALL 可 `UPDATE` 這兩張表。

#### Scenario: 匿名讀取聯絡資訊
- **WHEN** 匿名使用者查詢 `contact`
- **THEN** 回傳聯絡資訊資料列

#### Scenario: 匿名嘗試修改聯絡資訊被拒絕
- **WHEN** 匿名使用者對 `contact` 發出 `UPDATE`
- **THEN** 資料庫拒絕該操作

### Requirement: 報名資料的個資保護

`registrations` 表 SHALL 僅允許匿名角色 `INSERT`,MUST 禁止匿名角色 `SELECT`;僅 `admin` / `super_admin` SHALL 可 `SELECT` 與匯出報名資料。

#### Scenario: 匿名送出報名
- **WHEN** 匿名使用者透過報名表 `INSERT` 一筆報名資料
- **THEN** 寫入成功

#### Scenario: 匿名嘗試讀取報名資料被拒絕
- **WHEN** 匿名使用者查詢 `registrations`
- **THEN** 資料庫拒絕並回傳空集合或錯誤,不洩漏任何個資

#### Scenario: admin 讀取報名資料
- **WHEN** 具 `admin` 角色的帳號查詢 `registrations`
- **THEN** 回傳完整報名資料供管理與匯出

### Requirement: dharma_sections 表的權限

匿名角色 SHALL 僅能 `SELECT` `dharma_sections` 中狀態為「已發布」的資料列;僅 `admin` / `super_admin` SHALL 可完整 CRUD。

#### Scenario: 匿名僅見已發布小節
- **WHEN** 匿名使用者查詢 `dharma_sections`
- **THEN** 僅回傳「已發布」資料列

#### Scenario: 匿名嘗試寫入被拒絕
- **WHEN** 匿名使用者對 `dharma_sections` 發出寫入操作
- **THEN** 資料庫拒絕該操作(RLS 阻擋)

### Requirement: site_content 表的權限

匿名角色 SHALL 僅能 `SELECT` `site_content`;僅 `admin` / `super_admin` SHALL 可 `INSERT` / `UPDATE` / `DELETE`。

#### Scenario: 匿名讀取文案
- **WHEN** 匿名使用者查詢 `site_content`
- **THEN** 回傳文案資料列

#### Scenario: 匿名嘗試寫入被拒絕
- **WHEN** 匿名使用者對 `site_content` 發出寫入操作
- **THEN** 資料庫拒絕該操作(RLS 阻擋)

### Requirement: anon key 輪替

專案 SHALL 輪替(換掉)已洩漏於 git 歷史的舊 anon key,所有前端呼叫 MUST 改用新的 anon key。`service_role` key MUST 絕不出現在任何前端程式碼或 git 追蹤檔案。

#### Scenario: 舊 key 失效
- **WHEN** 使用已輪替掉的舊 anon key 呼叫 API
- **THEN** 呼叫被拒絕

#### Scenario: service_role 不進前端
- **WHEN** 檢視前端建置產物與版控檔案
- **THEN** 找不到 `service_role` key
