# Skill: 卡片拖拽排序

## 描述

基于 @dnd-kit 实现网格卡片拖拽排序，支持全卡片拖拽、延迟触发、排序持久化、文件夹移动等复合语义。

## 依赖

```json
"@dnd-kit/core": "^6.x",
"@dnd-kit/sortable": "^8.x",
"@dnd-kit/utilities": "^8.x"
```

## 核心模式

```tsx
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
```

### 1. Sensor 配置 — 延迟触发防误触

```tsx
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
)
```

`distance: 8` = 指针移动 8px 后才激活拖拽，避免点击被误判为拖拽。

### 2. 卡片组件 — useSortable

```tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableCard({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    // ⚠️ 不加 transition，否则产生 Q 弹动画
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* 卡片内容，拖拽和点击在同一个元素上 */}
    </div>
  )
}
```

**关键**: `transform` 不加 `transition`，否则 drop 时会有回弹动画。

### 3. 排序容器 — DndContext + SortableContext

```tsx
function FileGrid() {
  const [items, setItems] = useState<{ id: string; data: Item }[]>([])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    // 本地重新排序
    const reordered = [...items]
    const [moved] = reordered.splice(oldIndex, 1)
    if (!moved) return
    reordered.splice(newIndex, 0, moved)
    setItems(reordered)

    // 持久化到 API
    try {
      await api.updateSortOrder(reordered.map((item, i) => ({
        id: item.data.id,
        sort_order: i,
      })))
    } catch {
      // 失败时从 API 刷新恢复
      refresh()
    }
  }, [items, refresh])

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <SortableCard key={item.id} id={item.id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

### 4. 同步 items 源

items 从 API（folders + files 合并）同步：

```tsx
useEffect(() => {
  const merged = [
    ...folders.map((f) => ({ id: `folder-${f.id}`, data: f })),
    ...files.map((f) => ({ id: `file-${f.id}`, data: f })),
  ]
  setItems(merged)
}, [folders, files])
```

### 5. 类型安全的 Sort ID

```tsx
type Entry = { type: 'folder'; data: Folder } | { type: 'file'; data: FileItem }
function getSortId(entry: Entry) {
  return entry.type === 'folder' ? `folder-${entry.data.id}` : `file-${entry.data.id}`
}
```

## 进阶：拖拽到文件夹（移动语义）

检测拖拽经过文件夹时切换为移动而非排序：

```tsx
const handleDragEnd = async (event: DragEndEvent) => {
  const overId = String(event.over?.id || '')
  if (overId.startsWith('folder-')) {
    // 执行移动操作
    await moveItem(itemId, targetFolderId)
    return
  }
  // 否则执行排序
}
```

## 注意事项

- `touch-none` 阻止移动端滚动干扰拖拽
- `select-none` 阻止拖拽时选中文字
- `useSortable` 的 `listeners` 自带 `onPointerDown`，不要额外绑定拖拽事件
- 本地先应用排序再调用 API → 体验流畅；API 失败时回退刷新
