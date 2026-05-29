import type { SupabaseClient } from '@supabase/supabase-js'
import type { FileItem, Folder } from '@/types'
import type { StorageAdapter } from './types'

const BUCKET = 'family-files'

export class SupabaseAdapter implements StorageAdapter {
  private client: SupabaseClient
  private email: string
  private ownerId: string | null = null

  constructor(client: SupabaseClient) {
    this.client = client
    this.email = import.meta.env.VITE_FAMILY_EMAIL || 'family@cloud.local'
  }

  private async ensureOwnerId(): Promise<string> {
    if (this.ownerId) return this.ownerId
    const { data: { session } } = await this.client.auth.getSession()
    if (!session?.user) throw new Error('Not authenticated')
    this.ownerId = session.user.id
    return this.ownerId
  }

  private async fetchSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn)
    if (error) throw new Error(`Failed to create signed URL: ${error.message}`)
    return data.signedUrl
  }

  // Auth
  async signIn(password: string): Promise<string> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: this.email,
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

  // Folders
  async getFolders(parentId: string | null): Promise<Folder[]> {
    const ownerId = await this.ensureOwnerId()
    const query = this.client
      .from('folders')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name')

    if (parentId === null) {
      query.is('parent_id', null)
    } else {
      query.eq('parent_id', parentId)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch folders: ${error.message}`)
    return data as Folder[]
  }

  async getAllFolders(): Promise<Folder[]> {
    const ownerId = await this.ensureOwnerId()
    const { data, error } = await this.client
      .from('folders')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name')
    if (error) throw new Error(`Failed to fetch all folders: ${error.message}`)
    return data as Folder[]
  }

  async createFolder(name: string, parentId: string | null): Promise<Folder> {
    const ownerId = await this.ensureOwnerId()
    const { data, error } = await this.client
      .from('folders')
      .insert({ name, parent_id: parentId, owner_id: ownerId })
      .select()
      .single()
    if (error) throw new Error(`Failed to create folder: ${error.message}`)
    return data as Folder
  }

  async renameFolder(id: string, name: string): Promise<void> {
    const { error } = await this.client
      .from('folders')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Failed to rename folder: ${error.message}`)
  }

  async moveFolder(id: string, targetParentId: string | null): Promise<void> {
    const { error } = await this.client
      .from('folders')
      .update({ parent_id: targetParentId, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Failed to move folder: ${error.message}`)
  }

  async deleteFolder(id: string): Promise<void> {
    const { error } = await this.client
      .from('folders')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Failed to delete folder: ${error.message}`)
  }

  // Files
  async getFiles(folderId: string | null): Promise<FileItem[]> {
    const ownerId = await this.ensureOwnerId()
    const query = this.client
      .from('files')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name')

    if (folderId === null) {
      query.is('folder_id', null)
    } else {
      query.eq('folder_id', folderId)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch files: ${error.message}`)
    return data as FileItem[]
  }

  async uploadFile(file: File, folderId: string | null, onProgress?: (pct: number) => void): Promise<FileItem> {
    const ownerId = await this.ensureOwnerId()
    const fileId = crypto.randomUUID()

    const storageDir = folderId ?? 'root'
    const safeName = file.name.replace(/[^\w.-]/g, '_')
    const storagePath = `${ownerId}/${storageDir}/${fileId}-${safeName}`

    const { error: uploadError } = await this.client.storage
      .from(BUCKET)
      .upload(storagePath, file, { upsert: false })

    if (uploadError) throw new Error(`上传失败: ${uploadError.message}`)

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

    if (dbError) {
      await this.client.storage.from(BUCKET).remove([storagePath])
      throw new Error(`保存文件信息失败: ${dbError.message}`)
    }

    onProgress?.(100)
    return data as FileItem
  }

  async renameFile(id: string, name: string): Promise<void> {
    const { error } = await this.client
      .from('files')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Failed to rename file: ${error.message}`)
  }

  async moveFile(id: string, targetFolderId: string | null): Promise<void> {
    const { error } = await this.client
      .from('files')
      .update({ folder_id: targetFolderId, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`Failed to move file: ${error.message}`)
  }

  async deleteFile(id: string): Promise<void> {
    const { data: file, error: fetchError } = await this.client
      .from('files')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(`Failed to fetch file: ${fetchError.message}`)

    if (file) {
      await this.client.storage.from(BUCKET).remove([file.storage_path])
    }

    const { error } = await this.client
      .from('files')
      .delete()
      .eq('id', id)
    if (error) throw new Error(`Failed to delete file: ${error.message}`)
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    return this.fetchSignedUrl(storagePath, 3600)
  }

  async getFileContents(storagePath: string): Promise<string> {
    const signedUrl = await this.fetchSignedUrl(storagePath, 60)
    const response = await fetch(signedUrl)
    return response.text()
  }

  async getThumbnailUrl(storagePath: string): Promise<string | null> {
    try {
      return await this.fetchSignedUrl(storagePath, 3600)
    } catch {
      return null
    }
  }

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

  // Breadcrumbs
  async getBreadcrumbs(folderId: string | null): Promise<{ id: string; name: string }[]> {
    if (folderId === null) return []

    const ownerId = await this.ensureOwnerId()

    // Get the target folder's path
    const { data: target, error } = await this.client
      .from('folders')
      .select('path')
      .eq('id', folderId)
      .eq('owner_id', ownerId)
      .single()

    if (error) return []
    if (!target) return []

    const ids = target.path.split('.')

    const { data: folders } = await this.client
      .from('folders')
      .select('id, name')
      .in('id', ids)

    if (!folders) return []

    const folderMap = new Map(folders.map((f) => [f.id, f.name]))
    return ids.map((id: string) => ({
      id,
      name: folderMap.get(id) ?? '...',
    }))
  }
}
