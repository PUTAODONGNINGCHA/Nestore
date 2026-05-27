interface TextPreviewProps {
  content: string
}

export function TextPreview({ content }: TextPreviewProps) {
  return (
    <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-auto max-h-[70vh] text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
      {content}
    </pre>
  )
}
