# Skill: 多格式文件预览

## 描述

按 MIME 类型自动分发到对应渲染器，支持图片、视频、PDF（pdf.js canvas 渲染）、Office（Microsoft Online Viewer）、文本。根据平台（移动端/桌面端）自动选择预览方式：移动端直接打开新标签页，桌面端使用内联 Modal。

## 平台检测与预览策略

移动端检测使用 User-Agent 正则（**不是** touch events，touchscreen 笔记本会误判）：

```tsx
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
```

| 类型 | 桌面端 | 移动端 |
|------|--------|--------|
| 图片 | Modal + `<img>` 懒加载 | 同桌面 |
| 视频 | Modal + `<video>` 原生 | 同桌面 |
| PDF | Modal + pdf.js canvas 渲染（ArrayBuffer） | window.open 新标签页（Safari 原生查看器） |
| Office | Modal + iframe(Microsoft Viewer) | 预览/下载按钮，点预览新标签页 |
| 文本 | Modal + `<pre>` 滚动 | 同桌面 |

## 文件入口：FileList → onPreview

在文件列表中直接判断平台，移动端跳过 Modal：

```tsx
// FileList.tsx — 文件预览入口
onPreview={(file) => {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // 移动端：签名 URL 直接新标签页
    getStorageAdapter().getDownloadUrl(file.storage_path)
      .then(url => window.open(url, '_blank'))
  } else {
    // 桌面端：打开 Modal，同时 pushState 让浏览器返回键可关闭
    setPreviewFile(file)
    window.history.pushState({ previewFile: true }, '')
  }
}}
```

历史记录配合 popstate 关闭预览（避免返回键响应两次）：

```tsx
useEffect(() => {
  const handlePopState = () => {
    if (previewFile) setPreviewFile(null)
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [previewFile])
```

## 预览调度组件 FilePreview

```tsx
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ImagePreview } from './ImagePreview'
import { VideoPreview } from './VideoPreview'
import { TextPreview } from './TextPreview'
import { PdfPreview } from './PdfPreview'
import { Button } from '@/components/ui/Button'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem } from '@/types'

const OFFICE_VIEWER = (url: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`

