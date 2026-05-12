"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function PasteHandler() {
  const router = useRouter()

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            const blobUrl = URL.createObjectURL(file)
            sessionStorage.setItem("paste_image_url", blobUrl)
            sessionStorage.setItem("paste_image_name", file.name || "pasted_image.png")
            router.push("/compress")
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [router])

  return null
}
