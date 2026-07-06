import { PDF_BUCKET, storagePublicUrl } from '@huayuan/shared'

function safeHeaderFilename(value: unknown): string {
  return String(value ?? 'download')
    .replace(/[\r\n"]/g, '')
    .trim()
    .slice(0, 180)
}

function fallbackFilename(filename: string): string {
  return filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_') || 'download'
}

function contentTypeFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase()
  if (extension === 'pdf') return 'application/pdf'
  if (extension === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return 'application/octet-stream'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = String(query.path ?? '').trim()
  const filename = safeHeaderFilename(query.name)

  if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid download path' })
  }

  const { public: pub } = useRuntimeConfig(event)
  const sourceUrl = storagePublicUrl(pub.supabaseUrl, PDF_BUCKET, path)
  const response = await fetch(sourceUrl)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: response.statusText || 'Download failed',
    })
  }

  const encodedFilename = encodeURIComponent(filename)
  setHeader(event, 'Content-Type', response.headers.get('content-type') || contentTypeFor(path))
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="${fallbackFilename(filename)}"; filename*=UTF-8''${encodedFilename}`,
  )
  const length = response.headers.get('content-length')
  if (length) setHeader(event, 'Content-Length', Number(length))
  setHeader(event, 'Cache-Control', 'private, max-age=0, must-revalidate')

  return new Uint8Array(await response.arrayBuffer())
})
