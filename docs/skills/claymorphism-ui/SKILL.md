# Skill: Claymorphism UI 系统

## 描述

软陶风格 UI 系统，基于 2 层阴影（外凸 + 内凹）模拟 3D 质感，配合渐变、柔和色彩与弹性交互。

## 设计 Token（Tailwind CSS v4 `@theme`）

```css
@import "tailwindcss";

/* 禁用暗色模式 */
@custom-variant dark (&:where(.never-match-dark));

@theme {
  /* 色彩 */
  --color-clay-canvas: #F4F1FA;
  --color-clay-foreground: #332F3A;
  --color-clay-muted: #635F69;
  --color-clay-accent: #7C3AED;
  --color-clay-accent-light: #A78BFA;

  /* 字体 */
  --font-display: "Nunito", sans-serif;
  --font-body: "DM Sans", sans-serif;

  /* 2 层外凸阴影 (浮起) */
  --shadow-clay-card: 16px 16px 32px rgba(160, 150, 180, 0.2),
    -10px -10px 24px rgba(255, 255, 255, 0.9);

  /* 2 层内凹阴影 (按下/输入框) */
  --shadow-clay-pressed: inset 10px 10px 20px #d9d4e3,
    inset -10px -10px 20px #ffffff;

  /* 按钮阴影 (含内层高光) */
  --shadow-clay-button: 12px 12px 24px rgba(139, 92, 246, 0.3),
    -8px -8px 16px rgba(255, 255, 255, 0.4),
    inset 4px 4px 8px rgba(255, 255, 255, 0.4),
    inset -4px -4px 8px rgba(0, 0, 0, 0.1);
}
```

## 核心组件

### Button

```tsx
function Button({ variant = 'primary', size = 'md', ...props }) {
  return (
    <button className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-[20px] font-bold tracking-wide',
      'transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7C3AED]/30',
      size === 'sm' && 'h-11 px-5 text-sm',
      size === 'md' && 'h-14 px-7 text-base',
      size === 'lg' && 'h-16 px-10 text-lg',
      // primary: 紫色渐变 + 按钮阴影
      variant === 'primary' && 'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-[...] hover:-translate-y-1 active:scale-[0.92] active:shadow-[inset_...]',
      // secondary: 白色基底
      variant === 'secondary' && 'bg-white text-[#332F3A] shadow-[...]',
      // danger: 红色渐变
      variant === 'danger' && 'bg-gradient-to-br from-[#F87171] to-[#EF4444] text-white shadow-[...]',
    )} {...props} />
  )
}
```

### Animated Background Blobs

```tsx
<div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
  <div className="absolute h-[40vh] w-[40vh] rounded-full bg-[#8B5CF6]/8 blur-3xl -top-[10%] -left-[10%] animate-[clay-float_8s_ease-in-out_infinite] will-change-transform" />
  <div className="absolute h-[35vh] w-[35vh] rounded-full bg-[#EC4899]/8 blur-3xl -right-[10%] top-[20%] animate-[clay-float-delayed_10s_ease-in-out_infinite] will-change-transform" />
  <div className="absolute h-[30vh] w-[30vh] rounded-full bg-[#0EA5E9]/8 blur-3xl bottom-[10%] left-[30%] animate-[clay-float-slow_12s_ease-in-out_infinite] will-change-transform" />
</div>
```

### 动画 Keyframes

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
@keyframes clay-spin {
  to { transform: rotate(360deg); }
}

/* 尾原子工具类 */
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
| 默认 | — | `--shadow-clay-button` |
| hover | `translateY(-2px)` | 更大外凸阴影 |
| active | `scale(0.92)` | 切换为 `--shadow-clay-pressed` |
| disabled | `opacity-50` | 无阴影 |

## 性能要点

- `will-change-transform` 加速 blob 动画（避免重绘）
- 按钮只用 `transition-transform duration-150`（不要 `transition-all`，阴影切换不动画）
- `prefers-reduced-motion: reduce` → 全部动画静音
