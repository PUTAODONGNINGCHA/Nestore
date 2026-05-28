import { Upload } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-[32px] bg-[#E0E5EC] dark:bg-[#1a1d23] shadow-[inset_10px_10px_20px_rgb(163_177_198_/_0.7),inset_-10px_-10px_20px_rgba(255,255,255,0.6)] dark:shadow-[inset_10px_10px_20px_rgb(0_0_0_/_0.5),inset_-10px_-10px_20px_rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
        <Upload className="w-8 h-8 text-[#6C63FF]" />
      </div>
      <h3 className="text-base font-bold text-[#3D4852] dark:text-[#E8ECF1] font-display">此文件夹为空</h3>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
        拖拽文件到此处或点击上方按钮上传
      </p>
    </div>
  )
}
