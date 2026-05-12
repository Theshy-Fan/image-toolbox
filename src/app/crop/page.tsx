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

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [selectedPreset, setSelectedPreset] = useState<string>("自由裁剪")
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ width: img.clientWidth, height: img.clientHeight })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDragStart({ x, y })
    setCropArea({ x, y, width: 0, height: 0 })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, imageSize.width))
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, imageSize.height))

    let width = currentX - dragStart.x
    let height = currentY - dragStart.y

    const selectedRatio = presets.find((p) => p.label === selectedPreset)?.ratio

    if (selectedRatio) {
      if (Math.abs(width) / selectedRatio > Math.abs(height)) {
        height = Math.sign(height) * Math.abs(width) / selectedRatio
      } else {
        width = Math.sign(width) * Math.abs(height) * selectedRatio
      }
    }

    setCropArea({
      x: width > 0 ? dragStart.x : dragStart.x + width,
      y: height > 0 ? dragStart.y : dragStart.y + height,
      width: Math.abs(width),
      height: Math.abs(height),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetCrop = () => {
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
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
                  className="relative inline-block cursor-crosshair"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="待裁剪图片"
                    className="max-w-full max-h-[500px] object-contain"
                    onLoad={handleImageLoad}
                  />
                  {cropArea.width > 0 && cropArea.height > 0 && (
                    <>
                      <div className="absolute inset-0 bg-black/50" />
                      <div
                        className="absolute bg-transparent border-2 border-white"
                        style={{
                          left: cropArea.x,
                          top: cropArea.y,
                          width: cropArea.width,
                          height: cropArea.height,
                        }}
                      />
                      <div
                        className="absolute"
                        style={{
                          left: cropArea.x,
                          top: cropArea.y,
                          width: cropArea.width,
                          height: cropArea.height,
                          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                        }}
                      />
                    </>
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
