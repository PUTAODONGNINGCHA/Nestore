# Nestore — 个人云盘共享平台

> 面向家庭成员的个人云盘，通过共享密码访问。支持文件上传、下载、在线预览、文件夹管理、文件搜索等功能。

![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![Supabase](https://img.shields.io/badge/Supabase-2.49-3ECF8E?logo=supabase) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [功能列表](#功能列表)
- [项目架构](#项目架构)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [数据库设计](#数据库设计)
- [存储策略](#存储策略)
- [核心功能说明](#核心功能说明)
- [浏览器兼容性](#浏览器兼容性)
- [Supabase 免费版限制](#supabase-免费版限制)
- [许可](#许可)

---

## 项目概述

Nestore 是一个面向家庭成员的个人云盘共享平台，通过浏览器访问。所有用户使用统一的共享密码登录，无需单独注册账号，降低了使用门槛。

### 目标

- 为家庭提供安全、便捷的文件共享空间
- 操作简单，任何人（包括不熟悉技术的家人）都能轻松使用
- 成本可控，基于 Supabase 免费版运行

### 非目标

- ❌ 不提供公开分享功能
- ❌ 不提供多用户独立空间
- ❌ 不提供在线编辑功能

---

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **框架** | React | 19.1 | UI 组件库 |
| **语言** | TypeScript | 5.8 | 类型安全 |
| **构建工具** | Vite | 6.3 | 开发服务器与构建打包 |
| **样式** | Tailwind CSS | 4.1 | Utility-first CSS |
| **后端** | Supabase | 2.49 | BaaS（Auth + PostgreSQL + Storage） |
| **PDF 渲染** | pdfjs-dist | 5.7 | 浏览器端 PDF 画布渲染 |
| **拖拽排序** | @dnd-kit | 6.3 | 文件卡片拖拽排序 |
| **文件上传** | react-dropzone | 14.3 | 拖拽上传交互 |
| **图标** | lucide-react | 0.487 | 图标库 |
| **日期处理** | date-fns | 4.1 | 日期格式化 |
| **压缩打包** | JSZip | 3.10 | 文件夹打包下载 |
| **路由** | react-router-dom | 7.5 | 路由管理 |

---

## 功能列表

### P0 — 核心功能（已实现）

| 功能 | 状态 | 说明 |
|------|------|------|
| 密码登录 | 已完成 | 统一登录页面，Supabase Auth 单用户 |
| 文件列表与网格视图 | 已完成 | 响应式网格（2~6 列自适应） |
| 文件夹导航（面包屑） | 已完成 | 面包屑路径 + 浏览器前进/后退 |
| 文件上传（拖拽+点击） | 已完成 | react-dropzone，移动端点击上传 |
| 文件下载 | 已完成 | 签名 URL 即时生成 |
| 文件夹 CRUD | 已完成 | 新建/重命名/删除 |
| 文件 CRUD | 已完成 | 重命名/删除/移动 |
| 图片预览 | 已完成 | 签名 URL + `<img>` 懒加载 |
| 视频预览 | 已完成 | 原生 `<video>` 标签 |
| 响应式布局 | 已完成 | 手机、平板、电脑全适配 |

### P1 — 增强功能（已实现）

| 功能 | 状态 | 说明 |
|------|------|------|
| PDF 预览 | 已完成 | 桌面端 pdf.js canvas 渲染，移动端 Safari 原生查看器 |
| Office 文档预览 | 已完成 | Microsoft Office Online Viewer |
| 文本预览 | 已完成 | `<pre>` 滚动查看 |
| 文件搜索 | 已完成 | 全量搜索 + 路径导航 |
| 文件排序（拖拽） | 已完成 | 拖拽排序，持久化到数据库 |
| 右键/长按菜单 | 已完成 | 桌面右键 + 移动端长按 500ms |
| 文件夹打包下载 | 已完成 | JSZip 打包为 ZIP |

### P2 — 待开发

| 功能 | 状态 | 说明 |
|------|------|------|
| 存储迁移能力 | 已完成 | Adapter 模式（Supabase / S3 / MinIO） |
| 多文件选择下载 | 待开发 | 批量勾选文件后打包 |
| 最近文件 | 待开发 | 展示最近操作的文件 |
| 深色模式 | 待开发 | 深色/浅色主题切换 |
| 回收站 | 待开发 | 删除暂存，可恢复 |

---

## 项目架构

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Vite)                       │
│                                                          │
│   App.tsx ← 入口，路由调度，全局状态                       │
│     │                                                     │
│     ├─ LoginPage ──────────── 共享密码登录                 │
│     │                                                     │
│     └─ MainLayout ─────────── 主布局（header + 内容区）     │
│          │                                                │
│          └─ FileList ───────── 文件浏览核心                 │
│               ├─ Breadcrumb ── 面包屑导航                  │
│               ├─ FileUploader ─ 拖拽/点击上传              │
│               ├─ FileItemGrid ─ 文件卡片网格 + 拖拽排序     │
│               │    ├─ ContextMenu ─ 右键/长按菜单          │
│               │    └─ Thumbnail ── 缩略图                  │
│               ├─ EmptyState ─── 空目录提示                 │
│               ├─ FilePreview ── 预览弹窗（MIME 分发）      │
│               │    ├─ ImagePreview ─ 图片                  │
│               │    ├─ VideoPreview ─ 视频                  │
│               │    ├─ PdfPreview ─── PDF (pdf.js)          │
│               │    └─ TextPreview ── 文本                  │
│               ├─ SearchDialog ─ 全量搜索对话框             │
│               └─ MoveFileDialog ─ 移动文件/文件夹对话框    │
│                                                          │
│   Hooks                                                  │
│   ├─ useAuth ──────────── 认证状态管理                    │
│   ├─ useFiles ─────────── 文件 CRUD                       │
│   ├─ useFolders ───────── 文件夹 CRUD                     │
│   ├─ useUpload ────────── 上传逻辑与进度                  │
│   └─ useBreadcrumbs ───── 面包屑路径                     │
│                                                          │
└──────────────┬──────────────────────────────────────────┘
               │  StorageAdapter 接口
               ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Backend                        │
│                                                          │
│   Auth ──────── Supabase Auth（邮箱+密码单用户）          │
│   Database ──── PostgreSQL（文件/文件夹元数据）           │
│   Storage ───── 私有桶 family-files（文件内容）            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 架构要点

- **单页应用**：React SPA，Vite 构建，部署为静态站点
- **接口抽象**：`StorageAdapter` 接口解耦业务与存储后端，支持切换实现
- **工厂模式**：`getStorageAdapter()` 单例工厂，目前提供 Supabase 实现
- **签名 URL**：文件存储于私有桶，每次访问生成 1 小时有效签名 URL
- **MIME 分发**：FilePreview 根据 MIME 类型自动选择预览组件
- **平台自适应**：移动端跳过 Modal，直接新标签页打开文件

---

## 目录结构

```
├── .env.example                # 环境变量模板
├── index.html                  # HTML 入口
├── package.json                # 依赖与脚本
├── vite.config.ts              # Vite 配置（路径别名 @/）
├── tsconfig.json               # TypeScript 严格模式配置
│
├── src/
│   ├── main.tsx                # 入口（含 Safari polyfill）
│   ├── App.tsx                 # 应用根组件，路由与全局状态
│   ├── index.css               # Tailwind + 主题变量 + 动画
│   │
│   ├── types/
│   │   └── index.ts            # Folder, FileItem, FileEntry 类型
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase 客户端初始化
│   │   └── utils.ts            # formatFileSize, getFileIcon, cn 等工具
│   │
│   ├── storage/                # 存储适配器层
│   │   ├── types.ts            # StorageAdapter 接口定义
│   │   ├── supabase-adapter.ts # Supabase 实现
│   │   └── factory.ts          # 工厂模式单例
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # 认证状态管理
│   │   ├── useFiles.ts         # 文件 CRUD + 缓存更新
│   │   ├── useFolders.ts       # 文件夹 CRUD + 缓存更新
│   │   ├── useUpload.ts        # 上传进度管理
│   │   └── useBreadcrumbs.ts   # 面包屑路径加载
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx   # 全局错误边界
│   │   │
│   │   ├── auth/
│   │   │   └── LoginPage.tsx   # 共享密码登录页
│   │   │
│   │   ├── layout/
│   │   │   └── MainLayout.tsx  # 主布局（header + 背景动画 + 内容）
│   │   │
│   │   ├── file-browser/
│   │   │   ├── FileList.tsx        # 文件列表主组件（拖拽/上传/导航）
│   │   │   ├── FileItemGrid.tsx    # 文件卡片（含缩略图、排序、菜单）
│   │   │   ├── Breadcrumb.tsx      # 面包屑导航
│   │   │   ├── EmptyState.tsx      # 空目录占位
│   │   │   ├── SearchDialog.tsx    # 全量搜索对话框
│   │   │   └── MoveFileDialog.tsx  # 移动文件/文件夹对话框
│   │   │
│   │   ├── preview/
│   │   │   ├── FilePreview.tsx     # 预览调度（MIME 分发）
│   │   │   ├── ImagePreview.tsx    # 图片懒加载预览
│   │   │   ├── VideoPreview.tsx    # 视频播放
│   │   │   ├── PdfPreview.tsx      # PDF canvas 渲染
│   │   │   └── TextPreview.tsx     # 文本展示
│   │   │
│   │   ├── upload/
│   │   │   └── FileUploader.tsx    # 拖拽上传区域
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx        # Claymorphism 按钮（primary/secondary/danger）
│   │       ├── Modal.tsx         # 通用弹窗（ESC/背景点击关闭）
│   │       ├── ContextMenu.tsx   # 右键/长按上下文菜单
│   │       └── ProgressBar.tsx   # 上传进度条
│   │
│   └── assets/                    # 静态资源
│
├── docs/
│   ├── README.md                  # 本文件
│   ├── project-spec/
│   │   ├── requirements.md        # 详细需求文档
│   │   └── discussions/           # 讨论记录
│   ├── skills/                    # 可复用 Skill 文档
│   │   ├── card-drag-sort/SKILL.md
│   │   ├── context-menu/SKILL.md
│   │   ├── claymorphism-ui/SKILL.md
│   │   ├── storage-adapter/SKILL.md
│   │   └── file-preview/SKILL.md
│   └── claude-md-template.md
│
└── .claude/
    └── CLAUDE.md                   # AI 辅助配置
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9
- 一个 Supabase 项目（免费版即可）

### 安装

```bash
# 克隆仓库
git clone git@github.com:PUTAODONGNINGCHA/Nestore.git
cd Nestore

# 安装依赖
npm install

# 复制环境变量模板并填写
cp .env.example .env
```

### 环境变量

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FAMILY_EMAIL=family@your-domain.com
```

| 变量 | 说明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL（Settings → API） |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥（Settings → API） |
| `VITE_FAMILY_EMAIL` | 用于登录的邮箱地址，与 Supabase Auth 用户一致 |

### 数据库初始化

在 Supabase SQL Editor 中执行：

```sql
-- 文件夹表（邻接表 + 物化路径）
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '',
  owner_id UUID NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件表
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime_type TEXT DEFAULT '',
  size BIGINT DEFAULT 0,
  storage_path TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建存储桶
-- 在 Supabase Dashboard → Storage → Create bucket
-- 桶名: family-files
-- 类型: Private
```

### 开发

```bash
npm run dev
```

打开 http://localhost:5173 即可访问。

### 构建生产版本

```bash
npm run build
npm run preview
```

生产构建默认部署路径为 `/Nestore/`（可在 `vite.config.ts` 中修改 `base`）。

---

## 数据库设计

### folders（文件夹表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| name | TEXT | 文件夹名称 |
| parent_id | UUID? | 父文件夹 ID（CASCADE 删除） |
| path | TEXT | 物化路径，如 `root.uuid.child-uuid` |
| owner_id | UUID | 所有者 ID（固定为共享用户） |
| sort_order | INTEGER | 排序权重 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### files（文件表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，自动生成 |
| name | TEXT | 文件名 |
| mime_type | TEXT | MIME 类型 |
| size | BIGINT | 文件大小（字节） |
| storage_path | TEXT | Supabase Storage 路径 |
| folder_id | UUID? | 所属文件夹 ID（CASCADE 删除） |
| owner_id | UUID | 所有者 ID |
| sort_order | INTEGER | 排序权重 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

---

## 存储策略

- **存储桶**: `family-files`（私有桶）
- **路径约定**: `{ownerId}/{folderId}/{fileId}-{safeName}`
- **访问方式**: 通过签名 URL（`createSignedUrl`），有效期 1 小时
- **文件名消毒**: 特殊字符替换为 `_`，避免存储路径冲突

### StorageAdapter 接口

所有存储操作通过 `StorageAdapter` 接口抽象，当前实现为 `SupabaseAdapter`：

```typescript
export interface StorageAdapter {
  signIn(password: string): Promise<string>
  signOut(): Promise<void>
  getSession(): Promise<string | null>
  getFolders(parentId: string | null): Promise<Folder[]>
  getAllFolders(): Promise<Folder[]>
  createFolder(name: string, parentId: string | null): Promise<Folder>
  // ...
}
```

切换存储后端只需新建实现类并在 `factory.ts` 中替换。

---

## 核心功能说明

### 文件预览

按 MIME 类型自动分发给对应渲染器：

| 类型 | 桌面端 | 移动端 |
|------|--------|--------|
| 图片 | Modal + `<img>` 懒加载 | 同桌面 |
| 视频 | Modal + `<video>` | 同桌面 |
| PDF | pdf.js canvas + 本地 worker | `window.open`（Safari 原生查看器） |
| Office | iframe(Microsoft Online Viewer) | `window.open`（新标签页） |
| 文本 | `<pre>` 滚动查看 | 同桌面 |

移动端检测使用 User-Agent 正则（非 touch events，避免 touchscreen 笔记本误判）。

### PDF 预览要点

- 使用 `pdfjs-dist` v5 的 ESM 构建，worker 通过 Vite `?url` 导入本地文件
- 桌面端预取 ArrayBuffer 后传给 pdf.js，避免网络往返
- Safari 兼容：入口文件添加 `Promise.withResolvers` 和 `URL.parse` polyfill
- 缩放自适应：移动端 1.0，桌面端 1.5

### 拖拽排序

- 使用 `@dnd-kit/core` + `@dnd-kit/sortable`
- 激活距离 8px（防止误触）
- 排序结果通过 `updateSortOrder` 持久化

### 浏览器导航集成

- 文件夹导航：`pushState({ folderId })` 记录路径，`popstate` 响应后退
- 预览关闭：`pushState({ previewFile: true })` 打开预览，`popstate` 关闭
- 两种 state key 互不干扰

### 上传流程

1. 拖拽文件到上传区域或点击上传按钮
2. 检查文件名是否冲突，冲突时提示覆盖
3. 上传文件到 Supabase Storage（私有桶）
4. 写入文件元数据到 `files` 表
5. 上传失败时自动清理已上传的 Storage 文件

---

## 浏览器兼容性

| 浏览器 | 支持状态 | 备注 |
|--------|----------|------|
| Chrome | 完全支持 | 最新 2 个版本 |
| Firefox | 完全支持 | 最新 2 个版本 |
| Edge | 完全支持 | Chromium 版本 |
| Safari (macOS) | 完全支持 | >= 16.4 |
| Safari (iOS) | 完全支持 | >= 16.4，PDF 使用原生查看器 |
| Android Chrome | 完全支持 | 最新 2 个版本 |

---

## Supabase 免费版限制

| 项目 | 额度 | 说明 |
|------|------|------|
| 数据库 | 500 MB | 文件元数据足够 |
| 存储空间 | 1 GB | 照片和文档约可用 1-2 年 |
| 带宽 | 2 GB/月 | 预览和下载消耗 |
| 单文件大小 | 50 MB | 照片和文档足够 |
| Auth 用户 | 50,000 | 单用户共享模式完全够用 |

---

## 许可

MIT License
