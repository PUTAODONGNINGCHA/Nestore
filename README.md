# Nestore ☁️

> Nest(巢) + Store(存储) — 属于家人的云巢

面向家庭的个人云盘共享平台。设一个共享密码，全家人即可上传、下载、管理文件。

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS
- **后端**: Supabase (Auth + PostgreSQL + Storage)
- **状态管理**: React Hooks + @tanstack/react-query

## 快速开始

### 1. 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 进入 SQL Editor，执行 `supabase/migrations/001_init.sql` 建表
3. 创建 Storage bucket：进入 Storage → New bucket → 名称 `family-files` → 公开关闭
4. 设置 Storage RLS 策略：
```sql
-- 允许已认证用户读取文件
CREATE POLICY "authenticated read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'family-files');
-- 允许已认证用户上传文件
CREATE POLICY "authenticated insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'family-files');
-- 允许已认证用户删除文件
CREATE POLICY "authenticated delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'family-files');
```
5. Authentication → Users → Add User，创建一个共享账号（如 `family@xxx.com`）

### 2. 本地开发

```bash
# 复制环境变量
cp .env.example .env

# 编辑 .env，填入你的 Supabase 信息
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_FAMILY_EMAIL=family@your-domain.com

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 3. 构建部署

```bash
npm run build
```

推荐部署到 Vercel 或 Netlify（免费），构建命令 `npm run build`，输出目录 `dist`。

## 功能

-   **密码登录** — 一个共享密码，全家使用
-   **文件上传** — 拖拽上传，支持多文件
-   **文件浏览** — 列表展示名称、大小、日期
-   **文件预览** — 图片缩略图、视频播放、PDF 查看
-   **文件夹管理** — 创建、进入、移动文件
-   **响应式设计** — 手机、平板、电脑均可使用

## 数据迁移

支持方便地更换存储后端。详见 [docs/migration-guide.md](docs/migration-guide.md)

## 免费额度

| 资源 | Supabase 免费版 |
|------|----------------|
| 数据库 | 500 MB |
| 存储空间 | 1 GB |
| 带宽 | 2 GB/月 |
| 单文件 | 50 MB |
