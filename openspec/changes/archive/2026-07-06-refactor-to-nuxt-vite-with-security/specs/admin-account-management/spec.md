## ADDED Requirements

### Requirement: 帳號管理介面僅限 super_admin

後台 SHALL 提供帳號管理 CRUD 介面,且此介面 MUST 僅對 `super_admin` 角色可見與可用;`admin` 角色 MUST NOT 存取帳號管理功能。

#### Scenario: super_admin 看見帳號管理
- **WHEN** `super_admin` 登入後台
- **THEN** 導覽中出現帳號管理入口

#### Scenario: 一般 admin 看不到帳號管理
- **WHEN** 一般 `admin` 登入後台
- **THEN** 導覽中不出現帳號管理入口,直接存取也被拒絕

### Requirement: 透過 Edge Function 建立與刪除子帳號

建立/刪除 Supabase Auth 帳號 SHALL 透過持有 `service_role` 的 Supabase Edge Function 執行;該函式 MUST 先驗證呼叫者為 `super_admin` 才執行操作。前端 MUST NOT 直接持有或使用 `service_role`。

#### Scenario: super_admin 建立子帳號
- **WHEN** `super_admin` 於介面新增一個子帳號(email + 初始密碼/邀請)
- **THEN** Edge Function 驗證其身分後,以 `service_role` 建立 `auth.users` 與對應 `profiles`(role=`admin`)

#### Scenario: 非 super_admin 呼叫 Edge Function 被拒絕
- **WHEN** 非 `super_admin`(或匿名)直接呼叫帳號管理 Edge Function
- **THEN** 函式回傳未授權錯誤,不執行任何帳號操作

#### Scenario: super_admin 刪除子帳號
- **WHEN** `super_admin` 刪除某子帳號
- **THEN** Edge Function 移除該 `auth.users` 與其 `profiles` 紀錄

### Requirement: 保留既有最高權限帳號

系統 SHALL 沿用資料庫中既有的最高權限帳號,並將其標記為 `super_admin`;帳號管理流程 MUST NOT 破壞或降權此帳號。

#### Scenario: 既有帳號標記為 super_admin
- **WHEN** 遷移完成
- **THEN** 既有最高權限帳號在 `profiles` 中的 role 為 `super_admin`
