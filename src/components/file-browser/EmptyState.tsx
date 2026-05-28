import { Upload } from 'lucide-react'

interface EmptyStateProps {
  onUploadClick?: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <button
        onClick={onUploadClick}
        className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center mb-4 shadow-[12px_12px_24px_rgba(139,92,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[16px_16px_32px_rgba(139,92,246,0.35),-10px_-10px_20px_rgba(255,255,255,0.5)] active:scale-[0.92] active:shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff] transition-all duration-200 cursor-pointer"
      >
        <Upload className="w-8 h-8 text-white" />
      </button>
      <h3 className="text-xl font-extrabold text-[#332F3A] font-display tracking-tight">还没有内容</h3>
      <p className="text-sm text-[#635F69] mt-1">
        点击上方图标或拖拽文件到此处上传
      </p>
    </div>
  )
}
