# 个人云盘共享平台 — 需求文档

> 版本：v0.1
> 最后更新：2026-05-27

---

## 项目概述

一个**面向家庭成员的个人云盘平台**，通过浏览器访问，支持文件的上传、下载、管理和预览。所有用户通过统一的共享密码访问，无需单独注册账号。

### 目标

- 为家庭提供安全、便捷的文件共享空间
- 操作简单，任何人（包括不熟悉技术的家人）都能轻松使用
- 成本可控，基于 Supabase 免费版运行

### 非目标

- ❌ 不提供公开分享功能
- ❌ 不提供多用户独立空间
- ❌ 不提供在线编辑功能

---

## 技术架构

```
┌─────────────────────────────────────────┐
│            Frontend (Vite)               │
│  React + TypeScript + Tailwind CSS       │
│                                          │
│  LoginPage  →  MainLayout                │
│                  ├── Sidebar (导航)       │
│                  ├── FileBrowser          │
│                  ├── FileUploader         │
│                  └── FilePreview          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Supabase Backend               │
│                                          │
│  Auth        → 单用户共享登录             │
│  PostgreSQL  → 文件/文件夹元数据          │
│  Storage     → 文件内容存储 (私有桶)       │
│  RLS         → 行级安全策略               │
└─────────────────────────────────────────┘
```

---

## 功能需求

### P0 — 核心功能（必须实现）

| ID | 功能 | 描述 | 备注 |
|----|------|------|------|
| F-01 | 密码登录 | 统一的登录页面，输入共享密码后进入云盘 | 使用 Supabase Auth 单用户 |
| F-02 | 文件列表浏览 | 展示当前文件夹下的文件和子文件夹列表 | 支持列表/网格视图切换 |
| F-03 | 文件夹导航 | 点击进入子文件夹，面包屑路径返回 | |
| F-04 | 文件上传 | 支持拖拽上传和点击选择，上传进度显示 | 使用 `react-dropzone` |
| F-05 | 文件下载 | 点击文件即可下载 | 通过 Supabase 签名 URL |
| F-06 | 新建文件夹 | 在当前目录下创建新文件夹 | |
| F-07 | 文件/文件夹重命名 | 右键或菜单操作重命名 | |
| F-08 | 文件/文件夹删除 | 删除到回收站或直接删除 | |
| F-09 | 图片预览 | 在线查看图片（JPG/PNG/GIF/WebP） | |
| F-10 | 视频预览 | 在线播放视频（MP4/WebM） | |
| F-11 | 响应式布局 | 在手机、平板、电脑上都能正常使用 | |

### P1 — 增强功能

| ID | 功能 | 描述 | 备注 |
|----|------|------|------|
| F-12 | PDF 预览 | 在线查看 PDF 文件 | |
| F-13 | 文档预览 | 在线查看文本文件、代码文件 | |
| F-14 | 文件搜索 | 按文件名搜索 | |
| F-15 | 批量上传 | 上传整个文件夹 | |
| F-16 | 文件排序 | 按名称、日期、大小排序 | |
| F-17 | 深色模式 | 支持深色/浅色主题切换 | |

### P2 — 锦上添花

| ID | 功能 | 描述 | 备注 |
|----|------|------|------|
| F-18 | 多文件下载 | 批量选择文件，打包下载 | 需要后端支持 |
| F-19 | 最近文件 | 显示最近上传/修改的文件列表 | |
| F-20 | 文件统计 | 显示存储用量、文件数量等 | |
| F-21 | 回收站 | 删除文件暂存，可恢复 | |
| F-22 | 存储迁移 | 从 Supabase Storage 迁移到 S3/MinIO | 通过适配器模式 |

---

## 数据库设计

### 表结构

```sql
-- 文件夹表（邻接表 + 物化路径）
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,          -- 物化路径: "root.uuid.child-uuid"
  owner_id UUID NOT NULL,      -- 固定为共享用户的 ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件表
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT DEFAULT 0,
  storage_path TEXT NOT NULL,   -- Supabase Storage 路径
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 存储桶

- **桶名**: `family-files`
- **类型**: 私有桶
- **路径约定**: `{owner_id}/{folder_id}/{file_id}.{ext}`
- **访问方式**: 通过签名 URL（每次请求时生成，不持久化）

---

## 项目结构

```
src/
├── components/
│   ├── auth/
│   │   └── LoginPage.tsx           # 共享密码登录页
│   ├── layout/
│   │   ├── MainLayout.tsx          # 主布局
│   │   └── Sidebar.tsx             # 侧边栏导航
│   ├── file-browser/
│   │   ├── FileList.tsx            # 文件列表/网格
│   │   ├── FileItem.tsx            # 单个文件/文件夹项
│   │   ├── Breadcrumb.tsx          # 面包屑路径
│   │   └── EmptyState.tsx          # 空文件夹状态
│   ├── upload/
│   │   └── FileUploader.tsx        # 拖拽上传组件
│   ├── preview/
│   │   ├── FilePreview.tsx         # 预览弹窗
│   │   ├── ImagePreview.tsx        # 图片预览
│   │   └── VideoPreview.tsx        # 视频预览
│   └── ui/                         # 通用 UI 组件
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── ContextMenu.tsx
│       └── ProgressBar.tsx
├── hooks/
│   ├── useAuth.ts                  # 认证状态管理
│   ├── useFiles.ts                 # 文件 CRUD
│   ├── useFolders.ts               # 文件夹 CRUD
│   ├── useUpload.ts                # 上传逻辑
│   └── useBreadcrumbs.ts           # 面包屑逻辑
├── lib/
│   ├── supabase.ts                 # Supabase 客户端初始化
│   └── utils.ts                    # 工具函数
├── types/
│   └── index.ts                    # TypeScript 类型定义
├── storage/
│   ├── types.ts                    # StorageAdapter 接口
│   ├── supabase-adapter.ts         # Supabase 实现
│   └── factory.ts                  # 适配器工厂
├── App.tsx
├── main.tsx
└── index.css
```

---

## 非功能性需求

### 性能
- 页面加载 < 2 秒
- 文件列表渲染 < 1 秒（100 个文件以内）
- 图片预览 < 3 秒

### 安全
- 共享密码通过 Supabase Auth 保护
- 文件存储为私有桶，通过签名 URL 访问
- 所有数据库操作受 RLS 策略保护

### 兼容性
- 支持 Chrome、Firefox、Edge、Safari 最新版本
- 支持 iOS Safari 和 Android Chrome
- 支持移动端触摸操作

### 可扩展性
- 存储层通过 Adapter 模式抽象，后续可切换到 S3/MinIO
- 文件元数据存在 PostgreSQL，不绑定特定存储后端

---

## Supabase 免费版限制

| 项目 | 额度 | 备注 |
|------|------|------|
| 数据库 | 500MB | 文件元数据足够 |
| 存储空间 | 1GB | 主要限制，照片和文档约可用 1-2 年 |
| 带宽 | 2GB/月 | 预览和下载会消耗 |
| 单文件大小 | 50MB | 照片和文档足够 |
| Auth 用户 | 50,000 | 单用户共享模式完全够用 |
