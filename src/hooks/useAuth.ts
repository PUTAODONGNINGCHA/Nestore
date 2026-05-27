import { useState, useEffect, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('family-cloud-authenticated')
    if (saved === 'true') {
      getStorageAdapter().getSession().then((session) => {
        setIsAuthenticated(!!session)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      await getStorageAdapter().signIn(password)
      setIsAuthenticated(true)
      localStorage.setItem('family-cloud-authenticated', 'true')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await getStorageAdapter().signOut()
    setIsAuthenticated(false)
    localStorage.removeItem('family-cloud-authenticated')
  }, [])

  return { isAuthenticated, isLoading, error, login, logout }
}
