# 家庭云盘 — 实施计划

## Context

需求讨论已完成（见 `docs/project-spec/discussions/2026-05-27-需求讨论.md`）。用户需要一个**面向家庭（2-3人）的个人云盘**，通过浏览器访问，设一个共享密码即可登录，无需多用户注册。所有家庭成员登录后都能上传、下载、管理文件。

**核心决策**：
- 单密码共享模式（非多用户），使用 Supabase Auth 单账号
- 后续需要支持存储后端迁移（适配器模式）
- P0 功能优先：登录 → 文件浏览 → 上传/下载 → 预览 → 管理

---

## 架构概览

```
┌──────────────────────────────────────────────────┐
│               Frontend (Vite)                      │
│  React 19 + TypeScript + Tailwind CSS v4           │
│                                                    │
│  LoginPage (单密码)                                 │
│       ↓ 认证成功                                    │
│  MainLayout                                        │
│   ├── Sidebar — 文件夹树导航                        │
│   ├── FileBrowser — 文件列表/网格 + 面包屑          │
│   ├── FileUploader — 拖拽/点击上传                  │
│   └── FilePreview — 图片/视频/PDF 预览弹窗          │
└──────────────┬───────────────────────────────────┘
               │ supabase-js SDK
               ▼
┌──────────────────────────────────────────────────┐
│               Supabase Backend                     │
│                                                    │
│  Auth       → 1 个共享账号（email: family@xxx）     │
│  PostgreSQL → files + folders 表                   │
│  Storage    → family-files 私有桶                   │
│  RLS        → owner_id = auth.uid() 策略           │
└──────────────────────────────────────────────────┘
```

---

## 认证方案

使用 **Supabase Auth 单用户模式**：
1. 在 Supabase 后台创建一个用户（如 `family@your-domain.com`）
2. 登录页面只显示一个密码输入框（邮箱地址硬编码在代码中）
3. 用户输入共享密码 → Supabase Auth 验证 → 进入主界面
4. 所有文件归该用户所有，RLS 策略基于 `owner_id = auth.uid()`

---

## 数据库 Schema

见 `docs/project-spec/requirements.md` 中的完整 DDL。核心表：

- **folders**: `id, name, parent_id, path(物化路径), owner_id, created_at, updated_at`
- **files**: `id, name, mime_type, size, storage_path, folder_id, owner_id, created_at, updated_at`

**文件夹树实现**：邻接表（`parent_id`）+ 物化路径（`path` 列，通过触发器自动维护）

**存储路径**：`{owner_id}/{folder_id}/{file_id}.{ext}`

---

## 组件树

```
src/
├── App.tsx                         # 路由：LoginPage ↔ MainLayout
├── main.tsx                        # 入口
├── index.css                       # Tailwind + 全局样式
│
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx           # 单密码登录页
│   ├── layout/
│   │   ├── MainLayout.tsx          # 主布局（顶部栏 + 侧边栏 + 内容区）
│   │   └── Sidebar.tsx             # 文件夹树导航
│   ├── file-browser/
│   │   ├── FileList.tsx            # 文件列表/网格视图
│   │   ├── FileItem.tsx            # 单个文件/文件夹卡片
│   │   ├── Breadcrumb.tsx          # 面包屑路径
│   │   └── EmptyState.tsx          # 空状态提示
│   ├── upload/
│   │   └── FileUploader.tsx        # 拖拽上传区域
│   ├── preview/
│   │   ├── FilePreview.tsx         # 预览弹窗容器
│   │   ├── ImagePreview.tsx        # 图片预览
│   │   ├── VideoPreview.tsx        # 视频预览
│   │   └── TextPreview.tsx         # 文本/代码预览
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── ContextMenu.tsx
│       └── ProgressBar.tsx
│
├── hooks/
│   ├── useAuth.ts                  # 认证状态、登录/登出
│   ├── useFiles.ts                 # 文件 CRUD（增删改查）
│   ├── useFolders.ts               # 文件夹 CRUD
│   ├── useUpload.ts                # 文件上传（含进度）
│   └── useBreadcrumbs.ts           # 面包屑数据
│
├── lib/
│   ├── supabase.ts                 # Supabase 客户端初始化
│   └── utils.ts                    # 格式化、类型守卫等
│
├── storage/
│   ├── types.ts                    # StorageAdapter 接口定义
│   ├── supabase-adapter.ts         # Supabase 实现
│   └── factory.ts                  # 适配器工厂
│
└── types/
    └── index.ts                    # 公共类型定义
```

