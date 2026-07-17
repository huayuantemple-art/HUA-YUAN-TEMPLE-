/**
 * 網站文案 typed key 清單(site-copy-cms):
 * 前台以 getCopy(rows, key) 讀 DB 值 || 預設值,後台依 group 分組逐項編輯。
 * key 型別為字面量聯集 — 拼錯即編譯錯誤;預設值原樣搬移現行硬編碼文案。
 * 僅收內容性文案;功能性文字(讀取中、驗證訊息、按鈕文字)不納管。
 */

export const SITE_COPY_GROUPS = [
  '首頁',
  '最新公告',
  '關於我們',
  '人生的價值',
  '法寶略節',
  '課程報名',
  '全站',
] as const

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
    label: '首頁 hero 引文(第一行帶金線,其餘行列於下方)',
    defaultValue: '諸佛唯一大事因緣出現於世\n開佛知見　示佛知見\n悟佛知見　入佛知見',
    multiline: true,
  },
  {
    key: 'home_hero_title',
    group: '首頁',
    label: '首頁 hero 主標',
    defaultValue: '諸佛皆共讚歎阿彌陀佛',
  },
  {
    key: 'home_hero_verse',
    group: '首頁',
    label: '首頁 hero 偈頌(每行一句)',
    defaultValue: '念阿彌陀佛為開\n其佛本願力為示\n聞名欲往生為悟\n自致不退轉為入',
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
    // 唯一動態預設的文案:留空時前台自動輪播最新公告標題(news.vue fallback),
    // 故 defaultValue 為空字串,與「預設值=現行硬編碼文案」慣例不同
    key: 'news_marquee',
    group: '最新公告',
    label: '跑馬燈內容(每行一則;留空＝自動輪播最新公告標題)',
    defaultValue: '',
    multiline: true,
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
  {
    key: 'life_value_banner_verse',
    group: '人生的價值',
    label: '橫幅標題下方短語',
    defaultValue: '最有價值的人生，莫不是來世求生西方',
  },
  {
    key: 'life_value_intro',
    group: '人生的價值',
    label: '開頭引言（固定顯示，每行一句）',
    defaultValue:
      '慈念眾生，滅生死苦，求生西方，故倡導學舍，其福最勝。\n何以故？佛金口無問自說：極樂世界，惟有諸樂，無有眾苦。\n略節經文引證，願有緣之士，加入念佛、修福、修慧學舍——來世惟有諸樂，無有眾苦。',
    multiline: true,
  },
  {
    key: 'life_value_sections',
    group: '人生的價值',
    label: '可展開段落（每段第一行為大標題，段與段之間空一行）',
    defaultValue:
      '為什麼求生西方？——引據《地藏經》\n《地藏菩薩本願經》：聖女又問：「此水何緣，而乃湧沸？多諸罪人，及以惡獸。」無毒答曰：「此是南閻浮提造惡眾生，新死之者，經四十九日後，無人繼嗣為作功德、救拔苦難；生時又無善因，當據本業所感地獄，自然先渡此海。」\n\n學舍方針一：臨終立牌位，繼嗣為作功德\n一、臨終之時，學舍馬上立牌位，繼嗣為作功德。\n準《瑜伽論》云：人死中有身（中有即中陰身：若極善者即生淨土，極惡即入地獄，皆不經中陰；若善惡不定，即受中陰，經冥司也）。若未得生緣，極七日住，死而復生，如是展轉生死，至七七日決定得生；若有生緣，即不定。\n《釋氏要覽》云：今人亡，每七日必營齋追福，謂之齋七，令中有種子不轉生惡趣也。今既經七七之後，畢竟無人繼續承嗣為作功德，令其滅惡生善、救拔苦難——此言死者無人為追冥福，必致墮苦。\n是五無間大罪，雖至極重，動經億劫，了不得出；承斯臨命終時，他人為其稱念佛名，於是罪中亦漸消滅。何況眾生自稱自念，獲福無量，滅無量罪。\n\n學舍方針二：立牌位後，即刻念佛\n二、立牌位之後，馬上念佛。\n《往生集》曰：照作禮問曰：「末代凡夫，未審修何法門？」文殊告曰：「諸修行門，無如念佛。我以念佛得一切種智。」又問：「當云何念？」曰：「此世界西，有阿彌陀佛，彼佛願力不可思議。汝當繼念，毋令斷絕，決定往生。」\n若有男子女人，在生不修善因，多造眾罪，命終之後，眷屬大小為造福利、一切聖事，七分之中而乃獲一，六分功德生者自受。以是之故，未來現在善男女等，及健自修，十分全獲。\n\n學舍方針三：在生修福修慧，預發菩提心\n三、在生之時，八識已種「參加念佛、修福修慧、互相扶助」的觀念；健壯之時趕緊發菩提心、修福修慧，符合學員之實際，以備臨終後用。\n無常大鬼，不期而到；冥冥遊神，未知罪福。七七日內，如癡如聾，或在諸司辯論業果；審定之後，據業受生。未測之間，千萬愁苦，何況墮於諸惡趣等。是命終人，未得受生，七七日內念念之間，望諸骨肉眷屬與造福力救拔。過是日後，隨業受報：若是罪人，動經千百歲中無解脫日；若是五無間罪，墮大地獄，千劫萬劫永受眾苦。\n\n學舍方針四：七七日內眷屬造福救拔——可能嗎？\n四、七七日內，望諸骨肉眷屬與造福力救拔，可能嗎？\n故提倡學舍的方針：在七七日內立牌位，而每天早晚有人上香，提醒亡者念佛、往生西方；學員在生自備三資糧，七七造福救拔。\n是閻浮提行善之人，臨命終時，亦有百千惡道鬼神，或變作父母乃至眷屬，引接亡人，令落惡道，何況本作惡道。\n世尊！如是閻浮提男子女人，臨命終時，神識惛昧，不辯善惡，乃至眼耳更無見聞。是諸眷屬，當須設大供養，轉讀尊經，念佛菩薩名號。如是善緣，能令亡者離諸惡道，諸魔鬼神悉皆退散。\n世尊！一切眾生臨命終時，若得聞一佛名、一菩薩名，或大乘經典一句一偈，我觀如是輩人，除五無間殺害之罪，小小惡業合墮惡趣者，尋即解脫。\n\n學舍方針五：人生的意義與價值——轉凡成聖，超越解脫\n五、人生的意義與價值，莫不是不受生老病死繫縛，轉凡成聖，超越解脫。\n佛云：「一切眾生臨命終時，若得聞一佛名、一菩薩名，或大乘經典一句一偈，我觀如是輩人，除五無間殺害之罪，小小惡業合墮惡趣者，尋即解脫。」——這就是人生的意義和價值。\n因人死，前陰已謝，後陰未至，中陰現前；遇善則正見，遇惡則邪見，有二：\n一、遇善知識，念佛因緣得生西方，不受生死繫縛，故超越解脫——才有人生意義和價值。\n二、遇惡，沒有善因緣，則墮惡趣、六道輪迴、生死繫縛——失去人生意義與價值。故創辦學舍之意義和價值即在此。\n復次地藏：未來世中，若天若人，隨業報應，當墮惡趣，臨墮趣中或至地獄門首，是諸眾生若能念得一佛名、一菩薩名、一句一偈大乘經典，是諸眾生，汝以神力方便救拔，於是人所現無邊身，為碎地獄，遣令生天，受勝妙樂。\n\n經文總引證：無量壽經・觀經・彌陀經\n《彌陀經》云：「不可以少善根福德因緣，得生彼國。」\n《佛說無量壽經》段文云：佛語阿難：「其中輩者，十方世界諸天人民，其有至心願生彼國，雖不能行作沙門、大修功德，當發無上菩提之心，一向專念無量壽佛，多少修善、奉持齋戒、起立塔像、飯食沙門、懸繒然燈、散華燒香，以此迴向願生彼國。其人臨終，無量壽佛化現其身，光明相好具如真佛，與諸大眾現其人前，即隨化佛往生其國，住不退轉。」\n《觀經》段文云：佛告阿難及韋提希：「下品中生者，或有眾生作不善業，五逆、十惡，具諸不善。如此愚人以惡業故，應墮惡道，經歷多劫，受苦無窮。如此愚人臨命終時，遇善知識種種安慰，為說妙法，教令念佛；彼人苦逼，不遑念佛。善友告言：『汝若不能念彼佛者，應稱歸命無量壽佛。』如是至心，令聲不絕，具足十念，稱南無阿彌陀佛。稱佛名故，於念念中除八十億劫生死之罪。命終之時，見金蓮花猶如日輪，住其人前；如一念頃，即得往生極樂世界。」\n經云：逆惡之人，臨終十念皆得往生。夫臨終十念，必深植善根。今逆順境緣，便不復有正念，何況臨終？且臨終苦現，止藉善友提撕。今青天白日，尚不能於明師良友真實格言信受奉行，當臨終時，安能望善友現前？故遇善知識真實格言，必要信受奉行，欲求信解。\n若有眾生造地獄業，作已怖畏，起增上信，生慚愧心，厭惡棄捨，慇重懺悔，更不重造——如阿闍世王殺父等罪，暫入地獄，即得解脫。\n\n結語：加入學舍，共生西方\n覺苑創辦學舍，有佛七、每月蓮池會等等念佛活動，有這麼好的福德因緣，莫不是方便救拔眾生嗎？願有福德因緣者，皆能加入學員的一份子，共同往生西方——這是倡導者的心願。\n以上略節經文引證。若有意願加入學舍會員，歡迎與我們聯繫。',
    multiline: true,
  },
  {
    key: 'life_value_contact',
    group: '人生的價值',
    label: '頁尾聯絡區塊文字（每行一句；例如報名洽詢與聯絡人）',
    defaultValue:
      '報名或洽詢，歡迎與我們聯繫：\n會長　陳師兄　0975205767\n蔡師兄　0906851056\n劉師姐　0956798156\n陳師姐　0988222939',
    multiline: true,
  },
  {
    key: 'life_value_line_url',
    group: '人生的價值',
    label: 'LINE 加入好友連結（留空則不顯示按鈕）',
    defaultValue: 'https://lin.ee/8qiJdDW',
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
