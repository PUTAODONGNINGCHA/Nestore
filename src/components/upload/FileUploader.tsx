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
      {/* Hidden input for click upload */}
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
        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#E0E5EC]/80 dark:bg-[#1a1d23]/80 backdrop-blur-sm rounded-[32px] shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] m-3">
            <div className="flex flex-col items-center gap-2 text-[#6C63FF]">
              <Upload className="w-10 h-10" />
              <p className="text-lg font-bold font-display">释放以上传文件</p>
            </div>
          </div>
        )}
        {/* Visible upload button */}
        <div className="flex items-center justify-center gap-3 w-full py-4 rounded-[32px] bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] dark:shadow-[9px_9px_16px_rgb(0_0_0_/_0.4),-9px_-9px_16px_rgba(255,255,255,0.05)] hover:shadow-[inset_4px_4px_8px_rgb(163_177_198_/_0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] dark:hover:shadow-[inset_4px_4px_8px_rgb(0_0_0_/_0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] active:shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:active:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] transition-all duration-200">
          <Upload className="w-5 h-5 text-[#6C63FF]" />
          <span className="text-sm font-medium text-[#3D4852] dark:text-[#E8ECF1]">点击上传文件，或拖拽文件到此处</span>
        </div>
        <input {...getInputProps()} />
      </div>
    </>
  )
}
