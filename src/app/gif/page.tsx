"use client"

import { useState, useCallback } from "react"
import { Film, Download, Trash2, ArrowUp, ArrowDown, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { downloadFile } from "@/lib/image-processor"

export default function GifPage() {
  const [files, setFiles] = useState<File[]>([])
  const [delay, setDelay] = useState(500)
  const [loop, setLoop] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles])
    setPreviewUrl(null)
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrl(null)
  }

  const moveFile = (index: number, direction: "up" | "down") => {
    const newFiles = [...files]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newFiles.length) return
    ;[newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    setFiles(newFiles)
    setPreviewUrl(null)
  }

  const startPreview = async () => {
    if (files.length === 0) return
    setPlaying(true)
    setCurrentIndex(0)

    const urls = files.map((file) => URL.createObjectURL(file))
    let index = 0

    const interval = setInterval(() => {
      index = (index + 1) % urls.length
      setCurrentIndex(index)
      if (!loop && index === urls.length - 1) {
        clearInterval(interval)
        setPlaying(false)
      }
    }, delay)

    return () => {
      clearInterval(interval)
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }

  const createGif = async () => {
    if (files.length < 2) return
    setProcessing(true)

    try {
      const GIF = (await import("gif.js")).default
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 300,
        height: 300,
      })

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

      const canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 300
      const ctx = canvas.getContext("2d")!

      for (const img of images) {
        ctx.clearRect(0, 0, 300, 300)
        const scale = Math.min(300 / img.naturalWidth, 300 / img.naturalHeight)
        const width = img.naturalWidth * scale
        const height = img.naturalHeight * scale
        const x = (300 - width) / 2
        const y = (300 - height) / 2
        ctx.drawImage(img, x, y, width, height)
        gif.addFrame(ctx, { copy: true, delay })
      }

      gif.on("finished", (blob: Blob) => {
        downloadFile(blob, "animation.gif")
        setProcessing(false)
      })

      gif.render()
    } catch (error) {
      console.error("GIF 制作失败:", error)
      setProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">GIF 制作</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          将多张图片合成为 GIF 动画
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
              <CardTitle>预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-[300px] h-[300px] border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {files[currentIndex] && (
                    <img
                      src={URL.createObjectURL(files[currentIndex])}
                      alt={`帧 ${currentIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (playing) {
                        setPlaying(false)
                      } else {
                        startPreview()
                      }
                    }}
                  >
                    {playing ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        预览
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  当前帧: {currentIndex + 1} / {files.length}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {files.length >= 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>GIF 设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">帧延迟</label>
                    <span className="text-sm text-muted-foreground">{delay}ms</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={delay}
                    onChange={(e) => setDelay(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>快速</span>
                    <span>慢速</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="loop"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="loop" className="text-sm font-medium">
                    循环播放
                  </label>
                </div>

                <Button onClick={createGif} disabled={processing} className="w-full">
                  {processing ? "生成中..." : "生成 GIF 并下载"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
