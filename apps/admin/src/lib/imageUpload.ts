import { IMAGE_BUCKET, versionedStoragePublicUrl } from '@huayuan/shared'
import { supabase } from './supabase'

type ImageKind = 'photo' | 'icon'

const MAX_SIDE: Record<ImageKind, number> = {
  photo: 1600,
  icon: 256,
}

const QUALITY: Record<ImageKind, number> = {
  photo: 0.82,
  icon: 0.9,
}

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('圖片讀取失敗'))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, kind: ImageKind): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('圖片壓縮失敗'))
      },
      'image/webp',
      QUALITY[kind],
    )
  })
}

async function compressImage(file: File, kind: ImageKind): Promise<Blob> {
  const img = await readImage(file)
  const maxSide = MAX_SIDE[kind]
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.max(1, Math.round(img.naturalWidth * scale))
  const height = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('瀏覽器不支援圖片壓縮')
  ctx.drawImage(img, 0, 0, width, height)
  return canvasToBlob(canvas, kind)
}

export async function uploadSiteImage(file: File, key: string, kind: ImageKind): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('請選擇圖片檔')

  const path = `${key}.webp`
  const blob = await compressImage(file, kind)
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    cacheControl: '31536000',
    contentType: 'image/webp',
    upsert: true,
  })
  if (error) throw error

  return versionedStoragePublicUrl(import.meta.env.VITE_SUPABASE_URL, IMAGE_BUCKET, path)
}
