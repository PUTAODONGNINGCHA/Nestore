import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { ImagePreview } from './ImagePreview'
import { VideoPreview } from './VideoPreview'
import { TextPreview } from './TextPreview'
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
      } catch (err) {
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
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
    } catch {
      alert('下载失败')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={file.name}>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
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
            <iframe src={signedUrl} className="w-full h-[70vh] rounded-lg" title={file.name} />
          )}
          {isText && textContent !== null && <TextPreview content={textContent} />}
          {!isImage && !isVideo && !isPdf && !isText && (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-4">暂不支持预览此文件类型</p>
              <Button variant="primary" onClick={handleDownload}>下载文件</Button>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
