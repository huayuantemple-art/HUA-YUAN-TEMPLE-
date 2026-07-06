# dharma-content

## Purpose

入佛門法要教學內容:結構化儲存(章節 → 小節)、後台維護與前台呈現。

## Requirements

### Requirement: 法要內容儲存

系統 SHALL 以 `dharma_sections` 表儲存法要內容:`group_key`(章節:序經/三皈依/五戒/三學)、`title`(小節標題,可空)、`content`(純文字,段落以換行分隔)、`seq`(排序)、`status`。內文 MUST 為純文字,MUST NOT 儲存 HTML/Markdown。

#### Scenario: 現行內容完整入庫
- **WHEN** 比對 seed 後的資料與現行 dharma.vue 硬編碼內容
- **THEN** 章節/小節/內文逐字一致,順序一致

### Requirement: 前台法要頁 DB 渲染

前台 dharma 頁 SHALL 依 `group_key` 分組、`seq` 排序渲染已發布小節;頁首錨點導覽 MUST 由實際存在的章節動態產生;內文 MUST 逐段經 `escapeHtml` 渲染。版面 MUST 遵循既有頁面風格。

#### Scenario: 章節與錨點
- **WHEN** 使用者進入法要頁
- **THEN** 章節依序呈現,錨點導覽可跳至各章節

#### Scenario: 草稿小節不外露
- **WHEN** 某小節狀態為草稿
- **THEN** 前台不顯示該小節

### Requirement: 後台法要管理

後台 SHALL 提供「法要管理」模組:依章節分組檢視、小節新增/編輯/刪除/排序/上下架。UI MUST 嚴格遵循現有 UI style,刪除 MUST 經主題化對話框確認。

#### Scenario: 編輯小節
- **WHEN** 管理者修改某小節內文並儲存
- **THEN** 前台(ISR 後)顯示更新內容

#### Scenario: 調整小節順序
- **WHEN** 管理者變更小節 seq
- **THEN** 前台依新順序呈現
