"use client"

import { useState, useCallback } from "react"
import { FileCode, Download, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadFile, formatFileSize } from "@/lib/image-processor"

export default function SvgPage() {
  const [svgContent, setSvgContent] = useState("")
  const [fileName, setFileName] = useState("")
  const [originalSize, setOriginalSize] = useState(0)
  const [optimizedSize, setOptimizedSize] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setOriginalSize(file.size)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setSvgContent(content)
      setOptimizedSize(new Blob([optimizeSvg(content)]).size)
    }
    reader.readAsText(file)
  }, [])

  const optimizeSvg = (svg: string): string => {
    let optimized = svg

    // 移除注释
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, "")

    // 移除空格和换行
    optimized = optimized.replace(/>\s+</g, "><")
    optimized = optimized.replace(/\s+/g, " ")

    // 移除无用属性
    optimized = optimized.replace(/\s*xmlns:xlink="[^"]*"/g, "")
    optimized = optimized.replace(/\s*xml:space="[^"]*"/g, "")

    // 简化颜色值 (#aabbcc -> #abc)
    optimized = optimized.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, "#$1$2$3")

    // 移除空的 defs
    optimized = optimized.replace(/<defs>\s*<\/defs>/g, "")

    return optimized.trim()
  }

  const handleOptimize = () => {
    if (!svgContent) return
    const optimized = optimizeSvg(svgContent)
    setOptimizedSize(new Blob([optimized]).size)
    setSvgContent(optimized)
  }

  const handleDownload = () => {
    if (!svgContent) return
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const optimizedName = fileName.replace(".svg", "_optimized.svg")
    downloadFile(blob, optimizedName)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(svgContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText()
    if (text.includes("<svg")) {
      setSvgContent(text)
      setFileName("pasted.svg")
      setOriginalSize(new Blob([text]).size)
      setOptimizedSize(new Blob([optimizeSvg(text)]).size)
    }
  }

  const compressionRatio = originalSize > 0 ? Math.round((1 - optimizedSize / originalSize) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileCode className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">SVG 优化</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          压缩 SVG 文件大小，移除无用代码和属性
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>上传 SVG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex-1">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <FileCode className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      点击选择 SVG 文件
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <Button variant="outline" onClick={handlePaste}>
                  从剪贴板粘贴
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {svgContent && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SVG 代码</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={svgContent}
                  onChange={(e) => {
                    setSvgContent(e.target.value)
                    setOptimizedSize(new Blob([optimizeSvg(e.target.value)]).size)
                  }}
                  className="w-full h-64 p-4 font-mono text-sm border rounded-lg bg-muted resize-none"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>优化结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">原始大小</p>
                    <p className="text-lg font-semibold">{formatFileSize(originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">优化后大小</p>
                    <p className="text-lg font-semibold">{formatFileSize(optimizedSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">压缩率</p>
                    <p className="text-lg font-semibold text-green-600">
                      {compressionRatio > 0 ? `-${compressionRatio}%` : "0%"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handleOptimize} className="flex-1">
                优化 SVG
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                下载优化后的 SVG
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
