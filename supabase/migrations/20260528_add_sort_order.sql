-- Add sort_order column for drag-and-drop reordering
ALTER TABLE folders ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Initialize sort_order based on current display order (by name)
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY name) - 1 AS rn
  FROM folders
)
UPDATE folders SET sort_order = numbered.rn
FROM numbered WHERE folders.id = numbered.id;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY folder_id ORDER BY name) - 1 AS rn
  FROM files
)
UPDATE files SET sort_order = numbered.rn
FROM numbered WHERE files.id = numbered.id;
