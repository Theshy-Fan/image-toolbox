declare module "gif.js" {
  interface GIFOptions {
    workers?: number
    quality?: number
    width?: number
    height?: number
    workerScript?: string
    background?: string
    transparent?: string | null
    dither?: boolean | string
    repeat?: number
    debug?: boolean
  }

  interface FrameOptions {
    delay?: number
    copy?: boolean
    dispose?: number
  }

  class GIF {
    constructor(options?: GIFOptions)
    addFrame(
      canvas: HTMLCanvasElement | CanvasRenderingContext2D,
      options?: FrameOptions
    ): void
    on(event: "finished", callback: (blob: Blob) => void): void
    on(event: "progress", callback: (progress: number) => void): void
    render(): void
    abort(): void
  }

  export default GIF
}
