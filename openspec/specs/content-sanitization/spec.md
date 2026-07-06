# content-sanitization

## Purpose

內容淨化與 XSS 防護:DB 來源文字一律逃逸,地圖僅存白名單網址。

## Requirements

### Requirement: 地圖嵌入不儲存原始 HTML

系統 MUST NOT 儲存或輸出使用者提供的原始 `<iframe>` HTML。`contact` 的地圖資訊 SHALL 以網址或座標形式儲存,前端 SHALL 以受控樣板安全組成 Google Maps iframe,`src` MUST 限定於 Google Maps 嵌入網域白名單。

#### Scenario: 後台輸入地圖網址而非 HTML
- **WHEN** 管理者在後台填寫地圖
- **THEN** 介面接受 Google Maps 網址/座標,而非原始 iframe HTML

#### Scenario: 前端安全組成 iframe
- **WHEN** 前台聯絡頁載入地圖
- **THEN** 前端以白名單網域組成 iframe,不使用 `innerHTML` 輸出資料庫中的原始 HTML

#### Scenario: 非白名單網域被拒絕
- **WHEN** 儲存的地圖值指向非 Google Maps 嵌入網域
- **THEN** 前端不渲染該 iframe,改顯示安全的預設訊息

### Requirement: 動態內容一律逃逸

所有來自資料庫、插入 DOM 的文字內容 SHALL 經過統一的逃逸/淨化處理;系統 MUST NOT 直接以未淨化字串設定 `innerHTML`。逃逸邏輯 SHALL 集中於 `packages/shared` 的單一模組。

#### Scenario: 內容中的 HTML 被逃逸
- **WHEN** 某公告內容含有 `<script>` 或其他 HTML 標記
- **THEN** 前台以純文字呈現,不執行任何腳本

#### Scenario: 逃逸邏輯單一來源
- **WHEN** 需要調整逃逸規則
- **THEN** 只需修改 `packages/shared` 中的一處
