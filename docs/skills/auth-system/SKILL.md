# Skill: 共享密码认证系统

## 描述

基于 Supabase Auth 的单用户共享密码登录。所有用户使用同一个邮箱 + 共享密码登录，无需单独注册。认证状态通过 `sessionStorage` 持久化，关闭标签页后自动退出。

## 架构

```
LoginPage (UI) → useAuth (状态) → SupabaseAdapter.signIn (Auth API)
                                      │
                                      ▼
                               Supabase Auth (email + password)
                                      │
                                      ▼
                               sessionStorage 标记 + Session 恢复
```

## 认证 Hook

```tsx
import { useState, useEffect, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

const AUTH_KEY = 'family-cloud-authenticated'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化：检查是否已有有效 session
  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY)
    if (saved === 'true') {
      // 有标记 → 验证 session 是否仍有效
      getStorageAdapter().getSession().then((session) => {
        setIsAuthenticated(!!session)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  // 登录
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

  // 登出
  const logout = useCallback(async () => {
    await getStorageAdapter().signOut()
    setIsAuthenticated(false)
    sessionStorage.removeItem(AUTH_KEY)
    // 清除 Supabase 在 localStorage 中的会话数据
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-')) localStorage.removeItem(key)
    })
  }, [])

  return { isAuthenticated, isLoading, error, login, logout }
}
```

**设计要点**：

- **`sessionStorage`**（而非 `localStorage`）存储认证标记 → 关闭标签页自动清除，符合共享设备安全模型
- **初始化双路径**：有标记 → 验证 session 有效性；无标记 → 直接显示登录页（不阻塞）
- **登出清理**：除了调用 `signOut()`，还需要手动清除 `localStorage` 中 Supabase 写入的会话数据（以 `sb-` 为前缀的 key）

## 登录页面

```tsx
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function LoginPage({ onLogin, error, isLoading }: {
  onLogin: (password: string) => Promise<void>
  error: string | null
  isLoading: boolean
}) {
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    await onLogin(password)
  }

  return (
    <div className="min-h-screen bg-[#F4F1FA] flex items-center justify-center p-4">
      {/* 动画背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute h-[40vh] w-[40vh] rounded-full bg-[#8B5CF6]/10 blur-3xl
          -top-[10%] -right-[10%] animate-[clay-float_8s_ease-in-out_infinite] will-change-transform" />
        <div className="absolute h-[35vh] w-[35vh] rounded-full bg-[#EC4899]/8 blur-3xl
          -bottom-[10%] -left-[10%] animate-[clay-float-delayed_10s_ease-in-out_infinite] will-change-transform" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px]
            bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] shadow-[...] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#332F3A] font-display tracking-tight">个人云盘</h1>
          <p className="text-[#635F69] mt-2 text-sm font-medium">输入密码进入共享空间</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white rounded-[32px] shadow-[...] p-8 space-y-5">
          <input type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入共享密码" autoFocus
            className="w-full h-14 px-6 rounded-[20px] bg-[#EFEBF5]
              shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff]
              focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/20"
          />

          {error && <p className="text-sm text-red-500 text-center font-bold">{error}</p>}

          <Button type="submit" className="w-full" size="lg"
            disabled={isLoading || !password.trim()}>
            {isLoading ? '验证中...' : '进入云盘'}
          </Button>

          <p className="text-xs text-[#635F69] text-center font-medium">
            关闭浏览器标签页后自动退出登录
          </p>
        </form>
      </div>
    </div>
  )
}
```

## 认证守卫（App.tsx）

全局认证状态控制渲染路径：

```tsx
export default function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth()

  if (isLoading) {
    // 初始化中 → 全局 spinner
    return (
      <div className="min-h-screen bg-[#E0E5EC] flex items-center justify-center">
        <div className="clay-spinner !w-8 !h-8 !border-[3px]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // 未登录 → 登录页
    return <LoginPage onLogin={login} error={error} isLoading={isLoading} />
  }

  // 已登录 → 主应用
  return (
    <MainLayout onLogout={logout} headerRight={...}>
      <FileList ... />
    </MainLayout>
  )
}
```

## 服务端实现

```tsx
// SupabaseAdapter — Auth 部分
async signIn(password: string): Promise<string> {
  const { data, error } = await this.client.auth.signInWithPassword({
    email: this.email,          // 从 .env 读取的固定邮箱
    password,
  })
  if (error) throw new Error('密码错误，请重试')
  this.ownerId = data.user.id
  return data.session.access_token
}

async signOut(): Promise<void> {
  await this.client.auth.signOut()
  this.ownerId = null
}

async getSession(): Promise<string | null> {
  const { data: { session } } = await this.client.auth.getSession()
  if (session?.user) {
    this.ownerId = session.user.id
    return session.access_token
  }
  return null
}
```

## 环境变量

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FAMILY_EMAIL=family@your-domain.com    # 登录邮箱（固定）
```

- `VITE_FAMILY_EMAIL` 在 Supabase Auth 中创建用户时使用
- 共享密码在 Supabase Dashboard → Authentication → Users 中设置
- 一个邮箱 + 一个密码，所有用户共用

## 注意事项

- **共享密码 ≠ 多用户**：只有一层保护，适合家庭/团队内部使用
- **sessionStorage**：关闭标签页即退出，适合共享设备。如需保持登录，改用 `localStorage`
- **Supabase token 刷新**：Supabase JS SDK 会自动刷新 token，但只限于当前标签页生命周期内
- **`sb-` 前缀清理**：Supabase 在 `localStorage` 中写入 `sb-{project-ref}-auth-token`，登出时需清理，否则重新打开页面时会自动恢复 session
- **错误消息**：`signIn` 失败时不暴露具体原因（只显示"密码错误"），避免信息泄露
