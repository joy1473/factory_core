-- =============================================
-- 3D Digital Twin: Scenes + Device Positions
-- =============================================

CREATE TABLE IF NOT EXISTS factory_scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  splat_url TEXT NOT NULL,
  thumbnail_url TEXT,
  camera_position JSONB DEFAULT '{"x":0,"y":5,"z":10}'::jsonb,
  camera_target JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
  status TEXT DEFAULT 'active',
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE factory_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scenes" ON factory_scenes FOR SELECT USING (true);
CREATE POLICY "Admin full scenes" ON factory_scenes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert scenes" ON factory_scenes FOR INSERT WITH CHECK (true);

-- 기존 devices 테이블에 3D 위치 추가
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS scene_id UUID REFERENCES factory_scenes(id),
ADD COLUMN IF NOT EXISTS position_3d JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
ADD COLUMN IF NOT EXISTS rotation_3d JSONB DEFAULT '{"x":0,"y":0,"z":0}'::jsonb,
ADD COLUMN IF NOT EXISTS label_offset JSONB DEFAULT '{"x":0,"y":2,"z":0}'::jsonb;
