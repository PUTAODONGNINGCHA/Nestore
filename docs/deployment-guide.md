# Nestore 部署与运维指南

> 本文档记录 Nestore 的完整部署流程、Supabase 配置说明以及各云平台的对比与使用指南。

---

## 目录

1. [架构概览](#1-架构概览)
2. [Supabase 配置](#2-supabase-配置)
3. [前端部署平台对比](#3-前端部署平台对比)
4. [Vercel 部署](#4-vercel-部署)
5. [Cloudflare Pages 部署](#5-cloudflare-pages-部署)
6. [数据迁移](#6-数据迁移)
7. [常见问题](#7-常见问题)

---

## 1. 架构概览

```
用户浏览器
    ↓
[ Vercel / Cloudflare Pages ]  ← 前端托管（静态文件）
    ↓
[ Supabase ]                    ← 后端（数据库 + 存储 + 认证）
    ├── Auth       → 单用户共享密码登录
    ├── PostgreSQL → 文件/文件夹元数据
    └── Storage    → 文件内容存储（私有桶）
```

**核心设计**：前端和后端分离。前端是纯静态页面，部署在任何平台都一样；后端统一由 Supabase 提供服务。这意味着：

-   前端换平台（Vercel → Cloudflare → 自建服务器），数据不丢失
-   所有平台访问的是同一个 Supabase，数据互通
-   后续迁移只需要重新部署前端，不影响已有数据

---

## 2. Supabase 配置

### 2.1 创建项目

1. 打开 [supabase.com](https://supabase.com)
2. 点击 **New Project**
3. 填写项目名、数据库密码、选择区域（建议选 Singapore 或 Tokyo，离中国近）
4. Free Plan 即可

### 2.2 关键信息

项目创建后，在 **Project Settings → API** 中可以找到：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **Project URL** | API 地址 | `https://xxxxx.supabase.co` |
| **anon public key** | 前端用，可公开 | `sb_publishable_xxx`或 `eyJxxx` |
| **service_role key** | 管理员密钥，**绝不能暴露** | `sb_secret_xxx` |

> **安全提醒**：`anon key` 是安全的，可以放在前端代码里。`service_role key` 拥有管理员权限，泄露会导致数据库被完全控制，绝对不能提交到 Git 或放在前端。

### 2.3 数据库建表

在 **SQL Editor** 中执行 `supabase/migrations/001_init.sql`：

```sql
-- 关键表结构
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '',     -- 物化路径，用于面包屑导航
  owner_id UUID NOT NULL,           -- 用户 ID，关联 auth.users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,        -- 指向 Storage 中的文件
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**文件夹树实现说明**：

-   **邻接表**（`parent_id`）：快速插入和移动文件夹
-   **物化路径**（`path` 列）：通过触发器自动维护，格式如 `root-id.child-id.grandchild-id`
-   物化路径使得查询所有子文件夹和面包屑导航都很高效（B-tree 索引，O(log n)）

### 2.4 行级安全策略（RLS）

RLS 是 Supabase 的安全核心。每条策略都是一个 SQL 规则，控制谁能对哪些数据做什么操作。

```sql
-- 示例：用户只能看到自己的文件
CREATE POLICY "users can read own files"
ON files FOR SELECT TO authenticated
USING (owner_id = (SELECT auth.uid()));
```

对于 Nestore 的单用户模式，所有策略检查 `owner_id = auth.uid()`。

### 2.5 存储桶（Storage）

1. **Storage → New Bucket** → 名称 `family-files`
2. **不要勾选 Public**（私有桶更安全）
3. 设置 RLS 策略让认证用户可以操作

```sql
CREATE POLICY "authenticated_all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'family-files')
WITH CHECK (bucket_id = 'family-files');
```

**存储路径格式**：`{userId}/{folderId}/{fileId}-{filename}`

**访问方式**：通过签名 URL（S3 signed URL 概念），每次请求时临时生成，过期自动失效。

### 2.6 Auth 创建用户

**Authentication → Users → Add User**，填邮箱和密码。这个密码就是家人登录云盘的共享密码。

> 单用户模式：所有文件归同一个用户所有，不需要多用户注册体系。

### 2.7 免费版限制

| 资源 | 额度 | 预计可用 |
|------|------|---------|
| 数据库 | 500 MB | 几年（存元数据而已） |
| 存储空间 | 1 GB | 视使用情况，照片约 500-1000 张 |
| 带宽 | 2 GB/月 | 轻度使用足够 |
| 单文件大小 | 50 MB | 文档和照片够用，视频需要压缩 |
| Auth 用户数 | 50,000 | 单用户模式绰绰有余 |

---

## 3. 前端部署平台对比

| 特性 | Vercel | Cloudflare Pages | Zeabur | 自建服务器 |
|------|--------|-----------------|--------|-----------|
| 免费额度 | ✅ | ✅ | ❌（需付费） | ❌ |
| 国内访问 | ⚠️ 需 VPN | ⚠️ 需 VPN | ✅ 深圳节点 | ✅ |
| 部署方式 | GitHub 自动 | GitHub 自动 | GitHub 自动 | 手动上传/Nginx |
| 自定义域名 | ✅ | ✅ | ✅ | ✅ |
| 学习成本 | 低 | 低 | 低 | 高 |
| 维护成本 | 零 | 零 | 零 | 需自己维护 |

**选择建议**：
- 图省事、愿意开 VPN → **Vercel**
- 用 Cloudflare 服务多 → **Cloudflare Pages**
- 国内直连 → **自建服务器**
- 想要速度快且不差钱 → **Zeabur** 或国内云厂商

---

## 4. Vercel 部署

### 4.1 首次部署

1. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录
2. **Add New → Project**
3. 导入 Nestore 仓库
4. 配置：

| 项目 | 值 |
|------|-----|
| Framework Preset | Vite（自动检测） |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | 见下表 |

5. **Environment Variables** 填入：

```
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的anon key
VITE_FAMILY_EMAIL=family@你的域名.com
```

6. 点击 **Deploy**

### 4.2 自动更新

- 每次 push 代码到 GitHub，Vercel 自动重新构建部署
- 无需任何手动操作

### 4.3 修改环境变量

如果以后 Supabase 信息变了：

1. Vercel Dashboard → 项目 → **Settings**
2. 左侧 **Environment Variables**
3. 修改后点 **Save**，然后重新部署一次

---

## 5. Cloudflare Pages 部署

### 5.1 首次部署

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages → Pages → Create application → Connect to Git**
3. 授权 GitHub，导入 Nestore 仓库
4. **Project name**：填一个不冲突的名字
5. **Framework preset**：选 **Vite**
6. 环境变量同 Vercel

### 5.2 域名说明

| 项目名 | 默认域名 |
|--------|---------|
| `nestore` | `nestore.pages.dev`（可能被占用） |
| `nostorage` | `nostorage.pages.dev` |
| `nestore-app` | `nestore-app.pages.dev` |

如果默认域名被占用，可以添加自定义域名。

### 5.3 绑定自定义域名（可选）

1. Cloudflare Pages → 项目 → **Custom domains**
2. **Add custom domain**
3. 输入你的域名（前提是你已经拥有该域名）

> 域名购买推荐：Namesilo、GoDaddy、阿里云、腾讯云，一般几十块一年。

---

## 6. 数据迁移

### 6.1 更换前端部署平台

前端是纯静态文件，换平台不影响数据：

1. 在新平台重新部署（导入同一 GitHub 仓库）
2. 填同样的 Supabase 环境变量
3. 新平台部署好后，旧平台的也可以保留，两者数据互通

### 6.2 更换存储后端

详见 [docs/migration-guide.md](./migration-guide.md)

项目通过 **适配器模式** 抽象存储层，从 Supabase Storage 切换到 S3/MinIO 只需新增一个适配器类。

### 6.3 导出数据库

```bash
# 从 Supabase 导出
pg_dump --table=files --table=folders "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" > backup.sql
```

---

## 7. 常见问题

### 7.1 部署后打开是白屏或 404

-   检查 **Build Output Directory** 是否设为 `dist`
-   检查环境变量是否正确填写
-   Vite 项目构建产物的确在 `dist` 目录

### 7.2 登录提示"密码错误"

-   检查 `VITE_FAMILY_EMAIL` 是否和 Supabase Auth 创建的用户邮箱一致
-   到 Supabase **Authentication → Users** 检查用户是否存在
-   可以删了重新创建一个用户

### 7.3 上传文件失败

-   检查 Storage bucket 是否已创建且名称是 `family-files`
-   检查 Storage RLS 策略是否已设置
-   检查文件是否超过 50MB（免费版限制）

### 7.4 文件预览黑屏/打不开

-   图片/视频：检查 bucket 是否是私有桶（不能是 public）
-   PDF：浏览器自带支持，检查签名 URL 是否生成成功

### 7.5 GitHub 仓库改名后

-   已部署的网站正常访问
-   但后续 push 不再自动触发部署
-   需要去部署平台重新连接新的仓库地址

### 7.6 代码修改后如何更新线上版本

```
本地改代码 → git add . → git commit -m "说明" → git push
                                                       ↓
                                          Vercel/Cloudflare 自动构建
                                                       ↓
                                          家人访问到最新版本
```

无需任何平台操作，push 即更新。

---

## 环境变量速查

| 变量名 | 必须 | 说明 | 获取位置 |
|--------|------|------|---------|
| `VITE_SUPABASE_URL` | ✅ | Supabase API 地址 | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ | 匿名密钥（安全，可公开） | Supabase → Settings → API |
| `VITE_FAMILY_EMAIL` | ✅ | 共享用户的邮箱 | 自己设定，需和 Auth 创建的用户一致 |
