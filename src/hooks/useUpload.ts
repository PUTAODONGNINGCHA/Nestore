import { useState, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

export function useUpload(folderId: string | null, onComplete?: () => void) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    setError(null)
    setIsUploading(true)
    setProgress(0)

    try {
      await getStorageAdapter().uploadFile(file, folderId, (pct) => {
        setProgress(pct)
      })
      onComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
      throw err
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }, [folderId, onComplete])

  const uploadMultiple = useCallback(async (files: File[]) => {
    for (const file of files) {
      await upload(file)
    }
  }, [upload])

  return { isUploading, progress, error, upload, uploadMultiple }
}
