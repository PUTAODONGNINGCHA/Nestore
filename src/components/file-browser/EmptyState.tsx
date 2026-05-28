import { Upload } from 'lucide-react'

interface EmptyStateProps {
  onUploadClick?: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <button
        onClick={onUploadClick}
        className="w-20 h-20 rounded-[32px] bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] flex items-center justify-center mb-4 hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] dark:hover:shadow-[12px_12px_20px_rgb(0_0_0_/_0.5),-12px_-12px_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:active:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] transition-all duration-200 cursor-pointer"
      >
        <Upload className="w-8 h-8 text-[#6C63FF]" />
      </button>
      <h3 className="text-base font-bold text-[#3D4852] dark:text-[#E8ECF1] font-display">还没有内容</h3>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
        点击上方图标或拖拽文件到此处上传
      </p>
    </div>
  )
}
