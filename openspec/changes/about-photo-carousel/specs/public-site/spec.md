## MODIFIED Requirements

### Requirement: 關於頁的照片與理念內文

關於頁 SHALL 以單一相框顯示照片輪播（`about.image_urls` 依序輪播）：多張時每 5 秒自動切換（淡入淡出）並顯示可點選之圓點指示；僅一張時靜態顯示。`image_urls` 為空時 MUST 退回 `about.image_url` 單張，仍無照片則顯示既有 placeholder，頁面 MUST NOT 因缺值而開天窗。三則核心理念內文（`value1~3_desc`）之 fallback 規則不變。所有 DB 文字 MUST 經 `escapeHtml` 呈現。

#### Scenario: 多張照片輪播
- **WHEN** 後台設定多張照片
- **THEN** 相框每 5 秒自動切換並可以圓點指示切換

#### Scenario: 單張或無照片
- **WHEN** 照片清單僅一張或為空
- **THEN** 分別顯示靜態單張／既有 placeholder

#### Scenario: DB 無值時 fallback
- **WHEN** `image_urls` 為空而 `image_url` 有值
- **THEN** 顯示該單張照片
