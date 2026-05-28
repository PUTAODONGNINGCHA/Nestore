interface TextPreviewProps {
  content: string
}

export function TextPreview({ content }: TextPreviewProps) {
  return (
    <pre className="bg-[#E0E5EC] dark:bg-[#1a1d23] rounded-[16px] p-4 overflow-auto max-h-[70vh] text-sm font-mono text-[#3D4852] dark:text-[#E8ECF1] whitespace-pre-wrap shadow-[inset_6px_6px_10px_rgb(163_177_198_/_0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] dark:shadow-[inset_6px_6px_10px_rgb(0_0_0_/_0.4),inset_-6px_-6px_10px_rgba(255,255,255,0.05)] scrollbar-thin">
      {content}
    </pre>
  )
}
