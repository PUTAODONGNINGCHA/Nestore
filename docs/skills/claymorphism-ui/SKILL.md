# Skill: Claymorphism UI 系统

## 描述

软陶风格 UI 系统，基于多层阴影（外凸 + 内凹）模拟 3D 质感，配合渐变、柔和色彩与弹性交互。Tailwind CSS v4 `@theme` 原生定义。

## 设计 Token（src/index.css）

```css
@import "tailwindcss";

/* 禁用暗色模式 — claymorphism 依赖浅色阴影 */
@custom-variant dark (&:where(.never-match-dark));

@theme {
  /* 色彩 */
  --color-clay-canvas: #F4F1FA;
  --color-clay-foreground: #332F3A;
  --color-clay-muted: #635F69;
  --color-clay-accent: #7C3AED;
  --color-clay-accent-light: #A78BFA;
  --color-clay-accent-alt: #DB2777;
  --color-clay-accent-blue: #0EA5E9;
  --color-clay-accent-green: #10B981;
  --color-clay-accent-amber: #F59E0B;
  --color-clay-cardBg: rgba(255, 255, 255, 0.65);
  --color-clay-cardBg-solid: #FFFFFF;

  /* 字体 */
  --font-display: "Nunito", sans-serif;     /* 标题 */
  --font-body: "DM Sans", sans-serif;       /* 正文 */

  /* Claymorphism 4 层阴影系统 */

  /* Surface — 大型容器 */
  --shadow-clay-surface: 30px 30px 60px #cdc6d9, -30px -30px 60px #ffffff,
    inset 10px 10px 20px rgba(139, 92, 246, 0.05),
    inset -10px -10px 20px rgba(255, 255, 255, 0.8);

  /* Card — 浮动卡片 */
  --shadow-clay-card: 16px 16px 32px rgba(160, 150, 180, 0.2),
    -10px -10px 24px rgba(255, 255, 255, 0.9),
    inset 6px 6px 12px rgba(139, 92, 246, 0.03),
    inset -6px -6px 12px rgba(255, 255, 255, 1);

  /* Card Hover — 抬起状态 */
  --shadow-clay-card-hover: 24px 24px 48px rgba(160, 150, 180, 0.25),
    -14px -14px 32px rgba(255, 255, 255, 0.95),
    inset 6px 6px 12px rgba(139, 92, 246, 0.03),
    inset -6px -6px 12px rgba(255, 255, 255, 1);

  /* Button — 高凸起按钮 */
  --shadow-clay-button: 12px 12px 24px rgba(139, 92, 246, 0.3),
    -8px -8px 16px rgba(255, 255, 255, 0.4),
    inset 4px 4px 8px rgba(255, 255, 255, 0.4),
    inset -4px -4px 8px rgba(0, 0, 0, 0.1);

  /* Button Hover */
  --shadow-clay-button-hover: 16px 16px 32px rgba(139, 92, 246, 0.35),
    -10px -10px 20px rgba(255, 255, 255, 0.5);

  /* Pressed — 输入框/按下状态 */
  --shadow-clay-pressed: inset 10px 10px 20px #d9d4e3,
    inset -10px -10px 20px #ffffff;

  /* Pressed Small — 小号按压 */
  --shadow-clay-pressed-sm: inset 6px 6px 12px #d9d4e3,
    inset -6px -6px 12px #ffffff;

  /* 圆角系统 */
  --radius-container: 48px;
  --radius-card: 32px;
  --radius-medium: 24px;
  --radius-base: 20px;
}
```

## 核心组件

### Button

4 种变体：primary（紫色渐变）、secondary（白色）、ghost（透明）、danger（红色渐变）。

```tsx
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
        // primary: 紫色渐变 + 按钮阴影
        variant === 'primary' && 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-[...] hover:-translate-y-1 active:scale-[0.92] active:shadow-[inset_...]',
        // secondary: 白色基底
        variant === 'secondary' && 'bg-white text-[#332F3A] shadow-[...]',
        // danger: 红色渐变
        variant === 'danger' && 'bg-gradient-to-br from-[#F87171] to-[#EF4444] text-white shadow-[...]',
        className
      )}
      {...props}
    />
  )
}
```

### Modal

```tsx
export function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title?: string; children: ReactNode
}) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}>
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col
        bg-white rounded-[32px]
        shadow-[12px_12px_24px_rgba(160,150,180,0.15),-6px_-6px_16px_rgba(255,255,255,0.5)]">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <h2 className="text-lg font-extrabold text-[#332F3A] font-display tracking-tight">
              {title}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-[16px]
                text-[#635F69] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10
                transition-all duration-200">
              <svg ...>X</svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto p-6 scrollbar-thin">{children}</div>
      </div>
    </div>
  )
}
```

