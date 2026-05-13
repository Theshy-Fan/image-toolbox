"use client"

import { useState, useCallback, useRef } from "react"
import { SlidersHorizontal, Download, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/FileUpload"
import { downloadFile, getFileExtension } from "@/lib/image-processor"

interface FilterValues {
  brightness: number
  contrast: number
  saturate: number
  grayscale: number
  sepia: number
  blur: number
}

const defaultFilters: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
}

const presets = [
  { label: "原图", filters: { ...defaultFilters } },
  { label: "明亮", filters: { ...defaultFilters, brightness: 120, contrast: 110 } },
  { label: "暗调", filters: { ...defaultFilters, brightness: 80, contrast: 120 } },
  { label: "复古", filters: { ...defaultFilters, sepia: 50, saturate: 80, contrast: 110 } },
  { label: "黑白", filters: { ...defaultFilters, grayscale: 100 } },
  { label: "高饱和", filters: { ...defaultFilters, saturate: 150 } },
  { label: "柔和", filters: { ...defaultFilters, brightness: 105, contrast: 90, saturate: 90 } },
]

export default function FilterPage() {
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0]
      setFile(selectedFile)
      setImageUrl(URL.createObjectURL(selectedFile))
      setFilters(defaultFilters)
    }
  }, [])

  const updateFilter = (key: keyof FilterValues, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyPreset = (preset: (typeof presets)[0]) => {
    setFilters(preset.filters)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const getFilterString = () => {
    return `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) blur(${filters.blur}px)`
  }

  const downloadImage = async () => {
    if (!file) return

    const img = new Image()
    img.src = imageUrl
    await new Promise((resolve) => (img.onload = resolve))

    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    const ctx = canvas.getContext("2d")!
    ctx.filter = getFilterString()
    ctx.drawImage(img, 0, 0)

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), file.type, 0.9)
    })

    const ext = getFileExtension(file.name)
    const filename = `${file.name.split(".")[0]}_filtered.${ext}`
    downloadFile(blob, filename)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <SlidersHorizontal className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">图片滤镜</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          调节亮度、对比度、饱和度等参数，支持多种预设滤镜
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
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="max-w-full max-h-[400px] object-contain rounded-lg"
                    style={{ filter: getFilterString() }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>滤镜预设</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>参数调节</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">亮度</label>
                      <span className="text-sm text-muted-foreground">{filters.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.brightness}
                      onChange={(e) => updateFilter("brightness", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">对比度</label>
                      <span className="text-sm text-muted-foreground">{filters.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.contrast}
                      onChange={(e) => updateFilter("contrast", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">饱和度</label>
                      <span className="text-sm text-muted-foreground">{filters.saturate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={filters.saturate}
                      onChange={(e) => updateFilter("saturate", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">灰度</label>
                      <span className="text-sm text-muted-foreground">{filters.grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.grayscale}
                      onChange={(e) => updateFilter("grayscale", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">复古</label>
                      <span className="text-sm text-muted-foreground">{filters.sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.sepia}
                      onChange={(e) => updateFilter("sepia", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">模糊</label>
                      <span className="text-sm text-muted-foreground">{filters.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={filters.blur}
                      onChange={(e) => updateFilter("blur", Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={downloadImage} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                下载滤镜图片
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setImageUrl("")
                  resetFilters()
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
