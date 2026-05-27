import { Upload } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Upload className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 dark:text-white">此文件夹为空</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        拖拽文件到此处或点击上方按钮上传
      </p>
    </div>
  )
}
