import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[16px] font-medium',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3.5 text-base',
        variant === 'primary' && 'bg-[#6C63FF] text-white shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]',
        variant === 'secondary' && 'bg-[#E0E5EC] text-[#3D4852] shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]',
        variant === 'ghost' && 'text-[#6B7280] hover:text-[#3D4852] hover:shadow-[5px_5px_10px_rgb(163_177_198_/_0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]',
        variant === 'danger' && 'bg-[#EF4444] text-white shadow-[9px_9px_16px_rgb(163_177_198_/_0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163_177_198_/_0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[inset_3px_3px_6px_rgb(163_177_198_/_0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]',
        className
      )}
      {...props}
    />
  )
}
