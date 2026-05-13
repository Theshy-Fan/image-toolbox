"use client"

import { useState, useRef, useCallback } from "react"
import { Crop, Download, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { downloadFile, getFileExtension } from "@/lib/image-processor"

const presets = [
  { label: "自由裁剪", ratio: null },
  { label: "1:1 正方形", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
]

type HandleDirection = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' | null
type DragMode = 'create' | 'move' | 'resize' | null

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [selectedPreset, setSelectedPreset] = useState<string>("自由裁剪")
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [dragMode, setDragMode] = useState<DragMode>(null)
  const [activeHandle, setActiveHandle] = useState<HandleDirection>(null)
  const [hoverCursor, setHoverCursor] = useState<string>("crosshair")
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropStart, setCropStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setImageUrl(url)
      setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    }
  }, [])

  const getRelativePosition = (e: React.MouseEvent | MouseEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 }
    const rect = imageRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
    }
  }

  const getHandleAtPosition = (x: number, y: number): HandleDirection => {
    if (cropArea.width === 0 || cropArea.height === 0) return null

    const handleSize = 12
    const { x: cx, y: cy, width: cw, height: ch } = cropArea

    // 检查角落手柄
    if (Math.abs(x - cx) < handleSize && Math.abs(y - cy) < handleSize) return 'nw'
    if (Math.abs(x - (cx + cw)) < handleSize && Math.abs(y - cy) < handleSize) return 'ne'
    if (Math.abs(x - cx) < handleSize && Math.abs(y - (cy + ch)) < handleSize) return 'sw'
    if (Math.abs(x - (cx + cw)) < handleSize && Math.abs(y - (cy + ch)) < handleSize) return 'se'

    // 检查边中点手柄
    if (Math.abs(x - (cx + cw / 2)) < handleSize && Math.abs(y - cy) < handleSize) return 'n'
    if (Math.abs(x - (cx + cw / 2)) < handleSize && Math.abs(y - (cy + ch)) < handleSize) return 's'
    if (Math.abs(x - cx) < handleSize && Math.abs(y - (cy + ch / 2)) < handleSize) return 'w'
    if (Math.abs(x - (cx + cw)) < handleSize && Math.abs(y - (cy + ch / 2)) < handleSize) return 'e'

    return null
  }

  const isInCropArea = (x: number, y: number): boolean => {
    if (cropArea.width === 0 || cropArea.height === 0) return false
    return (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    )
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getRelativePosition(e)

    // 检查是否点击在手柄上
    const handle = getHandleAtPosition(pos.x, pos.y)
    if (handle) {
      setDragMode('resize')
      setActiveHandle(handle)
      setHoverCursor(`${handle}-resize`)
      setDragStart(pos)
      setCropStart({ ...cropArea })
      return
    }

    // 检查是否点击在裁剪区域内
    if (isInCropArea(pos.x, pos.y)) {
      setDragMode('move')
      setHoverCursor('move')
      setDragStart(pos)
      setCropStart({ ...cropArea })
      return
    }

    // 否则创建新裁剪区域
    setDragMode('create')
    setHoverCursor('crosshair')
    setDragStart(pos)
    setCropArea({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getRelativePosition(e)

    // 更新悬停光标
    if (!dragMode) {
      const handle = getHandleAtPosition(pos.x, pos.y)
      if (handle) {
        setHoverCursor(`${handle}-resize`)
      } else if (isInCropArea(pos.x, pos.y)) {
        setHoverCursor('move')
      } else {
        setHoverCursor('crosshair')
      }
      return
    }

    if (dragMode === 'create') {
      let width = pos.x - dragStart.x
      let height = pos.y - dragStart.y

      const selectedRatio = presets.find((p) => p.label === selectedPreset)?.ratio

      if (selectedRatio) {
        if (Math.abs(width) / selectedRatio > Math.abs(height)) {
          height = Math.sign(height || 1) * Math.abs(width) / selectedRatio
        } else {
          width = Math.sign(width || 1) * Math.abs(height) * selectedRatio
        }
      }

      setCropArea({
        x: width >= 0 ? dragStart.x : dragStart.x + width,
        y: height >= 0 ? dragStart.y : dragStart.y + height,
        width: Math.abs(width),
        height: Math.abs(height),
      })
    } else if (dragMode === 'move') {
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y
      setCropArea({
        x: Math.max(0, cropStart.x + dx),
        y: Math.max(0, cropStart.y + dy),
        width: cropStart.width,
        height: cropStart.height,
      })
    } else if (dragMode === 'resize') {
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y

      let newX = cropStart.x
      let newY = cropStart.y
      let newWidth = cropStart.width
      let newHeight = cropStart.height

      if (activeHandle?.includes('w')) {
        newX = cropStart.x + dx
        newWidth = cropStart.width - dx
      }
      if (activeHandle?.includes('e')) {
        newWidth = cropStart.width + dx
      }
      if (activeHandle?.includes('n')) {
        newY = cropStart.y + dy
        newHeight = cropStart.height - dy
      }
      if (activeHandle?.includes('s')) {
        newHeight = cropStart.height + dy
      }

      // 确保尺寸为正数
      if (newWidth < 0) {
        newX = newX + newWidth
        newWidth = -newWidth
      }
      if (newHeight < 0) {
        newY = newY + newHeight
        newHeight = -newHeight
      }

      setCropArea({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        width: newWidth,
        height: newHeight,
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragMode(null)
    setActiveHandle(null)

    // 更新悬停光标
    const pos = getRelativePosition(e)
    const handle = getHandleAtPosition(pos.x, pos.y)
    if (handle) {
      setHoverCursor(`${handle}-resize`)
    } else if (isInCropArea(pos.x, pos.y)) {
      setHoverCursor('move')
    } else {
      setHoverCursor('crosshair')
    }
  }

  const handleMouseLeave = () => {
    setDragMode(null)
    setActiveHandle(null)
    setHoverCursor('crosshair')
  }

  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setDragMode(null)
    setActiveHandle(null)
    setHoverCursor('crosshair')
  }

  const cropImage = async () => {
    if (!file || !imageRef.current || cropArea.width === 0 || cropArea.height === 0) return

    const img = imageRef.current
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    const canvas = document.createElement("canvas")
    canvas.width = cropArea.width * scaleX
    canvas.height = cropArea.height * scaleY

    const ctx = canvas.getContext("2d")!
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), file.type, 0.9)
    })

    const ext = getFileExtension(file.name)
    const filename = `${file.name.split(".")[0]}_cropped.${ext}`
    downloadFile(blob, filename)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Crop className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">图片裁剪</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          自由裁剪图片，支持多种预设比例
        </p>

        {!file ? (
          <Card>
            <CardContent className="pt-6">
              <FileUpload onFilesSelected={handleFilesSelected} multiple={false} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>裁剪区域</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetCrop}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant={selectedPreset === preset.label ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPreset(preset.label)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div
                  ref={containerRef}
                  className="relative inline-block select-none"
                  style={{ cursor: hoverCursor }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="待裁剪图片"
                    className="max-w-full max-h-[500px] object-contain pointer-events-none"
                    onLoad={() => {
                      setCropArea({ x: 0, y: 0, width: 0, height: 0 })
                    }}
                    draggable={false}
                  />
                  {cropArea.width > 0 && cropArea.height > 0 && (
                    <div
                      className="absolute border-2 border-white pointer-events-none"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {/* 角落手柄 */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize" />

                      {/* 边中点手柄 */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-gray-400 cursor-n-resize" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-gray-400 cursor-s-resize" />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-white border border-gray-400 cursor-w-resize" />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-white border border-gray-400 cursor-e-resize" />
                    </div>
                  )}
                </div>

                {cropArea.width > 0 && cropArea.height > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    裁剪区域: {Math.round(cropArea.width)} x {Math.round(cropArea.height)} 像素
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={cropImage}
                disabled={cropArea.width === 0 || cropArea.height === 0}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                裁剪并下载
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setImageUrl("")
                  resetCrop()
                }}
              >
                选择其他图片
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
