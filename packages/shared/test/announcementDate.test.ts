import { describe, expect, it } from 'vitest'
import { parseAnnouncementDate } from '../src/announcementDate'

describe('parseAnnouncementDate(公告日期解析,月曆檢視用)', () => {
  it('解析慣例格式 YYYY.MM.DD', () => {
    expect(parseAnnouncementDate('2026.05.10')).toEqual({ year: 2026, month: 5, day: 10 })
    expect(parseAnnouncementDate('2026.03.02')).toEqual({ year: 2026, month: 3, day: 2 })
  })

  it('月/日允許不補零', () => {
    expect(parseAnnouncementDate('2026.5.1')).toEqual({ year: 2026, month: 5, day: 1 })
  })

  it('前後空白容錯', () => {
    expect(parseAnnouncementDate(' 2026.05.10 ')).toEqual({ year: 2026, month: 5, day: 10 })
  })

  it('拒絕不存在的日期', () => {
    expect(parseAnnouncementDate('2026.02.30')).toBeNull()
    expect(parseAnnouncementDate('2026.13.01')).toBeNull()
    expect(parseAnnouncementDate('2026.00.10')).toBeNull()
    expect(parseAnnouncementDate('2026.04.31')).toBeNull()
    expect(parseAnnouncementDate('2025.02.29')).toBeNull() // 非閏年
  })

  it('接受閏年 2 月 29 日', () => {
    expect(parseAnnouncementDate('2028.02.29')).toEqual({ year: 2028, month: 2, day: 29 })
  })

  it('拒絕格式不符的字串', () => {
    expect(parseAnnouncementDate('2026-05-10')).toBeNull()
    expect(parseAnnouncementDate('2026.05')).toBeNull()
    expect(parseAnnouncementDate('05.10')).toBeNull()
    expect(parseAnnouncementDate('2026.05.10.1')).toBeNull()
    expect(parseAnnouncementDate('日期未定')).toBeNull()
  })

  it('空值與空字串回傳 null', () => {
    expect(parseAnnouncementDate(null)).toBeNull()
    expect(parseAnnouncementDate(undefined)).toBeNull()
    expect(parseAnnouncementDate('')).toBeNull()
    expect(parseAnnouncementDate('   ')).toBeNull()
  })
})
