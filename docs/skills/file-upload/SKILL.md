# Skill: 文件上传流程

## 描述

基于 `react-dropzone` 实现拖拽上传和点击上传，包含文件名冲突检测、覆盖确认、上传进度条、错误处理等完整流程。

## 依赖

```json
"react-dropzone": "^14.x",
"lucide-react": "^0.x"
```

## 架构

```
FileUploader (拖拽区域 + 拖拽叠加层)
     │
     ▼
FileList.handleDrop (重复检测 + 覆盖确认)
     │
     ▼
useUpload.uploadMultiple (进度管理 + 逐文件上传)
     │
     ▼
SupabaseAdapter.uploadFile (Storage 上传 + DB 元数据写入)
```

## 组件：FileUploader

`react-dropzone` 的封装，提供拖拽叠加层 UI：

```tsx
import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

export function FileUploader({ onDrop }: { onDrop: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onDrop(acceptedFiles)
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    noClick: true,     // 点击由外部按钮触发
    noKeyboard: true,
  })

  return (
    <>
      {/* 隐藏的 file input（由外部按钮触发） */}
      <input ref={inputRef} type="file" multiple className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) handleDrop(files)
          e.target.value = ''
        }}
      />

      <div {...getRootProps()} onClick={() => inputRef.current?.click()} className="relative cursor-pointer">
        {/* 拖拽叠加层 */}
        {isDragActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center
            bg-white/80 backdrop-blur-xl rounded-[32px]
            shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff] m-3">
            <div className="flex flex-col items-center gap-2 text-[#7C3AED]">
              <Upload className="w-10 h-10" />
              <p className="text-lg font-extrabold font-display tracking-tight">释放以上传文件</p>
            </div>
          </div>
        )}
        <input {...getInputProps()} />
      </div>
    </>
  )
}
```

**设计要点**：
- `noClick: true` — 点击由外部 `<input>` 或按钮触发，避免重复绑定
- 拖拽时显示半透明叠加层 + 模糊背景
- `onClick` 委托给隐藏的 `inputRef`，兼容移动端点击

## 重复检测与覆盖确认

在 `FileList.handleDrop` 中，上传前先检查文件名冲突：

```tsx
const handleDrop = async (acceptedFiles: File[]) => {
  const existingNames = new Set(files.map((f) => f.name))
  const newFiles = acceptedFiles.filter((f) => !existingNames.has(f.name))
  const dupFiles = acceptedFiles.filter((f) => existingNames.has(f.name))

  if (dupFiles.length > 0) {
    const first = dupFiles[0]
    if (first && confirm(`文件 "${first.name}" 已存在，是否覆盖？`)) {
      // 覆盖：先删旧文件再上传
      for (const dup of dupFiles) {
        const old = files.find((f) => f.name === dup.name)
        if (old) await removeFile(old.id)
      }
      newFiles.push(...dupFiles)
    }
  }

  if (newFiles.length > 0) {
    await uploadMultiple(newFiles)
  }
}
```

**流程**：
1. 用 `Set` 收集当前目录文件名
2. 分离出「新文件」和「重复文件」
3. 有重复 → `confirm()` 询问用户是否覆盖
4. 覆盖 → 先删除旧文件再上传
5. 上传无重复文件

## Upload Hook

```tsx
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
```

**关键**：
- `uploadMultiple` 顺序逐个上传（非并行），避免并发冲突
- 上传完成回调 `onComplete` 触发列表刷新
- 每次上传前重置错误和进度状态

## 进度条

```tsx
export function ProgressBar({ progress, className = '' }: { progress: number; className?: string }) {
  return (
    <div className={`relative h-3 rounded-full bg-[#EFEBF5]
      shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff] overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED]
        transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }} />
    </div>
  )
}
```

## 完整使用示例

```tsx
function FileList({ currentFolderId, refreshFolders }) {
  const { refresh: refreshFiles } = useFiles(currentFolderId)
  const { isUploading, progress, error, uploadMultiple } = useUpload(
    currentFolderId,
    () => { refreshFiles(); refreshFolders() }
  )

  return (
    <div>
      <FileUploader onDrop={handleDrop} />

      {/* 外部上传按钮 */}
      <button onClick={() => uploadInputRef.current?.click()}>
        上传文件
      </button>

      {/* 进度条 */}
      {isUploading && (
        <div>
          <ProgressBar progress={progress} />
          <p className="text-xs text-[#6B7280] mt-1">正在上传...</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && <p className="text-xs text-red-500">上传: {error}</p>}
    </div>
  )
}
```

## 服务端上传流程（SupabaseAdapter）

```tsx
async uploadFile(file: File, folderId: string | null, onProgress?: (pct: number) => void): Promise<FileItem> {
  const ownerId = await this.ensureOwnerId()
  const fileId = crypto.randomUUID()

  // 文件名消毒
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const storagePath = `${ownerId}/${folderId ?? 'root'}/${fileId}-${safeName}`

  // 1. 上传到 Supabase Storage
  const { error: uploadError } = await this.client.storage
    .from('family-files')
    .upload(storagePath, file, { upsert: false })

  if (uploadError) throw new Error(`上传失败: ${uploadError.message}`)

  // 2. 写入数据库元数据
  const { data, error: dbError } = await this.client
    .from('files')
    .insert({
      id: fileId,
      name: file.name,
      mime_type: file.type || 'application/octet-stream',
      size: file.size,
      storage_path: storagePath,
      folder_id: folderId,
      owner_id: ownerId,
    })
    .select()
    .single()

  // 3. DB 写入失败 → 回滚 Storage 文件
  if (dbError) {
    await this.client.storage.from('family-files').remove([storagePath])
    throw new Error(`保存文件信息失败: ${dbError.message}`)
  }

  onProgress?.(100)
  return data as FileItem
}
```

**注意**：DB 写入失败时自动清理已上传的 Storage 文件，防止孤立文件占用空间。

## 注意事项

- **react-dropzone 版本注意**：v14 的 `useDropzone` 返回的 `getInputProps` 不能用在隐藏 input 上（会导致 `noClick` 失效），需要分离：`Dropzone` 只用拖拽，点击由独立 `<input>` 触发
- **文件名冲突检测**：按当前目录文件判断，不跨目录检查（同名文件可在不同文件夹共存）
- **顺序上传**：`uploadMultiple` 逐个上传而非并行，避免并发导致的数据一致性问题
- **进度回调**：Supabase JS SDK 原生不支持上传进度，此处简化处理（上传完成时直接跳转到 100%）
