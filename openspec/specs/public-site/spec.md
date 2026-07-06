# public-site

## Purpose

前台公開網站(apps/web,Nuxt 3):頁面、動態內容與 ISR。

## Requirements

### Requirement: 前台頁面與導覽 1:1 還原

前台(`apps/web`,Nuxt 3)SHALL 提供完整的頁面與導覽:首頁、最新公告、課程、法師說法、佛法文檔、課程報名、關於我們、聯絡與交通。DNS 切換已完成、legacy HTML 已移除,「與 legacy 像素級 1:1」原則退役;前台得依內容管理需求補強,但 MUST 嚴格遵循既有 UI style(色彩、字體、版面、間距規格),補強不得造成與既有風格不一致的視覺。

#### Scenario: 導覽涵蓋所有頁面
- **WHEN** 使用者瀏覽前台
- **THEN** 可存取全部頁面,視覺與互動遵循既有風格

#### Scenario: 補強內容風格一致
- **WHEN** 頁面新增 DB 驅動的內容呈現(圖片、內文)
- **THEN** 新元素的視覺規格與既有 style 一致

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

### Requirement: 聯絡頁地圖安全渲染

聯絡與交通頁 SHALL 依 `content-sanitization` 能力,以白名單網域安全組成 Google Maps iframe,MUST NOT 以未淨化 HTML 渲染。

#### Scenario: 地圖正常顯示
- **WHEN** 進入聯絡頁且地圖設定有效
- **THEN** 以安全 iframe 顯示地圖,外觀與現有一致

### Requirement: 最新公告月曆檢視

最新公告頁 SHALL 以月曆為唯一內容檢視(原列表檢視移除,跑馬燈與分類篩選保留)。月曆 SHALL 以月格呈現、可切換上一月/下一月,僅顯示 `date` 可解析為合法日期(格式 `YYYY.MM.DD`)之已發布公告;`date` 無法解析之公告不顯示於月曆(後台輸入公告日期 MUST 維持 `YYYY.MM.DD` 格式)。月曆之視覺 MUST 嚴格遵循既有 UI style(色彩、字體、版面),且 MUST NOT 引入外部日曆套件或後端變更。

#### Scenario: 進入公告頁即顯示月曆
- **WHEN** 使用者進入最新公告頁
- **THEN** 顯示月格月曆,有已發布公告之日期帶有標記,無列表檢視

#### Scenario: 點擊日期顯示當日公告
- **WHEN** 使用者點擊月曆上帶標記之日期
- **THEN** 月曆下方顯示該日全部公告(標題、標籤、內容),依建立時間倒序

#### Scenario: 無效日期公告不進月曆
- **WHEN** 公告之 `date` 無法解析為合法日期(格式錯誤或日期不存在)
- **THEN** 該公告不出現於月曆(跑馬燈仍照常輪播其標題)

#### Scenario: 分類篩選作用於月曆
- **WHEN** 使用者選擇分類(課程/法會/公告)
- **THEN** 月曆僅顯示該分類公告之日期標記與內容
