"use client"

import { useState, useCallback } from "react"
import { RefreshCw, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import {
  convertImage,
  formatFileSize,
  downloadFile,
  getFileExtension,
  changeFileExtension,
  type ConvertOptions,
  type ProcessResult,
} from "@/lib/image-processor"

interface FileWithResult {
  file: File
  result: ProcessResult | null
  processing: boolean
}

const formats = [
  { value: "jpeg", label: "JPEG", ext: "jpg" },
  { value: "png", label: "PNG", ext: "png" },
  { value: "webp", label: "WebP", ext: "webp" },
] as const

export default function ConvertPage() {
  const [files, setFiles] = useState<FileWithResult[]>([])
  const [targetFormat, setTargetFormat] = useState<"jpeg" | "png" | "webp">(
    "webp"
  )
  const [quality, setQuality] = useState(90)
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

  const processFiles = async () => {
    setProcessing(true)
    const newFiles = [...files]

    for (let i = 0; i < newFiles.length; i++) {
      newFiles[i].processing = true
      setFiles([...newFiles])

      try {
        const options: ConvertOptions = {
          format: targetFormat,
          quality: targetFormat === "png" ? undefined : quality,
        }
        const result = await convertImage(newFiles[i].file, options)
        newFiles[i].result = result
      } catch (error) {
        console.error("转换失败:", error)
      }

      newFiles[i].processing = false
      setFiles([...newFiles])
    }

    setProcessing(false)
  }

  const downloadSingle = (index: number) => {
    const item = files[index]
    if (item.result) {
      const format = formats.find((f) => f.value === targetFormat)!
      const filename = changeFileExtension(item.file.name, format.ext)
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
          <RefreshCw className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">格式转换</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          在 JPEG、PNG、WebP 格式之间自由转换，支持批量处理
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
              <CardTitle>转换设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    目标格式
                  </label>
                  <div className="flex gap-3">
                    {formats.map((format) => (
                      <Button
                        key={format.value}
                        variant={
                          targetFormat === format.value ? "default" : "outline"
                        }
                        onClick={() => setTargetFormat(format.value)}
                      >
                        {format.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {targetFormat !== "png" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">输出质量</label>
                      <span className="text-sm text-muted-foreground">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {files.length} 个文件
                  </span>
                  <ArrowRight className="h-4 w-4" />
                  <span>
                    转换为 {formats.find((f) => f.value === targetFormat)?.label}
                  </span>
                </div>

                <Button
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? "转换中..." : "开始转换"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>转换结果</CardTitle>
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
                          <span>{getFileExtension(item.file.name).toUpperCase()}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{targetFormat.toUpperCase()}</span>
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
                          转换中...
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
