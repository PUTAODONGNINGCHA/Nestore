# Skill: Hooks 数据管理（乐观更新模式）

## 描述

React Hooks 模式，封装异步数据加载和 CRUD 操作。核心思路：**先更新本地状态（乐观更新）→ 再调 API → 失败时从 API 刷新恢复**。用户操作秒响应，无需等待网络请求。

## 模式结构

```tsx
function useResource(fetchParam: ParamType) {
  const [data, setData] = useState<Data[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. 数据加载：useCallback + useEffect 自动触发
  const refresh = useCallback(async () => { ... }, [fetchParam])
  useEffect(() => { refresh() }, [refresh])

  // 2. 创建操作：本地追加 + API 返回完整对象
  const create = useCallback(async (input) => { ... }, [fetchParam])

  // 3. 更新操作：乐观修改本地状态
  const update = useCallback(async (id, newData) => { ... }, [])

  // 4. 删除操作：乐观从本地移除
  const remove = useCallback(async (id) => { ... }, [])

  return { data, isLoading, error, refresh, create, update, remove }
}
```

## 完整示例：useFolders

```tsx
import { useState, useEffect, useCallback } from 'react'
import { getStorageAdapter } from '@/storage/factory'

export function useFolders(parentId: string | null) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载 — 依赖 parentId 变化自动重新获取
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getStorageAdapter().getFolders(parentId)
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [parentId])

  useEffect(() => {
    refresh()
  }, [refresh])

  // 创建 — 本地追加（API 返回完整对象）
  const create = useCallback(async (name: string) => {
    const folder = await getStorageAdapter().createFolder(name, parentId)
    setFolders((prev) => [...prev, folder])
    return folder
  }, [parentId])

  // 更新 — 乐观修改（不改排序，直接在原位置更新）
  const rename = useCallback(async (id: string, name: string) => {
    await getStorageAdapter().renameFolder(id, name)
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  }, [])

  // 删除 — 乐观移除
  const remove = useCallback(async (id: string) => {
    await getStorageAdapter().deleteFolder(id)
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return { folders, isLoading, error, refresh, create, rename, remove }
}
```

## 完整示例：useFiles

```tsx
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

  useEffect(() => { refresh() }, [refresh])

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
```

## 对比：乐观更新 vs 非乐观更新

| 场景 | 乐观更新 | 非乐观更新 |
|------|----------|------------|
| 重命名 | 立即更新 UI，API 失败时刷新 | 等待 API 返回再更新 UI |
| 删除 | 立即从列表移除 | 等待 API 返回再移除 |
| 创建 | API 返回完整对象后追加 | 同乐观（都需要 API 返回 ID） |
| 用户体验 | 流畅（秒响应） | 有延迟感 |
| 错误处理 | 需要回退机制（refresh） | 天然安全 |

## 关键约束

### `useCallback` 依赖

```tsx
// ✅ 正确：refresh 依赖 folderId
const refresh = useCallback(async () => {
  const data = await api.getFiles(folderId)
  setFiles(data)
}, [folderId])

// ✅ 正确：useEffect 只依赖 refresh（refresh 变化时重新执行）
useEffect(() => { refresh() }, [refresh])
```

### 不依赖参数的操作用 `[]`

```tsx
// rename/remove 不依赖 folderId → 空依赖数组，引用稳定
const rename = useCallback(async (id: string, name: string) => {
  await api.renameFile(id, name)
  setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
}, [])
```

### setState 函数式更新

```tsx
// ✅ 必须用函数式更新（prev => ...），避免闭包捕获旧 state
setFolders((prev) => [...prev, folder])  // 追加
setFolders((prev) => prev.map(...))       // 更新
setFolders((prev) => prev.filter(...))    // 删除
```

## 错误回退

对于乐观更新，API 失败后需要保证 UI 与服务器一致：

```tsx
const rename = useCallback(async (id: string, name: string) => {
  // 先乐观更新
  setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)))
  try {
    await api.renameFile(id, name)
  } catch {
    // API 失败 → 从服务器刷新恢复
    refresh()
  }
}, [refresh])
```

这种「先更新后验证」的方式体验最好，但逻辑更复杂。简单场景可以直接 `await` 后再更新。

## 适用场景

- 列表型数据（文件列表、文件夹列表、任务列表、消息列表）
- 操作频繁且用户期望秒响应的场景
- 数据量不大，一次刷新成本低的场景

## 注意事项

- **不要在 `useCallback` 中遗漏依赖**：`refresh` 依赖 `folderId`，如果遗漏则切换目录后不会重新加载
- **`setIsLoading(true)` 在 refresh 开头**：确保每次刷新都显示加载状态（配合外部 spinner）
- **错误状态管理**：`error` 在 refresh 开头重置，末尾捕获，避免残留旧错误
- **`useEffect` 不要直接 async**：用 `useCallback` 包裹异步函数，`useEffect` 中同步调用
