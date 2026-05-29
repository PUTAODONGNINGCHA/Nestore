# Skill: 存储适配器模式

## 描述

通过接口抽象层解耦业务代码与存储后端，支持切换实现（Supabase / 本地 / S3 等），工厂模式单例获取。

## 接口定义

```tsx
// src/storage/types.ts
export interface StorageAdapter {
  // Auth
  signIn(password: string): Promise<string>
  signOut(): Promise<void>
  getSession(): Promise<string | null>

  // Folders
  getFolders(parentId: string | null): Promise<Folder[]>
  createFolder(name: string, parentId: string | null): Promise<Folder>
  renameFolder(id: string, name: string): Promise<void>
  moveFolder(id: string, targetParentId: string | null): Promise<void>
  deleteFolder(id: string): Promise<void>

  // Files
  getFiles(folderId: string | null): Promise<FileItem[]>
  getAllFiles(): Promise<FileItem[]>
  uploadFile(file: File, folderId: string | null, onProgress?: (pct: number) => void): Promise<FileItem>
  renameFile(id: string, name: string): Promise<void>
  moveFile(id: string, targetFolderId: string | null): Promise<void>
  deleteFile(id: string): Promise<void>
  getDownloadUrl(storagePath: string): Promise<string>
  getFileContents(storagePath: string): Promise<string>

  // Breadcrumbs
  getBreadcrumbs(folderId: string | null): Promise<{ id: string; name: string }[]>

  // Utility
  getAllFolders(): Promise<Folder[]>
  getThumbnailUrl(storagePath: string): Promise<string | null>
  updateSortOrder(items: { id: string; sort_order: number; type: 'folder' | 'file' }[]): Promise<void>
}
```

## 工厂模式

```tsx
// src/storage/factory.ts
import { SupabaseAdapter } from './supabase-adapter'
import type { StorageAdapter } from './types'

let adapter: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = new SupabaseAdapter(supabaseClient)
  }
  return adapter
}
```

## 使用方式（业务代码）

```tsx
import { getStorageAdapter } from '@/storage/factory'

// 下载文件
const url = await getStorageAdapter().getDownloadUrl(storagePath)

// 创建文件夹
const folder = await getStorageAdapter().createFolder('新文件夹', parentId)

// 移动文件
await getStorageAdapter().moveFile(fileId, targetFolderId)
```

## 切换存储后端

只需新建一个实现类：

```tsx
export class LocalStorageAdapter implements StorageAdapter {
  // 实现所有接口方法...
}
```

然后在 `factory.ts` 中替换：

```tsx
adapter = new LocalStorageAdapter()  // 替换 new SupabaseAdapter(...)
```

## Supabase 实现要点

### 签名 URL

```tsx
async getDownloadUrl(storagePath: string): Promise<string> {
  const { data } = await supabase.storage
    .from('family-files')
    .createSignedUrl(storagePath, 3600)  // 1小时过期
  return data!.signedUrl
}
```

### 文件名消毒（中文/特殊字符）

```tsx
const safeName = file.name.replace(/[\W.-]/g, '_')
const storagePath = `${folderId || 'root'}/${Date.now()}_${safeName}`
```

### 排序持久化（列可能不存在）

```tsx
async updateSortOrder(items: { id: string; sort_order: number; type: 'folder' | 'file' }[]): Promise<void> {
  const table = (type: 'folder' | 'file') => type === 'folder' ? 'folders' : 'files'

  for (const item of items) {
    const { error } = await this.client
      .from(table(item.type))
      .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
      .eq('id', item.id)
    if (error) {
      // sort_order column may not exist yet — ignore
      if (error.message?.includes('sort_order')) continue
      throw new Error(`Failed to update sort order: ${error.message}`)
    }
  }
}
```

## 注意事项

- 保持接口最小完备，不暴露具体存储后端的 API 细节
- `getAllFiles()` / `getAllFolders()` 用于搜索功能，按需实现
- 签名 URL 过期时间：预览设长（3600s），即时操作用短时间
