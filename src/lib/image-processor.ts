export interface CompressOptions {
  quality: number // 0-100
  maxWidth?: number
  maxHeight?: number
}

export interface ConvertOptions {
  format: "jpeg" | "png" | "webp"
  quality?: number
}

export interface ResizeOptions {
  width?: number
  height?: number
  maintainAspectRatio: boolean
}

export interface ProcessResult {
  blob: Blob
  url: string
  width: number
  height: number
  size: number
}

// 加载图片到 Canvas
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 压缩图片
export async function compressImage(
  file: File,
  options: CompressOptions
): Promise<ProcessResult> {
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)

  let width = img.width
  let height = img.height

  // 限制最大尺寸
  if (options.maxWidth && width > options.maxWidth) {
    height = Math.round((height * options.maxWidth) / width)
    width = options.maxWidth
  }
  if (options.maxHeight && height > options.maxHeight) {
    width = Math.round((width * options.maxHeight) / height)
    height = options.maxHeight
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0, width, height)

  // 根据原文件类型选择输出格式
  let mimeType = file.type
  if (!mimeType || mimeType === "image/svg+xml") {
    mimeType = "image/jpeg"
  }

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      mimeType,
      options.quality / 100
    )
  })

  URL.revokeObjectURL(url)

  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    size: blob.size,
  }
}

// 转换格式
export async function convertImage(
  file: File,
  options: ConvertOptions
): Promise<ProcessResult> {
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)

  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height

  const ctx = canvas.getContext("2d")!

  // PNG 转其他格式时需要填充白色背景
  if (options.format !== "png" && file.type === "image/png") {
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0)

  const mimeType = `image/${options.format}`
  const quality = options.quality ? options.quality / 100 : undefined

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mimeType, quality)
  })

  URL.revokeObjectURL(url)

  return {
    blob,
    url: URL.createObjectURL(blob),
    width: img.width,
    height: img.height,
    size: blob.size,
  }
}

// 调整尺寸
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ProcessResult> {
  const url = URL.createObjectURL(file)
  const img = await loadImage(url)

  let width = options.width || img.width
  let height = options.height || img.height

  if (options.maintainAspectRatio) {
    if (options.width && !options.height) {
      height = Math.round((img.height * options.width) / img.width)
    } else if (options.height && !options.width) {
      width = Math.round((img.width * options.height) / img.height)
    } else if (options.width && options.height) {
      const ratio = Math.min(options.width / img.width, options.height / img.height)
      width = Math.round(img.width * ratio)
      height = Math.round(img.height * ratio)
    }
  }

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0, width, height)

  const mimeType = file.type || "image/jpeg"
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mimeType, 0.9)
  })

  URL.revokeObjectURL(url)

  return {
    blob,
    url: URL.createObjectURL(blob),
    width,
    height,
    size: blob.size,
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

// 下载文件
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || ""
}

// 更改文件扩展名
export function changeFileExtension(filename: string, newExt: string): string {
  const name = filename.substring(0, filename.lastIndexOf("."))
  return `${name}.${newExt}`
}