### ProgressBar

```tsx
export function ProgressBar({ progress, className = '' }: { progress: number; className?: string }) {
  return (
    <div className={`relative h-3 rounded-full bg-[#EFEBF5]
      shadow-[inset_6px_6px_12px_#d9d4e3,inset_-6px_-6px_12px_#ffffff]
      overflow-hidden ${className}`}>
      <div className="h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED]
        transition-all duration-300 ease-out
        shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
        style={{ width: `${Math.min(progress, 100)}%` }} />
    </div>
  )
}
```

### ContextMenu

```tsx
export function ContextMenu({ isOpen, onClose, position, children }) {
  const ref = useRef<HTMLDivElement>(null)

  // useLayoutEffect 在绘制前定位，避免闪烁
  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    let x = position.x, y = position.y
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 12
    if (y + rect.height > window.innerHeight) y = position.y - rect.height - 8
    if (y < 4) y = 4
    ref.current.style.left = `${x}px`
    ref.current.style.top = `${y}px`
  }, [isOpen, position])

  if (!isOpen) return null

  return (
    <div ref={ref}
      className="fixed z-50 bg-white rounded-[24px]
        shadow-[12px_12px_24px_rgba(160,150,180,0.2),-6px_-6px_16px_rgba(255,255,255,0.5)]
        py-1.5 min-w-[170px]"
      style={{ left: position.x, top: position.y }}>
      {children}
    </div>
  )
}
```

## 背景动画 Blobs

```tsx
<div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
  <div className="absolute h-[40vh] w-[40vh] rounded-full bg-[#8B5CF6]/8 blur-3xl
    -top-[10%] -left-[10%] animate-[clay-float_8s_ease-in-out_infinite] will-change-transform" />
  <div className="absolute h-[35vh] w-[35vh] rounded-full bg-[#EC4899]/8 blur-3xl
    -right-[10%] top-[20%] animate-[clay-float-delayed_10s_ease-in-out_infinite] will-change-transform" />
  <div className="absolute h-[30vh] w-[30vh] rounded-full bg-[#0EA5E9]/8 blur-3xl
    bottom-[10%] left-[30%] animate-[clay-float-slow_12s_ease-in-out_infinite] will-change-transform" />
</div>
```

## 动画 Keyframes

```css
@keyframes clay-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}
@keyframes clay-float-delayed {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-2deg); }
}
@keyframes clay-float-slow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}
@keyframes clay-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
@keyframes clay-spin {
  to { transform: rotate(360deg); }
}
```

## 自定义工具类

```css
/* 弹性缓动 */
@utility clay-bounce {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 滚动条 */
@utility scrollbar-thin {
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(160, 150, 180, 0.3);
    border-radius: 3px;
  }
}

/* 加载 spinner */
@utility clay-spinner {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 3px solid rgba(160, 150, 180, 0.25);
  border-top-color: var(--color-clay-accent);
  animation: clay-spin 0.8s linear infinite;
}
```

## 交互规范

| 状态 | 变换 | 阴影 |
|------|------|------|
| 默认 | — | `--shadow-clay-button` / `--shadow-clay-card` |
| hover | `translateY(-2px ~ -4px)` | 更大外凸阴影（card-hover / button-hover） |
| active | `scale(0.92 ~ 0.96)` | 切换为 `--shadow-clay-pressed` |
| disabled | `opacity-50` | 无阴影 / `shadow-none` |

## 适用元素

| 元素 | 阴影模式 | 圆角 |
|------|----------|------|
| 大容器/卡片区 | `--shadow-clay-surface` | `--radius-container (48px)` |
| 文件卡片 | `--shadow-clay-card` | `--radius-card (32px)` |
| 卡片 hover 抬起 | `--shadow-clay-card-hover` | 同上 |
| 按钮 | `--shadow-clay-button` | `--radius-base (20px)` |
| 输入框 | `--shadow-clay-pressed` | `--radius-medium (24px)` |
| Modal | `clay-card` 外阴影 | `--radius-card (32px)` |

## 性能要点

- `will-change-transform` 加速 blob 动画（避免重绘）
- 按钮只用 `transition-transform duration-150`（阴影切换不动画）
- `prefers-reduced-motion: reduce` → 全部动画静音
- 背景 blob 使用 `pointer-events-none` + `fixed`，不参与布局计算
