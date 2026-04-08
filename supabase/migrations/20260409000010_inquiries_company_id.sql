-- inquiries에 company_id 추가
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
