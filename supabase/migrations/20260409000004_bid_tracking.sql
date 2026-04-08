-- bid_inquiries에 추적 기능 추가
ALTER TABLE bid_inquiries
  ADD COLUMN tracking_code TEXT UNIQUE,
  ADD COLUMN company_id UUID REFERENCES companies(id),
  ADD COLUMN admin_note TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- 추적 코드로 조회 허용 (Public)
CREATE POLICY "Public read own bid_inquiry by tracking_code"
  ON bid_inquiries FOR SELECT
  USING (tracking_code IS NOT NULL);

-- 추적 코드 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_code := 'FC-' || to_char(now(), 'YYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tracking_code
  BEFORE INSERT ON bid_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_code();
