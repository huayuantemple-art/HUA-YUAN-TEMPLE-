/**
 * 網站文案 typed key 清單(site-copy-cms):
 * 前台以 getCopy(rows, key) 讀 DB 值 || 預設值,後台依 group 分組逐項編輯。
 * key 型別為字面量聯集 — 拼錯即編譯錯誤;預設值原樣搬移現行硬編碼文案。
 * 僅收內容性文案;功能性文字(讀取中、驗證訊息、按鈕文字)不納管。
 */

export const SITE_COPY_GROUPS = ['首頁', '關於我們', '法寶略節', '課程報名', '全站'] as const

export type SiteCopyGroup = (typeof SITE_COPY_GROUPS)[number]

export interface SiteCopyDef {
  key: string
  group: SiteCopyGroup
  label: string
  defaultValue: string
  /** 後台以 textarea 編輯;前台渲染時換行轉 <br>(內容先經 escapeHtml) */
  multiline?: boolean
}

export const SITE_COPY = [
  {
    key: 'home_hero_kicker',
    group: '首頁',
    label: '首頁 hero 引文(金色小字)',
    defaultValue: '諸佛唯一大事因緣出現於世\n開佛知見 示佛知見 悟佛知見 入佛知見',
    multiline: true,
  },
  {
    key: 'home_hero_title',
    group: '首頁',
    label: '首頁 hero 主標詩句',
    defaultValue: '佛身真金色 圓光遍一尋',
  },
  {
    key: 'home_hero_verse',
    group: '首頁',
    label: '首頁 hero 詩句',
    defaultValue:
      '永斷眾煩惱 超度生死流 如是大導師 能調伏一切\n眾生咸蒙化 故號為真濟 汝今宜速往 詣彼世尊所',
    multiline: true,
  },
  {
    key: 'home_primer_card1_title',
    group: '首頁',
    label: '法寶略節卡片一(心經)標題',
    defaultValue: '般若波羅蜜多心經',
  },
  {
    key: 'home_primer_card1_desc',
    group: '首頁',
    label: '法寶略節卡片一(心經)說明',
    defaultValue: '二百六十字攝盡般若精要，照見五蘊皆空。',
  },
  {
    key: 'home_primer_card2_title',
    group: '首頁',
    label: '法寶略節卡片二(文檔)標題',
    defaultValue: '佛法文檔下載',
  },
  {
    key: 'home_primer_card2_desc',
    group: '首頁',
    label: '法寶略節卡片二(文檔)說明',
    defaultValue: '提供 PDF 經文供信眾下載研讀。',
  },
  {
    key: 'about_banner_verse',
    group: '關於我們',
    label: '關於頁 banner 詩句',
    defaultValue: '華開舜若因緣多\n勝境無窮更得安',
    multiline: true,
  },
  {
    key: 'about_kicker',
    group: '關於我們',
    label: '關於頁引言(kicker)',
    defaultValue: '弘揚淨土 持戒念佛',
  },
  {
    key: 'primer_banner_quote',
    group: '法寶略節',
    label: '法寶略節 banner 華嚴經引文',
    defaultValue: '華嚴經云:信為道元功德母, 增長一切諸善法 於至誠心深信恭敬',
  },
  {
    key: 'primer_reading_badge',
    group: '法寶略節',
    label: '線上閱讀卡片 標籤',
    defaultValue: '可閱讀',
  },
  {
    key: 'primer_reading_fallback_desc',
    group: '法寶略節',
    label: '線上閱讀卡片 預設說明(無譯者時)',
    defaultValue: '法寶略節經文',
  },
  {
    key: 'course_form_title',
    group: '課程報名',
    label: '報名提示框 標題',
    defaultValue: '線上報名表單',
  },
  {
    key: 'course_form_note',
    group: '課程報名',
    label: '報名提示框 說明',
    defaultValue: '選擇課程後填寫個人資料，我們將於三個工作天內與您聯繫確認',
  },
  {
    key: 'footer_brand_desc',
    group: '全站',
    label: 'Footer 品牌文案',
    defaultValue: '承續千年法脈，弘揚正信佛法，接引現代學人。',
  },
  {
    key: 'footer_copyright',
    group: '全站',
    label: 'Footer 版權列',
    defaultValue: '© 華圓覺苑 HUA YUAN TEMPLE · 南無阿彌陀佛',
  },
] as const satisfies readonly SiteCopyDef[]

export type SiteCopyKey = (typeof SITE_COPY)[number]['key']

export const SITE_COPY_DEFAULTS: Record<SiteCopyKey, string> = Object.fromEntries(
  SITE_COPY.map((def) => [def.key, def.defaultValue]),
) as Record<SiteCopyKey, string>

/** site_content 資料列(key 為主鍵的 KV 表) */
export interface SiteContent {
  key: string
  value: string | null
  updated_at: string
}

/**
 * DB 值 || 預設值:查無 key 或值為空白時 fallback 至現行硬編碼文案,
 * 網站永不因缺資料開天窗(rows 傳 null/undefined 亦安全)
 */
export function getCopy(
  rows: readonly SiteContent[] | null | undefined,
  key: SiteCopyKey,
): string {
  const value = rows?.find((row) => row.key === key)?.value
  return value && value.trim() ? value : SITE_COPY_DEFAULTS[key]
}
