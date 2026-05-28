export interface Folder {
  id: string
  name: string
  parent_id: string | null
  path: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface FileItem {
  id: string
  name: string
  mime_type: string
  size: number
  storage_path: string
  folder_id: string | null
  owner_id: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type FileEntry = {
  type: 'file'
  data: FileItem
} | {
  type: 'folder'
  data: Folder
}

export interface FilePreviewData {
  signedUrl: string
  mimeType: string
  name: string
  size: number
}
