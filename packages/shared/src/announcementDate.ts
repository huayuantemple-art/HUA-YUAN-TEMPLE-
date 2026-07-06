/**
 * 公告日期解析(月曆檢視用,見 add-news-calendar-view change)。
 * announcements.date 為自由文字字串,慣例格式 YYYY.MM.DD;
 * 僅嚴格解析成功者可進月曆,失敗者只出現在列表(不用 new Date(string)
 * 寬鬆解析,避免瀏覽器間差異)。
 */

export interface AnnouncementDateParts {
  year: number
  month: number // 1-12
  day: number // 1-31
}

const DATE_PATTERN = /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/

/** 解析公告 date 字串;格式不符或日期不存在(如 2 月 30 日)回傳 null */
export function parseAnnouncementDate(value: string | null | undefined): AnnouncementDateParts | null {
  const match = (value ?? '').trim().match(DATE_PATTERN)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  // 以 Date 正規化檢查:溢位的日期(2 月 30)會被進位成別的月份
  const check = new Date(year, month - 1, day)
  if (check.getFullYear() !== year || check.getMonth() !== month - 1 || check.getDate() !== day) {
    return null
  }
  return { year, month, day }
}
