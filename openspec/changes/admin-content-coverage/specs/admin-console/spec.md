## MODIFIED Requirements

### Requirement: 關於與聯絡編輯

後台 SHALL 提供「關於我們」與「聯絡與交通」的編輯(upsert 至單一資料列);地圖欄位 MUST 依 `content-sanitization` 收取網址/座標而非原始 iframe HTML。「關於我們」SHALL 含意境照片上傳與三則核心理念(名稱與內文)的編輯;「聯絡與交通」SHALL 含兩組道場 icon 的上傳。圖片上傳 MUST 於瀏覽器端壓縮後上傳至 `images` bucket,欄位儲存公開網址;icon 清空時前台 MUST 回退為預設 logo。

#### Scenario: 更新關於我們
- **WHEN** 管理者儲存關於我們內容(含照片與理念內文)
- **THEN** 內容 upsert 至資料庫並反映於前台

#### Scenario: 上傳意境照片
- **WHEN** 管理者選擇一張大尺寸照片上傳
- **THEN** 照片經 client-side 壓縮後存入 `images` bucket,`about.image_url` 更新為公開網址

#### Scenario: 上傳道場 icon
- **WHEN** 管理者為道場一或道場二上傳 icon
- **THEN** icon 存入 `images` bucket,對應 `icon_url` / `icon_url2` 更新

#### Scenario: 更新地圖為安全格式
- **WHEN** 管理者儲存聯絡地圖
- **THEN** 系統儲存網址/座標,前台以白名單 iframe 呈現
