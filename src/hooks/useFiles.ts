import { useState, useEffect, useCallback } from 'react'
import type { FileItem } from '@/types'
import { getStorageAdapter } from '@/storage/factory'

export function useFiles(folderId: string | null) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getStorageAdapter().getFiles(folderId)
      setFiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件失败')
    } finally {
      setIsLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const rename = useCallback(async (id: string, name: string) => {
    await getStorageAdapter().renameFile(id, name)
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [])

  const remove = useCallback(async (id: string) => {
    await getStorageAdapter().deleteFile(id)
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return { files, isLoading, error, refresh, rename, remove }
}
