/**
 * 文檔文字抽取(auto-sync-reading-from-documents):
 * 上傳佛法文檔時於瀏覽器抽出文字作為線上閱讀內文。
 * - DOCX:jszip 解 word/document.xml,w:p 為段、w:t 串接(同離線腳本 import-sutras.mjs 的品質)
 * - PDF:pdfjs 文字層逐頁抽取,以 Y 座標變化斷行;掃描檔無文字層 → 回空字串
 * 任何錯誤(壞檔、無文字層)一律回空字串,由呼叫端建立草稿待補。
 */
import JSZip from 'jszip'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

async function extractDocx(bytes: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(bytes)
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) return ''
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const paragraphs: string[] = []
  for (const p of doc.getElementsByTagName('w:p')) {
    const runs = [...p.getElementsByTagName('w:t')].map((t) => t.textContent ?? '')
    paragraphs.push(runs.join('').trim())
  }
  // 壓縮連續空段為單一空行,去除頭尾空行
  return paragraphs
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

interface PdfGlyph {
  str: string
  x: number
  y: number
}

/**
 * 單頁抽字:偵測橫排/直排(既有經文 PDF 多為直排)。
 * 相鄰字多為「同 X 異 Y」即直排 — 一欄為一句,換欄(X 變)斷行;
 * 橫排則以 Y 變化斷行。
 */
function extractPdfPage(glyphs: PdfGlyph[]): string {
  if (!glyphs.length) return ''
  let sameX = 0
  let sameY = 0
  for (let i = 1; i < glyphs.length; i++) {
    const current = glyphs[i]
    const previous = glyphs[i - 1]
    if (!current || !previous) continue
    const dx = Math.abs(current.x - previous.x)
    const dy = Math.abs(current.y - previous.y)
    if (dx <= 1 && dy > 1) sameX++
    else if (dy <= 1 && dx > 1) sameY++
  }
  const vertical = sameX > sameY
  let text = ''
  let last: number | null = null
  for (const glyph of glyphs) {
    const key = vertical ? glyph.x : glyph.y
    if (last !== null && Math.abs(key - last) > 1) text += '\n'
    text += glyph.str
    last = key
  }
  return text.trim()
}

async function extractPdf(bytes: ArrayBuffer): Promise<string> {
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const { items } = await page.getTextContent()
    const glyphs: PdfGlyph[] = []
    for (const item of items) {
      if (!('str' in item) || item.str.trim() === '') continue
      glyphs.push({ str: item.str, x: item.transform[4] as number, y: item.transform[5] as number })
    }
    pages.push(extractPdfPage(glyphs))
  }
  return pages
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** 依副檔名抽取文字;失敗或無文字回空字串 */
export async function extractDocumentText(
  bytes: ArrayBuffer,
  extension: 'pdf' | 'docx',
): Promise<string> {
  try {
    return extension === 'docx' ? await extractDocx(bytes) : await extractPdf(bytes)
  } catch {
    return ''
  }
}
