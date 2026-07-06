## ADDED Requirements

### Requirement: 圖片儲存桶的權限

系統 SHALL 建立 `images` storage bucket 存放站台圖片(道場照片、道場 icon):匿名角色 SHALL 僅能讀取(public read),僅 `admin` / `super_admin` SHALL 可上傳、覆寫與刪除。MUST 比照 `pdfs` bucket 的 RLS 模式實作。

#### Scenario: 匿名讀取圖片
- **WHEN** 前台以公開網址載入 `images` bucket 內的圖片
- **THEN** 圖片正常回應

#### Scenario: 匿名嘗試上傳被拒絕
- **WHEN** 匿名使用者以 anon key 對 `images` bucket 上傳檔案
- **THEN** 儲存服務拒絕該操作

#### Scenario: admin 上傳圖片
- **WHEN** 具 `admin` 角色的帳號上傳圖片
- **THEN** 上傳成功並可取得公開網址

### Requirement: contact 表欄位調整

`contact` 表 SHALL 新增 `icon_url` 與 `icon_url2`(text,nullable)存放道場 icon 公開網址。未使用的 `email` 與 `hours` 欄位 SHALL 自 schema 移除。
**Reason**:前台不顯示 email/hours,保留徒增維護面;icon 為前台既定呈現需求。
**Migration**:以 migration 同步增刪欄位;`packages/shared` 型別同步更新,程式碼中無任何 email/hours 讀寫殘留。

#### Scenario: icon 欄位可讀寫
- **WHEN** admin 更新 `icon_url` 且匿名使用者查詢 `contact`
- **THEN** 寫入成功且匿名可讀取到該網址

#### Scenario: 移除欄位無殘留引用
- **WHEN** 檢視全庫程式碼與型別
- **THEN** 不存在 `contact.email` / `contact.hours` 的讀寫或型別定義
