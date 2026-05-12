"use client"

import Link from "next/link"
import { Image as ImageIcon } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

const navItems = [
  { href: "/compress", label: "图片压缩" },
  { href: "/convert", label: "格式转换" },
  { href: "/resize", label: "尺寸调整" },
  { href: "/crop", label: "图片裁剪" },
  { href: "/watermark", label: "添加水印" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ImageIcon className="h-6 w-6" />
          <span>ImageToolbox</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-8 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
