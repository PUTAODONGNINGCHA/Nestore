import { useRef, useState, useEffect } from 'react'
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

interface PdfPreviewProps {
  data: ArrayBuffer
}

export function PdfPreview({ data }: PdfPreviewProps) {
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
          <button
            onClick={() => changePage(-1)}
            disabled={pageNum <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-[16px] bg-white text-[#635F69] shadow-[4px_4px_8px_rgba(160,150,180,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)] disabled:opacity-30 transition-all duration-200 cursor-pointer"
          >
            ◀
          </button>
          <span className="text-sm font-bold text-[#332F3A]">{pageNum} / {numPages}</span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNum >= numPages}
            className="w-9 h-9 flex items-center justify-center rounded-[16px] bg-white text-[#635F69] shadow-[4px_4px_8px_rgba(160,150,180,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)] disabled:opacity-30 transition-all duration-200 cursor-pointer"
          >
            ▶
          </button>
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
      <canvas ref={canvasRef} className="max-w-full rounded-[24px] shadow-[8px_8px_16px_rgba(160,150,180,0.15)]" />
    </div>
  )
}
