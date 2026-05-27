-- 初始化数据库表

-- 1. 文件夹表（邻接表 + 物化路径）
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL DEFAULT '',
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_owner ON folders(owner_id);

-- 2. 自动维护 path 的触发器函数
CREATE OR REPLACE FUNCTION update_folder_path()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_id IS NULL THEN
      NEW.path := NEW.id::text;
    ELSE
      SELECT path || '.' || NEW.id::text INTO NEW.path
      FROM folders WHERE id = NEW.parent_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_folder_path
  BEFORE INSERT ON folders
  FOR EACH ROW EXECUTE FUNCTION update_folder_path();

-- 3. 更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. 文件表
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_files_folder ON files(folder_id);
CREATE INDEX idx_files_owner ON files(owner_id);

CREATE TRIGGER trg_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. 启用 RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 6. RLS 策略（单用户共享模式）
CREATE POLICY "users can read own folders"
  ON folders FOR SELECT
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own folders"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can update own folders"
  ON folders FOR UPDATE
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can delete own folders"
  ON folders FOR DELETE
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can read own files"
  ON files FOR SELECT
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own files"
  ON files FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can update own files"
  ON files FOR UPDATE
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "users can delete own files"
  ON files FOR DELETE
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

-- 7. Storage RLS（需要手动在 Supabase Dashboard 配置）
-- Bucket name: family-files (private)
-- Policy: 允许 authenticated 用户对 owner_id 匹配的路径进行操作
-- 路径格式: {owner_id}/{folder_id}/{file_id}-{filename}
