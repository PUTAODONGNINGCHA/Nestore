interface ImagePreviewProps {
  src: string
  name: string
}

export function ImagePreview({ src, name }: ImagePreviewProps) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <img
        src={src}
        alt={name}
        className="max-w-full max-h-[70vh] object-contain rounded-[16px]"
      />
    </div>
  )
}
