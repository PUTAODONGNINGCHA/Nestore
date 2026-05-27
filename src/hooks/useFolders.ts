import { useState, useEffect, useCallback } from 'react'
import type { Folder } from '@/types'
import { getStorageAdapter } from '@/storage/factory'

export function useFolders(parentId: string | null) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getStorageAdapter().getFolders(parentId)
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件夹失败')
    } finally {
      setIsLoading(false)
    }
  }, [parentId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async (name: string) => {
    const folder = await getStorageAdapter().createFolder(name, parentId)
    setFolders((prev) => [...prev, folder])
    return folder
  }, [parentId])

  const rename = useCallback(async (id: string, name: string) => {
    await getStorageAdapter().renameFolder(id, name)
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [])

  const remove = useCallback(async (id: string) => {
    await getStorageAdapter().deleteFolder(id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return { folders, isLoading, error, refresh, create, rename, remove }
}
