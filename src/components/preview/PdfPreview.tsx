import { useRef, useState, useEffect } from 'react'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PdfPreviewProps {
  blobUrl: string
}

export function PdfPreview({ blobUrl }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [loading, setLoading] = useState(true)
  const pdfDoc = useRef<pdfjs.PDFDocumentProxy | null>(null)

  useEffect(() => {
    setLoading(true)
    pdfjs.getDocument(blobUrl).promise.then((doc) => {
      pdfDoc.current = doc
      setNumPages(doc.numPages)
      renderPage(1, doc)
    }).catch(() => setLoading(false))
  }, [blobUrl])

  const renderPage = async (num: number, doc?: pdfjs.PDFDocumentProxy) => {
    const d = doc || pdfDoc.current
    if (!d || !canvasRef.current) return
    const page = await d.getPage(num)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = canvasRef.current
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvas: canvas, viewport }).promise
    setLoading(false)
  }

  const changePage = (delta: number) => {
    const newPage = pageNum + delta
    if (newPage < 1 || newPage > numPages) return
    setPageNum(newPage)
    setLoading(true)
    renderPage(newPage)
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
      {loading && <div className="clay-spinner !w-6 !h-6 !border-2 my-8" />}
      <canvas ref={canvasRef} className="max-w-full rounded-[24px] shadow-[8px_8px_16px_rgba(160,150,180,0.15)]" />
    </div>
  )
}
