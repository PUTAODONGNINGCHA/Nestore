import { supabase } from '@/lib/supabase'
import { SupabaseAdapter } from './supabase-adapter'
import type { StorageAdapter } from './types'

let adapter: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) {
    adapter = new SupabaseAdapter(supabase)
  }
  return adapter
}
