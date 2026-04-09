-- =============================================
-- Ear Agent Phase 3: Audio Monitoring
-- =============================================

CREATE TABLE IF NOT EXISTS audio_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'simulator',   -- 'simulator' | 'microphone'
  frequency_peaks JSONB NOT NULL DEFAULT '[]', -- [{freq_hz, amplitude_db, label}]
  rms_level NUMERIC NOT NULL DEFAULT 0,        -- 전체 음량 (dB)
  is_anomaly BOOLEAN DEFAULT false,
  anomaly_type TEXT,                           -- 'bearing', 'motor', 'belt', 'impact', null
  confidence NUMERIC DEFAULT 0,                -- 이상 감지 확신도 0~1
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audio_device_time ON audio_readings(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_audio_anomaly ON audio_readings(is_anomaly) WHERE is_anomaly = true;

ALTER TABLE audio_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert audio" ON audio_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read audio" ON audio_readings FOR SELECT USING (true);
CREATE POLICY "Admin full audio" ON audio_readings FOR ALL USING (auth.role() = 'authenticated');
