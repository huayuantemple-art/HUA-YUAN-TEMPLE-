/** 同舊站 badge():已發布/招生中→綠、草稿→灰、其餘(額滿/隱藏/分類)→橘 */
export function badgeClass(status: string): string {
  if (status === '已發布' || status === '招生中' || status === '已回覆') return 'b-pub'
  if (status === '草稿') return 'b-draft'
  return 'b-warn'
}
