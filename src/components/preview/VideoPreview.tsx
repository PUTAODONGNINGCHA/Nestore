interface VideoPreviewProps {
  src: string
  name: string
}

export function VideoPreview({ src }: VideoPreviewProps) {
  return (
    <div className="flex items-center justify-center">
      <video
        src={src}
        controls
        className="max-w-full max-h-[70vh] rounded-[16px]"
        onError={(e) => {
          const target = e.target as HTMLVideoElement
          target.outerHTML = '<p class="text-[#6B7280] text-center py-8">无法预览此视频</p>'
        }}
      >
        <p>您的浏览器不支持视频播放</p>
      </video>
    </div>
  )
}
