import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ImagePreview } from './ImagePreview'
import { VideoPreview } from './VideoPreview'
import { TextPreview } from './TextPreview'
import { PdfPreview } from './PdfPreview'
import { Button } from '@/components/ui/Button'
import { getStorageAdapter } from '@/storage/factory'
import type { FileItem } from '@/types'

interface FilePreviewProps {
  file: FileItem
  onClose: () => void
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        }
      } catch {
        setError('加载文件失败')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [file.storage_path, isText])

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
        <div className="flex items-center justify-center py-16">
          <div className="clay-spinner" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <Button variant="primary" onClick={handleDownload}>下载文件</Button>
        </div>
      ) : (
        <>
          {isImage && signedUrl && <ImagePreview src={signedUrl} name={file.name} />}
          {isVideo && signedUrl && <VideoPreview src={signedUrl} name={file.name} />}
          {isPdf && signedUrl && (
            <PdfPreview url={signedUrl} />
          )}
          {isText && textContent !== null && <TextPreview content={textContent} />}
          {isOffice && signedUrl && (
            <iframe
              src={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(signedUrl)}`}
              className="w-full h-[70vh] rounded-[24px]"
              title={file.name}
            />
          )}
          {isOffice && !signedUrl && (
            <div className="text-center py-16">
              <p className="text-[#635F69] mb-4 font-medium">预览加载失败，请下载后用本地应用打开</p>
              <Button variant="primary" onClick={handleDownload}>下载文件</Button>
            </div>
          )}
          {!isImage && !isVideo && !isPdf && !isText && !isOffice && (
            <div className="text-center py-16">
              <p className="text-[#635F69] mb-4 font-medium">暂不支持预览此文件类型</p>
              <Button variant="primary" onClick={handleDownload}>下载文件</Button>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
