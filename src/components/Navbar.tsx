"use client"

import Link from "next/link"
import { Image as ImageIcon, History, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const basicTools = [
  { href: "/compress", label: "图片压缩" },
  { href: "/convert", label: "格式转换" },
  { href: "/resize", label: "尺寸调整" },
  { href: "/crop", label: "图片裁剪" },
  { href: "/watermark", label: "添加水印" },
]

const advancedTools = [
  { href: "/filter", label: "图片滤镜" },
  { href: "/merge", label: "图片拼接" },
  { href: "/gif", label: "GIF 制作" },
  { href: "/svg", label: "SVG 优化" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ImageIcon className="h-6 w-6" />
          <span>ImageToolbox</span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center gap-6 ml-8 text-sm">
          {basicTools.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground transition-colors hover:text-foreground outline-none">
              更多工具
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {advancedTools.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">{item.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/history">
            <Button variant="ghost" size="icon">
              <History className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />

          {/* 移动端导航 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>基础工具</DropdownMenuLabel>
              {basicTools.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>高级工具</DropdownMenuLabel>
              {advancedTools.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/history" className="w-full">处理历史</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
