## ADDED Requirements

### Requirement: site_content 表的權限

匿名角色 SHALL 僅能 `SELECT` `site_content`;僅 `admin` / `super_admin` SHALL 可 `INSERT` / `UPDATE` / `DELETE`。

#### Scenario: 匿名讀取文案
- **WHEN** 匿名使用者查詢 `site_content`
- **THEN** 回傳文案資料列

#### Scenario: 匿名嘗試寫入被拒絕
- **WHEN** 匿名使用者對 `site_content` 發出寫入操作
- **THEN** 資料庫拒絕該操作(RLS 阻擋)
