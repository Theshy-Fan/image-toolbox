"use client"

import { useState, useRef, useCallback } from "react"
import { Droplets, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { downloadFile, getFileExtension } from "@/lib/image-processor"

const positions = [
  { label: "左上角", value: "top-left" },
  { label: "右上角", value: "top-right" },
  { label: "居中", value: "center" },
  { label: "左下角", value: "bottom-left" },
  { label: "右下角", value: "bottom-right" },
]

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [watermarkText, setWatermarkText] = useState("© ImageToolbox")
  const [fontSize, setFontSize] = useState(24)
  const [opacity, setOpacity] = useState(50)
  const [position, setPosition] = useState("bottom-right")
  const [color, setColor] = useState("#ffffff")
  const imageRef = useRef<HTMLImageElement>(null)

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      setImageUrl(URL.createObjectURL(selectedFile))
    }
  }, [])

  const addWatermark = async () => {
    if (!file || !imageRef.current) return

    const img = imageRef.current
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0)

    ctx.font = `${fontSize * (img.naturalWidth / img.clientWidth)}px sans-serif`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity / 100

    const metrics = ctx.measureText(watermarkText)
    const textWidth = metrics.width
    const textHeight = fontSize * (img.naturalWidth / img.clientWidth)
    const padding = 20 * (img.naturalWidth / img.clientWidth)

    let x = 0
    let y = 0

    switch (position) {
      case "top-left":
        x = padding
        y = textHeight + padding
        break
      case "top-right":
        x = canvas.width - textWidth - padding
        y = textHeight + padding
        break
      case "center":
        x = (canvas.width - textWidth) / 2
        y = (canvas.height + textHeight) / 2
        break
      case "bottom-left":
        x = padding
        y = canvas.height - padding
        break
      case "bottom-right":
        x = canvas.width - textWidth - padding
        y = canvas.height - padding
        break
    }

    ctx.fillText(watermarkText, x, y)

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), file.type, 0.9)
    })

    const ext = getFileExtension(file.name)
    const filename = `${file.name.split(".")[0]}_watermarked.${ext}`
    downloadFile(blob, filename)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Droplets className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">添加水印</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          为图片添加文字水印，支持自定义位置、大小和透明度
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
                <CardTitle>预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative inline-block">
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="预览"
                    className="max-w-full max-h-[400px] object-contain"
                  />
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      color: color,
                      fontSize: `${fontSize}px`,
                      opacity: opacity / 100,
                      ...(position === "top-left" && { top: 10, left: 10 }),
                      ...(position === "top-right" && { top: 10, right: 10 }),
                      ...(position === "center" && {
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }),
                      ...(position === "bottom-left" && { bottom: 10, left: 10 }),
                      ...(position === "bottom-right" && { bottom: 10, right: 10 }),
                    }}
                  >
                    {watermarkText}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>水印设置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">水印文字</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      字体大小: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      透明度: {opacity}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">颜色</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-12 h-8 border rounded cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">位置</label>
                    <div className="flex flex-wrap gap-2">
                      {positions.map((pos) => (
                        <Button
                          key={pos.value}
                          variant={position === pos.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPosition(pos.value)}
                        >
                          {pos.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={addWatermark} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                添加水印并下载
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setImageUrl("")
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
