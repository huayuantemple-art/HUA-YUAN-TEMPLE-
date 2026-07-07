## ADDED Requirements

### Requirement: 線上閱讀與佛法文檔連動

線上閱讀清單 SHALL 由文檔對應關係驅動：法寶略節「線上閱讀」僅列 `document_id` 非空之已發布經文，依 `seq` 排序 — 件數、順序、標題與「佛法文檔下載」一致。無對應文檔之經文（如心經）MUST NOT 列入清單，但既有專屬入口（首頁卡片、`/sutra`）不受影響。

#### Scenario: 清單一致

- **WHEN** 前台顯示法寶略節頁
- **THEN** 線上閱讀與佛法文檔下載件數相同、逐項對應

#### Scenario: 無對應文檔之經文不列入

- **WHEN** 某經文無對應文檔（`document_id` 為空）
- **THEN** 不出現於線上閱讀清單；其專屬入口（如 `/sutra`）照常運作