export function FilePreview({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const isText = file.mime_type.startsWith('text/')
  const isImage = file.mime_type.startsWith('image/')
  const isVideo = file.mime_type.startsWith('video/')
  const isPdf = file.mime_type === 'application/pdf'
  const isOffice = file.mime_type.includes('spreadsheet') || file.mime_type.includes('excel') ||
    file.mime_type.includes('document') || file.mime_type.includes('word') ||
    file.mime_type.includes('presentation') || file.mime_type.includes('powerpoint')

  useEffect(() => {
    const load = async () => {
      try {
        if (isText) {
          const content = await getStorageAdapter().getFileContents(file.storage_path)
          setTextContent(content)
        } else {
          const url = await getStorageAdapter().getDownloadUrl(file.storage_path)
          setSignedUrl(url)
          // 桌面端：预取 PDF 的 ArrayBuffer 给 pdf.js
          if (isPdf && !isMobile) {
            const resp = await fetch(url)
            setPdfData(await resp.arrayBuffer())
          }
        }
      } catch {
        setError('加载文件失败')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [file.storage_path, isText, isPdf, isMobile])

  const handleDownload = async () => {
    try {
      const url = await getStorageAdapter().getDownloadUrl(file.storage_path)
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrlLocal = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrlLocal
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrlLocal)
    } catch {
      alert('下载失败')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={file.name}>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="primary" onClick={handleDownload}>下载文件</Button>
        </div>
      ) : (
        <>
          {isImage && signedUrl && <ImagePreview src={signedUrl} name={file.name} />}
          {isVideo && signedUrl && <VideoPreview src={signedUrl} name={file.name} />}
          {isPdf && signedUrl && (
            isMobile ? (
              // 移动端：新标签页（Safari 原生 PDF 查看器）
              <div className="text-center py-8 space-y-3">
                <p className="text-[#635F69] text-sm">即将在新标签页中打开 PDF</p>
                <div className="flex justify-center gap-3">
                  <Button variant="primary" onClick={() => window.open(signedUrl, '_blank')}>
                    预览
                  </Button>
                  <Button variant="secondary" onClick={handleDownload}>下载</Button>
                </div>
              </div>
            ) : (
              pdfData && <PdfPreview data={pdfData} />
            )
          )}
          {isText && textContent !== null && <TextPreview content={textContent} />}
          {isOffice && signedUrl && (
            isMobile ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-[#635F69] text-sm">手机端需要在新标签页中预览</p>
                <div className="flex justify-center gap-3">
                  <Button variant="primary"
                    onClick={() => window.open(OFFICE_VIEWER(signedUrl), '_blank')}>
                    预览
                  </Button>
                  <Button variant="secondary" onClick={handleDownload}>下载</Button>
                </div>
              </div>
            ) : (
              <iframe
                src={OFFICE_VIEWER(signedUrl)}
                className="w-full h-[70vh] rounded-[24px]"
                title={file.name}
              />
            )
          )}
          {isOffice && !signedUrl && (
            <div className="text-center py-16">
              <p className="text-[#635F69] mb-4">预览加载失败</p>
              <Button variant="primary" onClick={handleDownload}>下载文件</Button>
            </div>
          )}
          {!isImage && !isVideo && !isPdf && !isText && !isOffice && (
            <div className="text-center py-16">
              <p className="text-[#635F69] mb-4">暂不支持预览此文件类型</p>
              <Button variant="primary" onClick={handleDownload}>下载文件</Button>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
```

## PDF 预览（pdf.js canvas 渲染）

依赖：`pdfjs-dist` v5 (ESM-only)，使用 Vite `?url` 导入 worker 避免 CDN 被墙。

```tsx
import { useRef, useState, useEffect } from 'react'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export function PdfPreview({ data }: { data: ArrayBuffer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pdfDoc = useRef<pdfjs.PDFDocumentProxy | null>(null)
  const loadingTask = useRef<pdfjs.PDFDocumentLoadingTask | null>(null)
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const scale = isMobile ? 1.0 : 1.5

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPageNum(1)
    setNumPages(0)
    pdfDoc.current = null

    const task = pdfjs.getDocument({ data })
    loadingTask.current = task

    task.promise.then(async (doc) => {
      if (cancelled) { doc.destroy(); return }
      pdfDoc.current = doc
      setNumPages(doc.numPages)
      try {
        const page = await doc.getPage(1)
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) { setLoading(false); return }
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvas, viewport }).promise
      } catch {
        if (!cancelled) setError('页面渲染失败')
      }
      if (!cancelled) setLoading(false)
    }).catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'PDF 加载失败')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      loadingTask.current?.destroy()
    }
  }, [data, scale])

  const changePage = async (delta: number) => {
    const newPage = pageNum + delta
    if (newPage < 1 || newPage > numPages || !pdfDoc.current) return
    setPageNum(newPage)
    setLoading(true)
    try {
      const page = await pdfDoc.current.getPage(newPage)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) { setLoading(false); return }
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvas, viewport }).promise
    } catch {
      setError('页面渲染失败')
    }
    setLoading(false)
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-red-500 font-medium mb-2">PDF 预览失败</p>
        <p className="text-[#635F69] text-xs break-all">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {numPages > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => changePage(-1)} disabled={pageNum <= 1}
            className="...clay-button...">◀</button>
          <span className="text-sm font-bold text-[#332F3A]">{pageNum} / {numPages}</span>
          <button onClick={() => changePage(1)} disabled={pageNum >= numPages}
            className="...clay-button...">▶</button>
        </div>
      )}
      {loading && (
        <div className="flex flex-col items-center gap-2 my-8">
          <div className="clay-spinner !w-6 !h-6 !border-2" />
          <span className="text-xs text-[#635F69]">
            {numPages > 0 ? `渲染第 ${pageNum} 页...` : '加载中...'}
          </span>
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full rounded-[24px]
        shadow-[8px_8px_16px_rgba(160,150,180,0.15)]" />
    </div>
  )
}
```

关键点：

- 使用 ArrayBuffer 传入（而非 URL 或 blob URL），避免网络往返
- cancelled 标志防止卸载后更新状态
- loadingTask.destroy() 在清理时中断 pdf.js 加载
- 平台自适应缩放（移动端 1.0，桌面端 1.5）

## Office 预览（Microsoft Office Online Viewer）

桌面端内联 iframe，移动端新标签页打开：

```tsx
const OFFICE_VIEWER = (url: string) =>
  `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`

