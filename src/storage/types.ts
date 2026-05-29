import type { FileItem, Folder } from '@/types'

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
