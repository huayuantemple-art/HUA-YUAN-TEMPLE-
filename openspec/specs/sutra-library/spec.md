# sutra-library

## Purpose

法寶略節經文庫:經文儲存、一次性匯入、前台列表/閱讀頁與後台管理。

## Requirements

### Requirement: 經文儲存

系統 SHALL 以 `sutras` 表儲存經文:`seq`(排序)、`title`、`translator`(可空)、`content`(純文字,段落以換行分隔)、`status`(草稿/已發布)。內容 MUST 為純文字 — 系統 MUST NOT 儲存或渲染 HTML/Markdown。

#### Scenario: 經文欄位完整
- **WHEN** 檢視匯入後的任一經文資料列
- **THEN** 具備排序、標題、內文與狀態;有譯者者含譯者

### Requirement: 法寶略節列表

前台法寶略節頁 SHALL 依 `seq` 列出「已發布」經文的閱讀入口,並保留既有 PDF 文檔下載區;草稿經文 MUST NOT 出現於前台。

#### Scenario: 依序列出經文
- **WHEN** 使用者進入法寶略節頁
- **THEN** 已發布經文依 seq 排序呈現,點擊可進入閱讀頁

#### Scenario: 草稿不外露
- **WHEN** 某經文狀態為草稿
- **THEN** 列表與閱讀頁皆不可見(直接訪問回 404 或導回列表)

### Requirement: 經文閱讀頁

前台 SHALL 提供 `/sutra/[id]` 閱讀頁,顯示標題、譯者(有值時)與內文;內文 MUST 以換行切分段落、逐段經 `escapeHtml` 渲染。既有 `/sutra` 路徑 MUST 轉向心經該筆,舊連結不得失效。

#### Scenario: 閱讀一部經
- **WHEN** 使用者開啟某已發布經文的閱讀頁
- **THEN** 標題/譯者/段落完整呈現,排版遵循既有經文頁風格

#### Scenario: 舊路徑相容
- **WHEN** 使用者訪問 `/sutra`
- **THEN** 顯示(或轉向)心經閱讀頁

### Requirement: 後台經文管理

後台 SHALL 提供「經文管理」模組:列表(含分頁)、新增/編輯/刪除、調整排序與上下架。UI MUST 嚴格遵循現有 UI style。刪除 MUST 經主題化對話框確認。

#### Scenario: 編輯經文
- **WHEN** 管理者修改某經文內文並儲存
- **THEN** 前台(ISR 後)顯示更新內容

#### Scenario: 調整順序
- **WHEN** 管理者變更經文 seq
- **THEN** 法寶略節列表依新順序呈現

### Requirement: 一次性內容匯入

17 份 docx 與現行心經 SHALL 以 seed migration 匯入,依檔名編號排序;罕字 MUST 以 Unicode 正字取代(`麨` U+9EA8),無法以 Unicode 表達的字元處理方式 MUST 於匯入前確認(見 design 之 spike)。匯入內容 MUST 與 docx 原文逐字一致(含標點與全形空白)。

#### Scenario: 匯入完整性抽查
- **WHEN** 比對任一匯入經文與其 docx 原文
- **THEN** 內文逐字一致,段落切分一致