// 桌面端
<iframe src={OFFICE_VIEWER(signedUrl)} className="w-full h-[70vh] rounded-[24px]" />

// 移动端
<Button onClick={() => window.open(OFFICE_VIEWER(signedUrl), '_blank')}>预览</Button>
```

**注意**: Microsoft Viewer 要求 URL **公开可访问**。Supabase 签名 URL 只有浏览器端可访问（带 Authorization header 的预检请求），微软服务器无法获取。如果遇到 "document is not publicly accessible"，需要改用其他方案。

## 图片预览

```tsx
export function ImagePreview({ src, name }: { src: string; name: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="flex items-center justify-center p-4">
      {!loaded && <Spinner />}
      <img src={src} alt={name}
        className={`max-h-[70vh] max-w-full rounded-[24px] shadow-lg object-contain
          ${loaded ? '' : 'hidden'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}
```

## 文本预览

```tsx
export function TextPreview({ content }: { content: string }) {
  return (
    <pre className="max-h-[65vh] overflow-y-auto p-6 text-sm leading-relaxed
      whitespace-pre-wrap break-all">
      {content}
    </pre>
  )
}
```

## Safari 兼容性

pdfjs-dist v5 使用两个 Safari 尚不支持的 ES2024 API，需在应用入口添加 polyfill：

```tsx
// main.tsx — 在任何 import 之前
if (!(Promise as any).withResolvers) {
  (Promise as any).withResolvers = function () {
    let resolve: (value: unknown) => void
    let reject: (reason?: unknown) => void
    const promise = new Promise<unknown>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve: resolve!, reject: reject! }
  }
}
if (!(URL as any).parse) {
  (URL as any).parse = function (url: string, base?: string) {
    try { return new URL(url, base) } catch { return null }
  }
}
```

## 数据流与生命周期

```
FileItem → getDownloadUrl(storage_path)
  ├── isText → getFileContents → TextPreview
  ├── isImage → signedUrl → ImagePreview (<img>)
  ├── isVideo → signedUrl → VideoPreview (<video>)
  ├── isPdf → signedUrl
  │   ├── 桌面端: fetch → ArrayBuffer → PdfPreview (pdf.js canvas)
  │   └── 移动端: window.open(signedUrl, '_blank')
  └── isOffice → signedUrl
      ├── 桌面端: iframe(Microsoft Viewer)
      └── 移动端: window.open(OFFICE_VIEWER(signedUrl), '_blank')
```

## 注意事项

- **Microsoft Viewer 限制**: 不支持签名 URL。如果文件桶是私有的，Office 预览在桌面端也会失败。考虑给 Office 文件额外生成一个短期公开 URL。
- **PDF worker**: 必须用 Vite `?url` 导入 `.mjs` worker，不能用 CDN URL（中国大陆 CDN 可能被墙导致 pdf.js 挂起）。
- **ArrayBuffer vs Blob URL**: 桌面端 PDF 使用 ArrayBuffer 传给 pdf.js，不用 blob URL。blob URL 需要额外 download 步骤且清理麻烦。
- **移动端 PDF**: 直接用签名 URL 新标签页打开，依靠 Safari 原生 PDF 查看器，不做内联渲染（避免性能问题和卡顿）。
- **返回键处理**: 预览打开时 `pushState`，popstate 关闭预览而不触发导航。文件夹导航用不同的 state key (`folderId` vs `previewFile`)，两者互不干扰。
