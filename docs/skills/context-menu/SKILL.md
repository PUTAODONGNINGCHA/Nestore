# Skill: 右键/长按上下文菜单

## 描述

PC 右键 + 移动端长按触发上下文菜单，`useLayoutEffect` 同步定位防闪烁，自动翻转防溢出。

## 核心思路

- PC: `onContextMenu` (右键)
- 移动端: 500ms `touchstart` 定时器
- 定位: `useLayoutEffect` 读取菜单尺寸后调整坐标

## 菜单组件

```tsx
import { useLayoutEffect, useRef, type ReactNode } from 'react'

export function ContextMenu({ isOpen, onClose, position, children }: {
  isOpen: boolean
  onClose: () => void
  position: { x: number; y: number }
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  // 同步定位 — 在浏览器绘制前调整坐标
  useLayoutEffect(() => {
    if (!isOpen || !ref.current) return
    const menu = ref.current
    const rect = menu.getBoundingClientRect()
    let x = position.x
    let y = position.y

    // 右侧溢出 → 向左翻转
    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 12
    }
    // 底部溢出 → 向上弹出
    if (y + rect.height > window.innerHeight) {
      y = position.y - rect.height - 8
    }
    if (y < 4) y = 4

    menu.style.left = `${x}px`
    menu.style.top = `${y}px`
  }, [isOpen, position])

  // 点击外部关闭
  useLayoutEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div ref={ref} className="fixed z-50 bg-white rounded-[24px] shadow-lg py-1.5 min-w-[170px]"
      style={{ left: position.x, top: position.y }}>
      {children}
    </div>
  )
}

export function ContextMenuItem({ children, onClick, danger }: {
  children: ReactNode; onClick: () => void; danger?: boolean
}) {
  return (
    <button className={`w-full text-left px-4 py-2.5 text-sm font-bold ${
      danger ? 'text-red-500 hover:bg-red-50' : 'hover:bg-gray-100'
    }`} onClick={onClick}>
      {children}
    </button>
  )
}
```

## 卡片中集成

```tsx
function Card({ item }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showMenu = (x: number, y: number) => {
    setMenuPos({ x, y })
    setMenuOpen(true)
  }

  // PC 右键
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showMenu(e.clientX, e.clientY)
  }

  // 移动端长按 500ms
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    longPressTimer.current = setTimeout(() => {
      showMenu(touch.clientX, touch.clientY)
    }, 500)
  }
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }
  const handleTouchMove = handleTouchEnd  // 滑动取消

  return (
    <div onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}>
      {/* 卡片内容 */}
      <ContextMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} position={menuPos}>
        <ContextMenuItem onClick={...}>操作项</ContextMenuItem>
        <ContextMenuItem onClick={...} danger>删除</ContextMenuItem>
      </ContextMenu>
    </div>
  )
}
```

## 注意事项

- **不要用 `useState` + `useEffect` 定位**，菜单会先渲染在 (0,0) 再跳动到目标位置
- `useLayoutEffect` 在浏览器绘制前执行，避免闪烁
- `React.TouchEvent.touches` 可能为 undefined，需判空
- `clearTimeout` 前检查 timer 是否 null
- 长按与点击冲突：`handleTouchEnd` 不清除 timer 则短按也会触发的，所以设 500ms 延迟
