# 存储迁移指南

> 本文档说明如何在需要时将数据从 Supabase Storage 迁移到其他存储后端（如 S3、MinIO、阿里云 OSS 等）。

## 架构说明

本项目采用 **适配器模式（Adapter Pattern）** 隔离存储实现。所有数据操作都通过 `StorageAdapter` 接口进行，切换后端只需实现新的适配器。

## 迁移步骤

### 1. 提取现有数据

从 Supabase 导出文件元数据：

```sql
-- 导出 files 表
COPY files TO '/tmp/files_export.csv' WITH CSV HEADER;

-- 导出 folders 表
COPY folders TO '/tmp/folders_export.csv' WITH CSV HEADER;
```

从 Supabase Storage 下载所有文件（可通过 Supabase Dashboard 或 API）。

### 2. 上传到新存储

将文件上传到目标存储（如 S3/MinIO），保持原有路径结构：
```
{owner_id}/{folder_id}/{file_id}-{filename}
```

### 3. 新建适配器

在 `src/storage/` 下创建新适配器，实现 `StorageAdapter` 接口：

```typescript
// src/storage/s3-adapter.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { StorageAdapter } from './types'

export class S3Adapter implements StorageAdapter {
  private client: S3Client
  private bucket: string

  constructor() {
    this.client = new S3Client({
      region: import.meta.env.VITE_S3_REGION,
      endpoint: import.meta.env.VITE_S3_ENDPOINT,
      credentials: {
        accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY,
        secretAccessKey: import.meta.env.VITE_S3_SECRET_KEY,
      },
    })
    this.bucket = import.meta.env.VITE_S3_BUCKET
  }

  // 实现 StorageAdapter 接口的所有方法...
}
```

### 4. 切换适配器

修改 `src/storage/factory.ts`：

```typescript
import { SupabaseAdapter } from './supabase-adapter'
import { S3Adapter } from './s3-adapter'
import { supabase } from '@/lib/supabase'

export function getStorageAdapter(): StorageAdapter {
  const backend = import.meta.env.VITE_STORAGE_BACKEND || 'supabase'

  switch (backend) {
    case 's3':
      return new S3Adapter()
    case 'supabase':
    default:
      return new SupabaseAdapter(supabase)
  }
}
```

### 5. 配置环境变量

```env
# 切换为 S3
VITE_STORAGE_BACKEND=s3
VITE_S3_REGION=us-east-1
VITE_S3_ENDPOINT=https://your-minio-server:9000
VITE_S3_ACCESS_KEY=your-access-key
VITE_S3_SECRET_KEY=your-secret-key
VITE_S3_BUCKET=family-files

# 或继续使用 Supabase
# VITE_STORAGE_BACKEND=supabase
```

## 数据迁移兼容性

| 数据类型 | 存储位置 | 迁移难度 | 说明 |
|---------|---------|---------|------|
| 文件内容 | Supabase Storage | 低 | 直接复制到目标存储，保持路径一致 |
| 文件元数据 | PostgreSQL | 无 | 不涉及迁移，元数据始终在数据库 |
| 文件夹结构 | PostgreSQL | 无 | 不涉及迁移，始终在数据库 |
| 用户认证 | Supabase Auth | 中 | 如需迁移到自建认证，需要重新创建用户 |

## PostgreSQL 数据库迁移

如果需要更换 PostgreSQL 数据库：

```bash
# 使用 pg_dump 导出
pg_dump --table=files --table=folders your-db-url > backup.sql

# 导入新数据库
psql new-db-url < backup.sql
```

## 回滚方案

如果新存储后端出现问题：

1. 将 `VITE_STORAGE_BACKEND` 改回 `supabase`
2. 重新部署
3. 数据不会丢失，元数据始终在 PostgreSQL 中