---

## 实施步骤（按开发顺序）

### Step 1: 项目脚手架
初始化 Vite + React + TypeScript 项目，配置 Tailwind CSS，安装依赖（supabase-js, react-dropzone, react-router-dom, @tanstack/react-query），初始化 Git 仓库。

### Step 2: Supabase 项目初始化
创建 Supabase 项目，执行 DDL 建表，配置 Storage 桶（`family-files` 私有桶），设置 RLS 策略，创建共享 Auth 账号。

### Step 3: 认证模块
实现 `LoginPage.tsx` + `useAuth.ts` — 单密码登录页，登录成功后跳转到主界面。

### Step 4: 布局框架
实现 `MainLayout.tsx` + `Sidebar.tsx` — 顶部栏（当前路径、上传按钮、登出）、侧边栏（文件夹树）、主内容区。

### Step 5: 文件夹系统
实现 `useFolders.ts` — 创建文件夹、加载子文件夹、面包屑导航。

### Step 6: 文件系统
实现 `useFiles.ts` + `FileList.tsx` + `FileItem.tsx` — 加载文件列表、文件重命名、删除。

### Step 7: 文件上传
实现 `useUpload.ts` + `FileUploader.tsx` — 拖拽上传、选择文件、进度显示。

### Step 8: 文件下载
在 `FileItem.tsx` 中添加下载功能 — 点击文件生成签名 URL 并触发下载。

### Step 9: 文件预览
实现 `FilePreview.tsx` + 各子预览组件 — 图片、视频、文本预览支持。

### Step 10: 存储适配器
创建 `storage/` 目录下的适配器接口和 Supabase 实现，确保所有数据操作通过适配器进行。

---

## 关键设计决策

### 1. 文件夹树：邻接表 + 物化路径
- `parent_id` 实现层级关系（方便插入/移动）
- `path` 列通过触发器自动维护（方便查询祖先/后代）
- 优点：插入快（O(1)），查询子树快（B-tree 索引 O(log n)）

### 2. 文件预览策略
- 图片/视频：通过 Supabase `createSignedUrl()` 获取临时访问链接
- 文本/代码：直接下载内容后在前端渲染
- PDF：使用 iframe 嵌入签名 URL
- 对不支持的类型，显示下载按钮

### 3. 存储抽象
- 所有文件操作通过 `StorageAdapter` 接口
- 第一版只实现 `SupabaseAdapter`
- 后续迁移只需新增一个适配器类（如 `S3Adapter`）
- 适配器接口定义在 `storage/types.ts`

### 4. 状态管理
- 使用 `@tanstack/react-query` 管理服务端状态（缓存、重试、loading 状态）
- 文件/文件夹列表使用 query key 为 `['files', folderId]` 的模式
- 突变后自动 invalidate 相关 query

---

## 关键依赖

| 包 | 用途 |
|----|------|
| `@supabase/supabase-js` | Supabase 客户端 |
| `react-router-dom` | 路由（登录页 vs 主界面） |
| `@tanstack/react-query` | 服务端状态管理 |
| `react-dropzone` | 拖拽上传 |
| `tailwindcss` | 样式 |
| `lucide-react` | 图标库 |
| `date-fns` | 日期格式化 |

---

## 验证方案

1. **本地验证**：
   - `npm run dev` 启动开发服务器
   - 测试登录流程（输入密码是否能正常进入）
   - 测试文件上传（拖拽 + 点击选择）
   - 测试文件下载（点击文件）
   - 测试文件预览（图片、视频、文本）
   - 测试文件夹 CRUD（新建、重命名、删除）
   - 测试响应式布局（缩放浏览器窗口）

2. **Supabase 验证**：
   - 检查 PostgreSQL 表数据是否正确
   - 检查 Storage 文件是否正常存储
   - 验证 RLS 策略是否阻止未认证访问

3. **部署验证**：
   - 部署到 Vercel/Netlify
   - 端到端测试所有 P0 功能

---

## 后续扩展（P1/P2）

- **P1**: PDF 预览、文件搜索、文件排序、深色模式
- **P2**: 多文件打包下载、回收站、存储用量统计、存储后端迁移
