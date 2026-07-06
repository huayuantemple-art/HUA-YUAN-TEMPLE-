# public-site

## Purpose

前台公開網站(apps/web,Nuxt 3):頁面、動態內容與 ISR。

## Requirements

### Requirement: 前台頁面與導覽 1:1 還原

前台(`apps/web`,Nuxt 3)SHALL 提供與現有 `index.html` 完全相同的頁面與導覽:首頁、最新公告、課程、法師說法、佛法文檔、課程報名、關於我們、聯絡與交通。頁面切換、版面、視覺與互動 MUST 與現有實作一致(像素級還原);行為 MUST NOT 有任何增減或改變。

#### Scenario: 導覽涵蓋所有現有頁面
- **WHEN** 使用者瀏覽前台
- **THEN** 可存取與現有站台相同的全部頁面,且視覺與互動一致

#### Scenario: 視覺回歸比對通過
- **WHEN** 對每個前台頁面執行舊站 vs 新站的視覺比對
- **THEN** 無可見差異

### Requirement: 動態內容從 Supabase 載入

前台各清單(公告、課程、影音、文檔、關於、聯絡)SHALL 透過共用 api 層自 Supabase 讀取,並僅顯示公開狀態資料;載入中、空狀態與錯誤狀態 MUST 與現有實作一致。

#### Scenario: 顯示已發布公告
- **WHEN** 進入最新公告頁
- **THEN** 依建立時間顯示狀態為「已發布」的公告

#### Scenario: 課程依狀態顯示
- **WHEN** 進入課程頁
- **THEN** 顯示「招生中」與「額滿」課程,呈現方式與現有一致

#### Scenario: 空狀態訊息一致
- **WHEN** 某清單無資料
- **THEN** 顯示與現有站台相同的空狀態訊息

### Requirement: SEO 與內容新鮮度(ISR)

前台 SHALL 以 Nuxt 3 的 ISR(增量靜態再生)提供 SEO 友善的頁面,並在後台內容更新後於合理時間內反映最新內容。

#### Scenario: 頁面可被搜尋引擎索引
- **WHEN** 檢視前台頁面之伺服器回應
- **THEN** 內容以可索引的 HTML 呈現(非空殼)

#### Scenario: 內容更新後刷新
- **WHEN** 後台發布新公告
- **THEN** 前台於 ISR 再生後顯示該公告

### Requirement: PDF 文檔下載

佛法文檔頁 SHALL 列出文檔並提供 PDF 下載連結,PDF 來源改為 Supabase Storage;連結 MUST 於新分頁開啟且帶 `rel="noopener"`。

#### Scenario: 下載 PDF
- **WHEN** 使用者點選某文檔的下載連結
- **THEN** 於新分頁開啟對應的 Supabase Storage PDF

### Requirement: 聯絡頁地圖安全渲染

聯絡與交通頁 SHALL 依 `content-sanitization` 能力,以白名單網域安全組成 Google Maps iframe,MUST NOT 以未淨化 HTML 渲染。

#### Scenario: 地圖正常顯示
- **WHEN** 進入聯絡頁且地圖設定有效
- **THEN** 以安全 iframe 顯示地圖,外觀與現有一致
