## ADDED Requirements

### Requirement: 關於頁照片輪播管理

後台「關於我們」SHALL 提供照片清單管理：逐張上傳（MUST 經共用 imageUpload 壓縮，儲存唯一 key）、刪除與上移排序，儲存時寫入 `about.image_urls`（順序即前台輪播順序），並將第一張同步寫回 `about.image_url` 作為舊欄位後備。刪除照片 MUST NOT 移除 Storage 上的檔案。

#### Scenario: 新增照片
- **WHEN** 管理者上傳照片並儲存
- **THEN** 照片加入清單末端並反映於前台輪播

#### Scenario: 刪除與排序
- **WHEN** 管理者刪除或上移某張照片並儲存
- **THEN** 前台輪播順序隨之更新;Storage 檔案不受影響
