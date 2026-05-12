"use client"

import { useState, useCallback } from "react"
import { FileDown, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import {
  compressImage,
  formatFileSize,
  downloadFile,
  getFileExtension,
  changeFileExtension,
  type CompressOptions,
  type ProcessResult,
} from "@/lib/image-processor"
import JSZip from "jszip"

interface FileWithResult {
  file: File
  result: ProcessResult | null
  processing: boolean
  previewUrl: string | null
}

export default function CompressPage() {
  const [files, setFiles] = useState<FileWithResult[]>([])
  const [quality, setQuality] = useState(80)
  const [processing, setProcessing] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(
      selectedFiles.map((file) => ({
        file,
        result: null,
        processing: false,
        previewUrl: null,
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
        const options: CompressOptions = { quality }
        const result = await compressImage(newFiles[i].file, options)
        newFiles[i].result = result
        newFiles[i].previewUrl = URL.createObjectURL(result.blob)
      } catch (error) {
        console.error("压缩失败:", error)
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
      const filename = changeFileExtension(item.file.name, ext)
      downloadFile(item.result.blob, filename)
    }
  }

  const downloadAllAsZip = async () => {
    const zip = new JSZip()
    const folder = zip.folder("compressed_images")

    for (const item of files) {
      if (item.result) {
        const ext = getFileExtension(item.file.name)
        const filename = changeFileExtension(item.file.name, ext)
        folder?.file(filename, item.result.blob)
      }
    }

    const content = await zip.generateAsync({ type: "blob" })
    downloadFile(content, "compressed_images.zip")
  }

  const totalOriginalSize = files.reduce((sum, f) => sum + f.file.size, 0)
  const totalCompressedSize = files.reduce(
    (sum, f) => sum + (f.result?.size || 0),
    0
  )
  const hasResults = files.some((f) => f.result)
  const compressionRatio =
    totalOriginalSize > 0 && hasResults
      ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100)
      : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileDown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">图片压缩</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          压缩图片文件大小，支持 JPEG、PNG、WebP 格式，所有处理在浏览器本地完成
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
              <CardTitle>压缩设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">压缩质量</label>
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
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>更小文件</span>
                    <span>更高质量</span>
                  </div>
                </div>

                <Button
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? "处理中..." : "开始压缩"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {hasResults && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>压缩结果</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span>原始: {formatFileSize(totalOriginalSize)}</span>
                    <span className="mx-2">→</span>
                    <span>压缩后: {formatFileSize(totalCompressedSize)}</span>
                    <span className="ml-2 text-green-600 font-medium">
                      节省 {compressionRatio}%
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadAllAsZip}>
                    <Download className="h-4 w-4 mr-2" />
                    打包下载
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.file.name}
                        </p>
                        {item.result && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{formatFileSize(item.file.size)}</span>
                            <span>→</span>
                            <span>{formatFileSize(item.result.size)}</span>
                            <span className="text-green-600">
                              -
                              {Math.round(
                                (1 - item.result.size / item.file.size) * 100
                              )}
                              %
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
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                setPreviewIndex(
                                  previewIndex === index ? null : index
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => downloadSingle(index)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    {previewIndex === index && item.previewUrl && (
                      <div className="mt-2 p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">压缩前后对比</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              原始图片
                            </p>
                            <img
                              src={URL.createObjectURL(item.file)}
                              alt="原始"
                              className="w-full rounded border"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              压缩后
                            </p>
                            <img
                              src={item.previewUrl}
                              alt="压缩后"
                              className="w-full rounded border"
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
