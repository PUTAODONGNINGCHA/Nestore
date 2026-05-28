export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('text/')) return 'text'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive'
  return 'file'
}

export function isPreviewable(mimeType: string): boolean {
  if (mimeType.startsWith('image/')) return true
  if (mimeType.startsWith('video/')) return true
  if (mimeType.startsWith('text/')) return true
  if (mimeType === 'application/pdf') return true
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return true
  if (mimeType.includes('document') || mimeType.includes('word')) return true
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return true
  return false
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
