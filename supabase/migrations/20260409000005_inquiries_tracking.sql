-- inquiries 테이블에도 추적 코드 추가
ALTER TABLE inquiries
  ADD COLUMN tracking_code TEXT UNIQUE,
  ADD COLUMN status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  ADD COLUMN admin_note TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- 추적 코드 조회 허용 (Public)
CREATE POLICY "Public read own inquiry by tracking_code"
  ON inquiries FOR SELECT
  USING (tracking_code IS NOT NULL);

-- 추적 코드 자동 생성 트리거
CREATE OR REPLACE FUNCTION generate_inquiry_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_code := upper(NEW.type) || '-' || to_char(now(), 'YYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_inquiry_tracking_code
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION generate_inquiry_tracking_code();
