-- SaaS 대비: organizations 테이블 + 각 테이블에 org_id 추가

-- 1. organizations 테이블
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  business_number TEXT,
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access organizations"
  ON organizations FOR ALL USING (auth.role() = 'authenticated');

-- 기본 organization: 조이텍
INSERT INTO organizations (id, name, business_number, email)
VALUES ('00000000-0000-0000-0000-000000000001', '조이텍', '110-11-23776', 'joytec@naver.com');

-- 2. 각 테이블에 org_id 추가 (기본값 = 조이텍)
ALTER TABLE companies
  ADD COLUMN org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE message_templates
  ADD COLUMN org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE send_history
  ADD COLUMN org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE inquiries
  ADD COLUMN org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001';

ALTER TABLE tags
  ADD COLUMN org_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001';

-- 3. 기존 데이터에 org_id 부여
UPDATE companies SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;
UPDATE tags SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;

-- 4. 인덱스
CREATE INDEX idx_companies_org ON companies(org_id);
CREATE INDEX idx_templates_org ON message_templates(org_id);
CREATE INDEX idx_history_org ON send_history(org_id);
CREATE INDEX idx_tags_org ON tags(org_id);
