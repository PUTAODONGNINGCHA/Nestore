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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff] m-3">
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
