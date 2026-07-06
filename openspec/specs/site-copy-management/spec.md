# site-copy-management

## Purpose

網站內容性文案的儲存、後台編輯與前台 fallback 呈現(typed key,缺值永不開天窗)。

## Requirements

### Requirement: 文案儲存與 typed key

系統 SHALL 以 `site_content` key-value 表儲存內容性文案;key 清單與預設值 MUST 定義於 `packages/shared` 供前後台共用,程式碼 MUST NOT 以裸字串引用 key(拼錯需為編譯錯誤)。

#### Scenario: key 由共用清單引用
- **WHEN** 前台或後台存取某文案
- **THEN** 透過 shared 的 typed key 常數,而非裸字串

### Requirement: 前台 fallback 呈現

前台 SHALL 優先顯示 `site_content` 的值;查無 key 或值為空時 MUST fallback 至 shared 定義的預設值(現行硬編碼文案)。頁面 MUST NOT 因資料缺漏而顯示空白或錯誤。DB 文字 MUST 經 `escapeHtml` 呈現。

#### Scenario: 後台已編輯的文案
- **WHEN** 某 key 於後台被編輯儲存
- **THEN** 前台(ISR 再生後)顯示新值

#### Scenario: 缺值 fallback
- **WHEN** 某 key 不存在或值為空
- **THEN** 前台顯示預設文案,版面正常

### Requirement: 後台文案編輯模組

後台 SHALL 提供「網站文案」模組,依頁面分組列出所有 key 與其現值(空值顯示預設值提示),逐項可編輯儲存。UI MUST 嚴格遵循現有 UI style。

#### Scenario: 依頁面分組瀏覽
- **WHEN** 管理者進入網站文案模組
- **THEN** 文案依「首頁/關於/法寶略節/課程/全站」等分組呈現

#### Scenario: 編輯並儲存
- **WHEN** 管理者修改某文案並儲存
- **THEN** 值寫入 `site_content`,成功提示註明前台約一分鐘內更新

### Requirement: 功能性文字不納管

「讀取中…」、表單驗證訊息、按鈕文字等功能性文字 SHALL 留在程式碼,MUST NOT 納入 `site_content`。

#### Scenario: 範圍檢視
- **WHEN** 檢視 shared 的 key 清單
- **THEN** 僅含內容性文案,無功能性文字
