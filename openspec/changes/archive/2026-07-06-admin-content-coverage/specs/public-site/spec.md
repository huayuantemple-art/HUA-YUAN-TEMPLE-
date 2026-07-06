## MODIFIED Requirements

### Requirement: 前台頁面與導覽 1:1 還原

前台(`apps/web`,Nuxt 3)SHALL 提供完整的頁面與導覽:首頁、最新公告、課程、法師說法、佛法文檔、課程報名、關於我們、聯絡與交通。DNS 切換已完成、legacy HTML 已移除,「與 legacy 像素級 1:1」原則退役;前台得依內容管理需求補強,但 MUST 嚴格遵循既有 UI style(色彩、字體、版面、間距規格),補強不得造成與既有風格不一致的視覺。

#### Scenario: 導覽涵蓋所有頁面
- **WHEN** 使用者瀏覽前台
- **THEN** 可存取全部頁面,視覺與互動遵循既有風格

#### Scenario: 補強內容風格一致
- **WHEN** 頁面新增 DB 驅動的內容呈現(圖片、內文)
- **THEN** 新元素的視覺規格與既有 style 一致

## ADDED Requirements

### Requirement: 關於頁的照片與理念內文

關於頁 SHALL 顯示 DB 的意境照片(`about.image_url`)與三則核心理念內文(`value1~3_desc`);DB 無值時 MUST fallback 至既定預設內容(照片顯示既有 placeholder、內文顯示現行文案),頁面 MUST NOT 因缺值而開天窗。所有 DB 文字 MUST 經 `escapeHtml` 呈現。

#### Scenario: 顯示上傳的照片與內文
- **WHEN** 後台已設定照片與理念內文
- **THEN** 關於頁顯示該照片與內文

#### Scenario: DB 無值時 fallback
- **WHEN** `image_url` 或理念內文為空
- **THEN** 顯示既有 placeholder / 現行預設文案

### Requirement: 聯絡頁道場 icon

聯絡頁 SHALL 顯示各道場的 icon(`contact.icon_url` / `icon_url2`);未設定或載入失敗時 MUST 回退為預設 logo。

#### Scenario: 顯示自訂 icon
- **WHEN** 後台已上傳道場 icon
- **THEN** 聯絡頁顯示該 icon

#### Scenario: icon 缺值或壞圖回退
- **WHEN** icon 未設定或圖片載入失敗
- **THEN** 顯示預設 logo
