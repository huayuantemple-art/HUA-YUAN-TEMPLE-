## ADDED Requirements

### Requirement: dharma_sections 表的權限

匿名角色 SHALL 僅能 `SELECT` `dharma_sections` 中狀態為「已發布」的資料列;僅 `admin` / `super_admin` SHALL 可完整 CRUD。

#### Scenario: 匿名僅見已發布小節
- **WHEN** 匿名使用者查詢 `dharma_sections`
- **THEN** 僅回傳「已發布」資料列

#### Scenario: 匿名嘗試寫入被拒絕
- **WHEN** 匿名使用者對 `dharma_sections` 發出寫入操作
- **THEN** 資料庫拒絕該操作(RLS 阻擋)
