import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface FileUploaderProps {
  onDrop: (files: File[]) => void
  isUploading: boolean
}

export function FileUploader({ onDrop, isUploading }: FileUploaderProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onDrop(acceptedFiles)
    }
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div {...getRootProps()} className="relative">
      {isDragActive && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-blue-600/10 dark:bg-blue-500/10 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-400 m-3">
          <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
            <Upload className="w-10 h-10" />
            <p className="text-lg font-medium">释放以上传文件</p>
          </div>
        </div>
      )}
      <input {...getInputProps()} />
      {isUploading && (
        <div className="px-4 lg:px-6 pt-3">
          <ProgressBar progress={50} className="w-full" />
          <p className="text-xs text-gray-400 mt-1">正在上传...</p>
        </div>
      )}
    </div>
  )
}
