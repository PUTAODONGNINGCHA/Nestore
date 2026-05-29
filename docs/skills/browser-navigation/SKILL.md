# Skill: 浏览器导航集成

## 描述

利用 History API（`pushState` / `popstate` / `replaceState`）实现浏览器前进/后退按钮对文件夹导航和文件预览的支持，两类状态互不干扰。

## 核心架构

使用两个不同的 state key 区分导航和预览：

| State Key | 用途 | 触发行为 |
|-----------|------|----------|
| `folderId` | 文件夹导航 | `popstate` 时 `setCurrentFolderId` 切换目录 |
| `previewFile` | 文件预览 | `popstate` 时关闭预览 Modal |

## 文件夹导航

### App.tsx — 全局 popstate 监听

```tsx
useEffect(() => {
  // 初始化根目录 state
  window.history.replaceState({ folderId: null }, '')
  const handlePopState = (e: PopStateEvent) => {
    // ⚠️ 直接用 e.state?.folderId，不要和 currentFolderId 比较
    //（闭包捕获的是旧值，比较会导致根目录导航失效）
    setCurrentFolderId(e.state?.folderId ?? null)
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])
```

### 导航时 pushState

```tsx
const handleNavigate = useCallback((folderId: string | null) => {
  setCurrentFolderId(folderId)
  window.history.pushState({ folderId }, '')
}, [])
```

**关键**：
- `popstate` 中直接使用 `e.state`，不依赖闭包中的 `currentFolderId` 做判断
- `handleNavigate` 同时更新 React state 和浏览器历史栈
- 进入子文件夹 `pushState`，点后退 `popstate` 退回到上一级

## 文件夹过渡动画（防止空状态闪烁）

导航切换时，如果直接 `setOrderedItems([])` 会导致 EmptyState "还没有内容" 一闪而过：

```tsx
const [isNavigating, setIsNavigating] = useState(false)
const prevFolderRef = useRef(currentFolderId)

// useLayoutEffect 在浏览器绘制前同步触发，不闪烁
useLayoutEffect(() => {
  if (prevFolderRef.current !== currentFolderId) {
    setIsNavigating(true)
    prevFolderRef.current = currentFolderId
  }
}, [currentFolderId])

// 数据就绪时清除导航状态
useEffect(() => {
  const items = [...folders.map(...), ...files.map(...)]
  setOrderedItems(items)
  if (isNavigating) setIsNavigating(false)
}, [folders, files])
```

渲染时：

```tsx
{isLoading || isNavigating ? (
  <div className="flex items-center justify-center py-16">
    <div className="clay-spinner" />
  </div>
) : orderedItems.length === 0 ? (
  <EmptyState onUploadClick={...} />
) : (
  // 文件网格
)}
```

## 文件预览关闭

### FileList.tsx — 预览 popstate

```tsx
const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

// 打开预览时 pushState
const openPreview = (file: FileItem) => {
  if (isMobile) {
    // 移动端直接新标签页
    getStorageAdapter().getDownloadUrl(file.storage_path)
      .then(url => window.open(url, '_blank'))
  } else {
    setPreviewFile(file)
    window.history.pushState({ previewFile: true }, '')
  }
}

// popstate 关闭预览（不触发文件夹导航）
useEffect(() => {
  const handlePopState = () => {
    if (previewFile) setPreviewFile(null)
  }
  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [previewFile])
```

## 为什么不会冲突？

浏览器历史栈中的记录可能是 `{folderId: "xxx"}` 或 `{previewFile: true}`，但两者的 `popstate` 监听器是独立注册的：

- App.tsx 的监听器只看 `e.state?.folderId`，`previewFile` 的记录会返回 `null` → 回到当前文件夹（无变化）
- FileList.tsx 的监听器只在 `previewFile` 非空时关闭预览，不会影响 `currentFolderId`

**流程图**：

```
用户操作                history stack                        popstate 行为
──────────────────────────────────────────────────────────────────────────
进入文件夹A     → pushState({folderId: A})                    —
打开预览        → pushState({previewFile: true})              —
点浏览器后退    → popstate → state={folderId: A}              App: setCurrentFolderId(A)（无变化）
                                                              FileList: 关闭预览 ✓
再点后退        → popstate → state={folderId: null}           App: 回到根目录 ✓
```

## 注意事项

- **不要**在 `popstate` 中用 `currentFolderId` 做 if 判断（闭包 stale closure 问题）
- 预览和导航的 `state` key 必须不同，否则混淆
- `replaceState({folderId: null})` 初始化确保根目录也有历史记录
- 组件卸载时务必 `removeEventListener`
