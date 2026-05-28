import { useState, useEffect, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

const AUTH_KEY = 'family-cloud-authenticated'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY)
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
      sessionStorage.setItem(AUTH_KEY, 'true')
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
    sessionStorage.removeItem(AUTH_KEY)
    // 清除所有 localStorage 中的 Supabase 会话
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    })
  }, [])

  return { isAuthenticated, isLoading, error, login, logout }
}
