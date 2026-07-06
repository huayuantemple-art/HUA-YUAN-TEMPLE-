# admin-ui-framework 設計

## Context

後台為 Vite + Vue 3 SPA,樣式為手刻 CSS(`.card`/`.btn`/`.inp`,金棕色系 `#c9a24b`/`#3a211c`)。三個既有 `@todo`(原生 confirm、無分頁、純文字日期)加上後續內容管理擴充(sutra-library、dharma-cms、site-copy-cms)都需要列表/表單元件。與 legacy `admin.html` 的功能 1:1 限制已退役(功能可擴充),但**現有 UI style 是不可退讓的原則**:導入元件庫的前提是嚴格複刻現有視覺,使用者不得察覺差異。

## Goals / Non-Goals

**Goals:**

- 導入 Naive UI 並以主題覆蓋套用既有色系,後續新後台頁面可直接使用
- 收掉 AnnouncementsView 三個 `@todo`(dialog、分頁、date picker)
- 建立「Naive UI 元件與手刻樣式並存」的漸進模式

**Non-Goals:**

- 不做既有頁面的全面改寫(其他 view 的手刻樣式維持)
- 不動前台(apps/web)
- 不做資料庫 migration(日期欄位維持 text)

## Decisions

1. **Naive UI(而非 Element Plus / PrimeVue / headless)**
   - theme overrides 為一等公民,可將金棕色系直接灌入 `NConfigProvider`,無全域 CSS reset,不會與既有 `.card`/`.inp` 打架
   - 可逐元件引入、tree-shaking;實際只需 DataTable/Dialog/DatePicker/Drawer 等少數元件
   - 替代方案:Element Plus 預設樣式包袱重、要蓋的預設最多;PrimeVue token 系統學習成本較高;headless(reka-ui)等於重做已有的 CSS 工

2. **主題以單一 `theme.ts` 集中管理,並允許元件層級樣式覆寫**
   - `GlobalThemeOverrides` 定義 primaryColor(金 `#c9a24b`)、文字色(棕 `#3a211c`)、圓角、字體,逐項對照既有 CSS 的實際值(而非近似值);theme token 蓋不到的細節(如 table header 底色、input border 樣式)以 scoped CSS 覆寫補齊,直到與手刻樣式無可見差異;之後所有 change 共用
   - 驗收方式:改寫前先截圖既有頁面,改寫後逐一比對色彩/字體/間距/圓角/邊框

3. **日期格式走「text 欄位 + `value-format: yyyy.MM.dd`」**
   - 零 migration、前台顯示邏輯不動;`yyyy.MM.dd` 字串排序即時間排序,無實害
   - 替代方案(migrate 成 `date` 型別)語意較正確但要動 migration + 既有資料轉換 + 前台格式化,成本不符效益

4. **刪除確認用 `useDialog`(而非自製 modal 元件)**
   - Naive UI discrete API 可在既有程式流程(`if (!confirm(...)) return`)中以最小改動換成 async 確認

## Risks / Trade-offs

- [Naive UI 與手刻樣式視覺不一致] → 嚴格遵循現有 UI style 為驗收條件:theme token 逐項對照既有 CSS 實際值 + 元件層級覆寫補齊;以公告頁為首個範本,改寫前後截圖比對通過才得用於新頁面
- [bundle 變大] → 逐元件 import + tree-shaking;admin 為登入後才用的 SPA,影響有限
- [兩套 UI 模式並存的維護心智負擔] → 明文規則:新頁面一律 Naive UI,舊頁面待各自 change 觸碰時再改

## Migration Plan

1. 安裝 `naive-ui`,App 根組件包 `NConfigProvider` + `NDialogProvider`
2. 建 `src/lib/theme.ts` 主題覆蓋
3. AnnouncementsView 依序換 dialog → date picker → NDataTable 分頁
4. 回滾:revert commits 即可,無 schema/資料變更

## Open Questions

(無 — 探索階段已全數拍板)
