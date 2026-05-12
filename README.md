# ImageToolbox - 免费在线图片处理工具箱

一个纯前端的图片处理工具箱，所有处理在浏览器本地完成，保护用户隐私。

## 功能

- **图片压缩** - 压缩图片文件大小，支持 JPEG、PNG、WebP 格式
- **格式转换** - 在 JPEG、PNG、WebP、AVIF 格式之间自由转换
- **尺寸调整** - 按比例或自定义尺寸调整图片大小，支持常用平台预设

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/
│   ├── compress/    # 图片压缩页面
│   ├── convert/     # 格式转换页面
│   ├── resize/      # 尺寸调整页面
│   ├── layout.tsx   # 根布局
│   └── page.tsx     # 首页
├── components/
│   ├── ui/          # shadcn/ui 组件
│   ├── FileUpload.tsx
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   └── ThemeToggle.tsx
└── lib/
    ├── image-processor.ts  # 图片处理核心逻辑
    └── utils.ts
```

## 特点

- 隐私优先：所有图片处理在浏览器本地完成
- 完全免费：无文件大小限制，无使用次数限制
- 支持批量处理
- 支持明暗模式
