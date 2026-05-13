"use client"

import { useState, useCallback, useEffect } from "react"
import { Columns, Download, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { downloadFile } from "@/lib/image-processor"

type Layout = "horizontal" | "vertical" | "grid"

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([])
  const [layout, setLayout] = useState<Layout>("horizontal")
  const [gap, setGap] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles])
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...files]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFiles.length) return
    ;[newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    setFiles(newFiles)
  }

  // 生成预览
  const generatePreview = useCallback(async () => {
    if (files.length < 2) {
      setPreviewUrl(null)
      return
    }

    setGenerating(true)

    try {
      const images = await Promise.all(
        files.map(
          (file) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image()
              img.onload = () => resolve(img)
              img.src = URL.createObjectURL(file)
            })
        )
      )

      let canvasWidth = 0
      let canvasHeight = 0

      if (layout === "horizontal") {
        canvasWidth = images.reduce((sum, img) => sum + img.naturalWidth, 0) + gap * (images.length - 1)
        canvasHeight = Math.max(...images.map((img) => img.naturalHeight))
      } else if (layout === "vertical") {
        canvasWidth = Math.max(...images.map((img) => img.naturalWidth))
        canvasHeight = images.reduce((sum, img) => sum + img.naturalHeight, 0) + gap * (images.length - 1)
      } else {
        const cols = Math.ceil(Math.sqrt(images.length))
        const rows = Math.ceil(images.length / cols)
        const maxWidth = Math.max(...images.map((img) => img.naturalWidth))
        const maxHeight = Math.max(...images.map((img) => img.naturalHeight))
        canvasWidth = cols * maxWidth + gap * (cols - 1)
        canvasHeight = rows * maxHeight + gap * (rows - 1)
      }

      const canvas = document.createElement("canvas")
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      const ctx = canvas.getContext("2d")!
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      let x = 0
      let y = 0

      if (layout === "horizontal") {
        for (const img of images) {
          ctx.drawImage(img, x, 0)
          x += img.naturalWidth + gap
        }
      } else if (layout === "vertical") {
        for (const img of images) {
          ctx.drawImage(img, 0, y)
          y += img.naturalHeight + gap
        }
      } else {
        const cols = Math.ceil(Math.sqrt(images.length))
        const maxWidth = Math.max(...images.map((img) => img.naturalWidth))
        const maxHeight = Math.max(...images.map((img) => img.naturalHeight))
        for (let i = 0; i < images.length; i++) {
          const col = i % cols
          const row = Math.floor(i / cols)
          x = col * (maxWidth + gap)
          y = row * (maxHeight + gap)
          ctx.drawImage(images[i], x, y)
        }
      }

      // 释放临时 URL
      images.forEach((img) => URL.revokeObjectURL(img.src))

      const url = canvas.toDataURL("image/png")
      setPreviewUrl(url)
    } catch (error) {
      console.error("预览生成失败:", error)
    }

    setGenerating(false)
  }, [files, layout, gap, backgroundColor])

  // 当设置改变时自动生成预览
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview()
    }, 300) // 防抖，300ms 后生成预览

    return () => clearTimeout(timer)
  }, [generatePreview])

  const downloadImage = async () => {
    if (!previewUrl) return
    const response = await fetch(previewUrl)
    const blob = await response.blob()
    downloadFile(blob, "merged_image.png")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Columns className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">图片拼接</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          将多张图片拼接成一张，支持横向、纵向和网格布局
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>上传图片</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFilesSelected={handleFilesSelected} />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>图片列表 ({files.length} 张)</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                  清空全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {files.length >= 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>拼接设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">布局方式</label>
                  <div className="flex gap-3">
                    <Button
                      variant={layout === "horizontal" ? "default" : "outline"}
                      onClick={() => setLayout("horizontal")}
                    >
                      横向拼接
                    </Button>
                    <Button
                      variant={layout === "vertical" ? "default" : "outline"}
                      onClick={() => setLayout("vertical")}
                    >
                      纵向拼接
                    </Button>
                    <Button
                      variant={layout === "grid" ? "default" : "outline"}
                      onClick={() => setLayout("grid")}
                    >
                      网格拼接
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">间距</label>
                    <span className="text-sm text-muted-foreground">{gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">背景颜色</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 预览区域 */}
        {files.length >= 2 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>拼接预览</CardTitle>
                {previewUrl && (
                  <Button onClick={downloadImage}>
                    <Download className="h-4 w-4 mr-2" />
                    下载图片
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generating ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  生成预览中...
                </div>
              ) : previewUrl ? (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="拼接预览"
                    className="max-w-full max-h-[500px] object-contain rounded-lg border"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  请上传至少 2 张图片
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
