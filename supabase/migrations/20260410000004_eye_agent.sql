-- =============================================
-- Eye Agent Phase 4: Vision Monitoring
-- =============================================

CREATE TABLE IF NOT EXISTS vision_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'simulator',     -- 'simulator' | 'webcam' | 'mobile_rear' | 'glasses'
  image_url TEXT,                                -- Supabase Storage URL (실제 캡처 시)
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,   -- {detections: [{type, confidence, description}]}
  is_anomaly BOOLEAN DEFAULT false,
  anomaly_type TEXT,                             -- 'crack', 'leak', 'discolor', 'wear', 'safety'
  confidence NUMERIC DEFAULT 0,
  ai_description TEXT,                           -- Claude Vision 분석 결과 텍스트
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vision_device_time ON vision_readings(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_anomaly ON vision_readings(is_anomaly) WHERE is_anomaly = true;

ALTER TABLE vision_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert vision" ON vision_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read vision" ON vision_readings FOR SELECT USING (true);
CREATE POLICY "Admin full vision" ON vision_readings FOR ALL USING (auth.role() = 'authenticated');
