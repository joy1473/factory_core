-- =============================================
-- Factory Guardian Agent Phase 1: Touch MVP
-- devices + sensor_readings + alerts
-- =============================================

-- 1. devices (설비/센서 장치)
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline')),
  thresholds JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  org_id UUID DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read devices" ON devices FOR SELECT USING (true);
CREATE POLICY "Admin full devices" ON devices FOR ALL USING (auth.role() = 'authenticated');

-- 2. sensor_readings (시계열 센서 데이터)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  is_alert BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_readings_device_time ON sensor_readings(device_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_alert ON sensor_readings(is_alert) WHERE is_alert = true;
CREATE INDEX IF NOT EXISTS idx_readings_type_time ON sensor_readings(sensor_type, recorded_at DESC);

ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert readings" ON sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Admin full readings" ON sensor_readings FOR ALL USING (auth.role() = 'authenticated');

-- 3. alerts (알림 이력)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status) WHERE status = 'active';

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert alerts" ON alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read alerts" ON alerts FOR SELECT USING (true);
CREATE POLICY "Public update alerts" ON alerts FOR UPDATE USING (true);
CREATE POLICY "Admin full alerts" ON alerts FOR ALL USING (auth.role() = 'authenticated');
