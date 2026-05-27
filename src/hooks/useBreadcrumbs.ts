import { useState, useEffect, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

export function useBreadcrumbs(folderId: string | null) {
  const [crumbs, setCrumbs] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (folderId === null) {
      setCrumbs([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getStorageAdapter().getBreadcrumbs(folderId)
      setCrumbs(data)
    } catch {
      setCrumbs([])
    } finally {
      setIsLoading(false)
    }
  }, [folderId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { crumbs, isLoading }
}
