"use client"

import { useState, useEffect } from "react"
import { History, Trash2, FileDown, RefreshCw, Maximize, Crop, Droplets } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getHistory,
  clearHistory,
  formatTimestamp,
  formatFileSize,
  type HistoryItem,
} from "@/lib/history"

const operationIcons: Record<string, typeof FileDown> = {
  "压缩": FileDown,
  "格式转换": RefreshCw,
  "尺寸调整": Maximize,
  "裁剪": Crop,
  "水印": Droplets,
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">处理历史</h1>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-2" />
              清空历史
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-8">
          最近 {history.length} 条处理记录
        </p>

        {history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <History className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">暂无处理记录</p>
              <p className="text-muted-foreground">
                使用图片处理功能后，记录会显示在这里
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const Icon = operationIcons[item.operation] || FileDown
              const compressionRatio = Math.round(
                (1 - item.resultSize / item.originalSize) * 100
              )

              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{item.filename}</p>
                        <Badge variant="secondary">{item.operation}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        <span>
                          {formatFileSize(item.originalSize)} → {formatFileSize(item.resultSize)}
                        </span>
                        {compressionRatio > 0 && (
                          <span className="text-green-600">
                            节省 {compressionRatio}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
