import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface FileUploaderProps {
  onDrop: (files: File[]) => void
}

export function FileUploader({ onDrop }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || [])
          if (files.length > 0) handleDrop(files)
          e.target.value = ''
        }}
      />
      <div
        {...getRootProps()}
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer"
      >
        {isDragActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#E0E5EC]/80 dark:bg-[#1a1d23]/80 backdrop-blur-sm rounded-[32px] shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] m-3">
            <div className="flex flex-col items-center gap-2 text-[#6C63FF]">
              <Upload className="w-10 h-10" />
              <p className="text-lg font-bold font-display">释放以上传文件</p>
            </div>
          </div>
        )}
        <input {...getInputProps()} />
      </div>
    </>
  )
}
