"use client"

import { useState, useCallback } from "react"
import { Maximize, Download, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import {
  resizeImage,
  formatFileSize,
  downloadFile,
  getFileExtension,
  type ResizeOptions,
  type ProcessResult,
} from "@/lib/image-processor"

interface FileWithResult {
  file: File
  result: ProcessResult | null
  processing: boolean
}

const presets = [
  { label: "微信头像", width: 240, height: 240 },
  { label: "公众号封面", width: 900, height: 383 },
  { label: "小红书", width: 1080, height: 1440 },
  { label: "淘宝主图", width: 800, height: 800 },
  { label: "Instagram", width: 1080, height: 1080 },
]

export default function ResizePage() {
  const [files, setFiles] = useState<FileWithResult[]>([])
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [processing, setProcessing] = useState(false)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(
      selectedFiles.map((file) => ({
        file,
        result: null,
        processing: false,
      }))
    )
  }, [])

  const applyPreset = (preset: (typeof presets)[0]) => {
    setWidth(preset.width)
    setHeight(preset.height)
  }

  const processFiles = async () => {
    setProcessing(true)
    const newFiles = [...files]

    for (let i = 0; i < newFiles.length; i++) {
      newFiles[i].processing = true
      setFiles([...newFiles])

      try {
        const options: ResizeOptions = {
          width,
          height,
          maintainAspectRatio,
        }
        const result = await resizeImage(newFiles[i].file, options)
        newFiles[i].result = result
      } catch (error) {
        console.error("调整失败:", error)
      }

      newFiles[i].processing = false
      setFiles([...newFiles])
    }

    setProcessing(false)
  }

  const downloadSingle = (index: number) => {
    const item = files[index]
    if (item.result) {
      const ext = getFileExtension(item.file.name)
      const filename = `${item.file.name.split(".")[0]}_${item.result.width}x${item.result.height}.${ext}`
      downloadFile(item.result.blob, filename)
    }
  }

  const downloadAll = () => {
    files.forEach((item, index) => {
      if (item.result) {
        setTimeout(() => downloadSingle(index), index * 100)
      }
    })
  }

  const hasResults = files.some((f) => f.result)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Maximize className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">尺寸调整</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          按比例或自定义尺寸调整图片大小，支持常用平台预设
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
              <CardTitle>尺寸设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    常用预设
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.label}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({preset.width}x{preset.height})
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      宽度 (px)
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-background"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      高度 (px)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-background"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setMaintainAspectRatio(!maintainAspectRatio)
                    }
                  >
                    {maintainAspectRatio ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm">
                    {maintainAspectRatio ? "保持宽高比" : "自由调整"}
                  </span>
                </div>

                <Button
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? "处理中..." : "开始调整"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>调整结果</CardTitle>
                <Button variant="outline" size="sm" onClick={downloadAll}>
                  <Download className="h-4 w-4 mr-2" />
                  下载全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.file.name}
                      </p>
                      {item.result && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>
                            {item.result.width} x {item.result.height}
                          </span>
                          <span className="ml-2">
                            {formatFileSize(item.file.size)} →{" "}
                            {formatFileSize(item.result.size)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {item.processing && (
                        <span className="text-sm text-muted-foreground">
                          处理中...
                        </span>
                      )}
                      {item.result && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => downloadSingle(index)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
