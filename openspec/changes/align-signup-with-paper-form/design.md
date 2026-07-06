## Context

紙本「佛法入門班報名表」（用戶提供 PDF）欄位：基本資料（姓名*、電話*、Email*、年齡*、性別○男○女、上課地點○華圓新莊講堂○華圓台東講堂、招生對象說明）＋學員背景（修學背景單選 3 項、如何得知本課程複選 4 項、希望從課程中獲得什麼複選 3 項、備註說明）＋「※ 為必填項目｜報名資料僅供課程聯繫使用，不作其他用途」。

線上表單現況：姓名*、電話*、Email（選填）、備註；防濫用（honeypot＋10 分鐘 10 次頻率上限）與隱私權同意勾選為安全不變量。

## Goals / Non-Goals

**Goals:**

- 線上表單欄位、必填規則與選項文字與紙本一致。
- 後台可檢視與匯出全部欄位。
- 保留既有選課流程（`?course=<id>` 直達、課程卡選擇）與防濫用/隱私同意。

**Non-Goals:**

- 不做候補、繳費、Email 確認信。
- 不改 RLS（列層級,匿名僅 INSERT 不變）。
- 不做「其他」選項的附加說明輸入框（紙本亦無填寫線,備註欄可補充）。

## Decisions

1. **新欄位皆為 nullable text，複選以「、」串接存單一 text 欄位**
   - 理由：報名資料為唯讀名單（後台僅檢視/匯出，無查詢統計需求），text 串接最簡單且 CSV/表格直接可讀；避免 text[] 在 PostgREST insert 與 CSV 匯出的額外處理。
   - 欄位名：`age`、`gender`、`venue`、`dharma_background`、`referral_source`、`expectation`。
   - 替代方案：text[]／獨立選項表 → 否決，過度設計。

2. **必填以紙本 * 為準：姓名、電話、Email、年齡**
   - Email 由選填改必填（格式驗證沿用）；年齡驗證為 1~3 位數字。
   - 性別、上課地點、修學背景、複選題不強制（紙本未標 *），未填存 null。

3. **選項文字與紙本逐字一致**（含「社群媒體（Facebook、Instagram）」「希望有世間活動（例如：園遊會、團康活動）」），驗收時可直接對照。

4. **UI 沿用 signup 頁既有視覺**：radio/checkbox 用 `accent-color: var(--gold)`，欄位群組沿用 `.field`/`.lbl`；「基本資料/學員背景」以既有 `.section-title` 語彙分段；招生對象以 `.field-hint` 樣式呈現說明文字。

5. **Migration 先行**：部署前用戶須先於 Supabase Dashboard 套用 migration，否則新欄位 insert 會 400。本機驗證僅驗 UI 與驗證邏輯，不實際送出（dev 連的是 production DB，不寫測試資料）。

## Risks / Trade-offs

- [migration 未套用即部署 → 報名全掛] → proposal/tasks 明確標註順序：先 migration 再部署；驗證腳本 `security-verify.sh` 可沿用確認 RLS 未變。
- [表單變長、手機填寫負擔] → 分「基本資料/學員背景」兩段視覺分組，維持單頁送出（與紙本一致，不做多步驟）。
- [舊資料無新欄位值] → 後台顯示「—」，CSV 空字串，無相容性問題。
