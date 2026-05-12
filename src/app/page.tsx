import Link from "next/link"
import {
  Image as ImageIcon,
  FileDown,
  RefreshCw,
  Maximize,
  Crop,
  Droplets,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const tools = [
  {
    title: "图片压缩",
    description: "压缩图片文件大小，支持 JPEG、PNG、WebP 格式",
    href: "/compress",
    icon: FileDown,
  },
  {
    title: "格式转换",
    description: "在 JPEG、PNG、WebP、AVIF 等格式之间自由转换",
    href: "/convert",
    icon: RefreshCw,
  },
  {
    title: "尺寸调整",
    description: "按比例或自定义尺寸调整图片大小，支持常用平台预设",
    href: "/resize",
    icon: Maximize,
  },
  {
    title: "图片裁剪",
    description: "自由裁剪图片，支持 1:1、4:3、16:9 等多种比例",
    href: "/crop",
    icon: Crop,
  },
  {
    title: "添加水印",
    description: "为图片添加文字水印，支持自定义位置、大小和透明度",
    href: "/watermark",
    icon: Droplets,
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">ImageToolbox</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          免费在线图片处理工具箱，所有处理在浏览器本地完成，保护您的隐私
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <tool.icon className="h-8 w-8 text-primary" />
                  <CardTitle>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {tool.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center text-muted-foreground">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          为什么选择 ImageToolbox？
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-medium text-foreground mb-2">隐私优先</h3>
            <p>所有图片处理在您的浏览器中完成，不会上传到任何服务器</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">完全免费</h3>
            <p>无文件大小限制，无使用次数限制，完全免费使用</p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">简单易用</h3>
            <p>拖拽上传，一键处理，支持批量操作</p>
          </div>
        </div>
      </div>
    </div>
  )
}
