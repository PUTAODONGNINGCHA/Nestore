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
        'inline-flex items-center justify-center gap-2 rounded-[20px] font-bold tracking-wide',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1FA]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        size === 'sm' && 'h-11 px-5 text-sm',
        size === 'md' && 'h-14 px-7 text-base',
        size === 'lg' && 'h-16 px-10 text-lg',
        variant === 'primary' && 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-[12px_12px_24px_rgba(139,92,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[16px_16px_32px_rgba(139,92,246,0.35),-10px_-10px_20px_rgba(255,255,255,0.5)] active:scale-[0.92] active:shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff]',
        variant === 'secondary' && 'bg-white text-[#332F3A] shadow-[12px_12px_24px_rgba(139,92,246,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[16px_16px_32px_rgba(139,92,246,0.35),-10px_-10px_20px_rgba(255,255,255,0.5)] active:scale-[0.92] active:shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff]',
        variant === 'ghost' && 'text-[#635F69] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10',
        variant === 'danger' && 'bg-gradient-to-br from-[#F87171] to-[#EF4444] text-white shadow-[12px_12px_24px_rgba(239,68,68,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[16px_16px_32px_rgba(239,68,68,0.35),-10px_-10px_20px_rgba(255,255,255,0.5)] active:scale-[0.92] active:shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff]',
        className
      )}
      {...props}
    />
  )
}
