-- 1. Company Info (하드코딩 제거)
CREATE TABLE company_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_name_en TEXT,
  ceo_name TEXT,
  business_number TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read company_info" ON company_info FOR SELECT USING (true);
CREATE POLICY "Admin write company_info" ON company_info FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO company_info (company_name, company_name_en, ceo_name, business_number, address, email, phone, description)
VALUES ('조이텍', 'JOYTEC', '조은아', '110-11-23776', '서울특별시 강서구 양천로49길 39-59, 203호', 'joytec@naver.com', '010-2648-6726', '중소 제조기업을 위한 Agentic AI 설비관리 솔루션');

-- 2. Tag Keywords (태그 추출 키워드 사전)
CREATE TABLE tag_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tag_name TEXT NOT NULL,
  keyword_type TEXT NOT NULL CHECK (keyword_type IN ('industry', 'size', 'business')),
  keywords TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tag_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access tag_keywords" ON tag_keywords FOR ALL USING (auth.role() = 'authenticated');

-- Industry keywords
INSERT INTO tag_keywords (tag_name, keyword_type, keywords) VALUES
  ('CNC/기계가공', 'industry', ARRAY['cnc', '기계가공', '절삭', '밀링', '선반', '머시닝', '공작기계', '금속가공']),
  ('금형/사출', 'industry', ARRAY['금형', '사출', '프레스', '다이캐스팅', '주조', '단조', '성형']),
  ('자동차부품', 'industry', ARRAY['자동차', '차량', '오토', '모터', '엔진', '브레이크', '샤시', '자동차부품']),
  ('전자/반도체', 'industry', ARRAY['전자', '반도체', 'pcb', '회로', '전기전자', '디스플레이', 'led', '센서', '전자부품']),
  ('식품', 'industry', ARRAY['식품', '음료', '제과', '식자재', '냉동', '유가공', '축산']),
  ('화학/소재', 'industry', ARRAY['화학', '소재', '플라스틱', '고무', '도금', '표면처리', '코팅', '섬유']),
  ('로봇/자동화', 'industry', ARRAY['로봇', '자동화', 'automation', '자동검사', '자동조립', '자동포장', 'fa', 'plc', '제어']),
  ('SW/IT', 'industry', ARRAY['소프트웨어', 'it', 'ai', '인공지능', '데이터', '클라우드', '솔루션', '프로그램']);

-- Size keywords
INSERT INTO tag_keywords (tag_name, keyword_type, keywords) VALUES
  ('소상공인 (10인 미만)', 'size', ARRAY['1인', '개인', '소규모', '소호']),
  ('소기업 (10~49인)', 'size', ARRAY['소기업', '중소']),
  ('중기업 (50~299인)', 'size', ARRAY['중기업', '중견']),
  ('중견기업 (300인+)', 'size', ARRAY['중견기업', '대기업', '상장']);

-- Business (extra suggestions)
INSERT INTO tag_keywords (tag_name, keyword_type, keywords) VALUES
  ('검사장비', 'business', ARRAY['검사', '측정', '시험', '품질검사', '비전검사', '자동검사']),
  ('포장/물류', 'business', ARRAY['포장', '물류', '배송', '창고', '팔레트']),
  ('에너지/환경', 'business', ARRAY['에너지', '태양광', '환경', '폐수', '재활용']),
  ('의료/바이오', 'business', ARRAY['의료', '바이오', '제약', '의료기기']),
  ('항공/방산', 'business', ARRAY['항공', '방산', '군수', '국방']),
  ('조선/해양', 'business', ARRAY['조선', '해양', '선박']),
  ('건설/플랜트', 'business', ARRAY['건설', '플랜트', '토목', '시공']);

-- 3. Marketing Content (통합 컨텐츠 테이블)
CREATE TABLE marketing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_key TEXT NOT NULL,
  data JSONB NOT NULL,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_type, content_key)
);

ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read marketing_content" ON marketing_content FOR SELECT USING (visible = true);
CREATE POLICY "Admin full access marketing_content" ON marketing_content FOR ALL USING (auth.role() = 'authenticated');

-- 4. Scene Presets
CREATE TABLE scene_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  equipment JSONB NOT NULL,
  stickers JSONB NOT NULL,
  alert_index INT DEFAULT 0,
  waypoints JSONB NOT NULL,
  kiosk_pos JSONB NOT NULL,
  camera_keyframes JSONB NOT NULL,
  chat_messages JSONB NOT NULL,
  overlay_texts JSONB NOT NULL,
  visible BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scene_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scene_presets" ON scene_presets FOR SELECT USING (visible = true);
CREATE POLICY "Admin full access scene_presets" ON scene_presets FOR ALL USING (auth.role() = 'authenticated');
