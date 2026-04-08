-- 사업공고 게시판
CREATE TABLE bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT DEFAULT 'manual',
  source_id TEXT,
  title TEXT NOT NULL,
  organization TEXT,
  field TEXT,
  apply_start DATE,
  apply_end DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'upcoming')),
  detail_url TEXT,
  summary TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001'
);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Admin full access bids" ON bids FOR ALL USING (auth.role() = 'authenticated');

CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_apply_end ON bids(apply_end DESC);

-- 공고 문의 (inquiries 확장 대신 별도 테이블)
CREATE TABLE bid_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID REFERENCES bids(id),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT NOT NULL,
  service_type TEXT DEFAULT 'proposal' CHECK (service_type IN ('proposal', 'presentation', 'consulting', 'full')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bid_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bid_inquiries" ON bid_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access bid_inquiries" ON bid_inquiries FOR ALL USING (auth.role() = 'authenticated');

-- 샘플 공고 데이터
INSERT INTO bids (title, organization, field, apply_start, apply_end, status, detail_url, summary, is_featured) VALUES
  ('2026년 정부형 스마트공장 구축사업', '중소벤처기업부', '스마트공장', '2026-03-01', '2026-04-30', 'active',
   'https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000116263',
   '중소 제조기업의 스마트공장 구축을 위한 정부 지원사업. ICT 기술을 활용한 제조공정 최적화 지원.', true),

  ('2026년 제조AI특화 스마트공장 (자율형공장 AI트랙)', '중소벤처기업부', 'AI제조',  '2026-03-01', '2026-05-31', 'active',
   'https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000115998',
   'AI에이전트, 온디바이스AI 등 AI기술을 활용한 공정최적화, 예측유지보수 지원.', true),

  ('2026년 도약(Jump-Up) 프로그램 연계 스마트공장 구축 지원', '스마트제조혁신추진단', '스마트공장', '2026-03-15', '2026-04-25', 'active',
   'https://www.smart-factory.kr/',
   '기존 스마트공장 도입 기업의 고도화를 위한 도약 프로그램.', false),

  ('2026년 디지털 협업공장 구축사업', '중소벤처기업부', '디지털전환', '2026-04-01', '2026-05-15', 'active',
   'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116521',
   '중소기업 디지털·AI 전환을 통한 경쟁력 강화.', false),

  ('중소제조 특화 Multi AI Agent 개발 (R&D)', '중소벤처기업부', 'AI R&D', '2026-01-01', '2026-12-31', 'upcoming',
   'https://www.bizinfo.go.kr/web/lay1/bbs/S1T122C128/AS/74/view.do?pblancId=PBLN_000000000116030',
   '중소제조 특화 분야의 핵심 Task를 기반으로 한 Multi AI Agent 기술개발 시범연구 지원.', true);
