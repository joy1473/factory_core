CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ceo TEXT,
  contact_person TEXT,
  phone TEXT,
  address TEXT,
  sido TEXT,
  sigungu TEXT,
  source_id INTEGER,
  email TEXT,
  website TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companies_sido ON companies(sido);
CREATE INDEX idx_companies_sigungu ON companies(sigungu);
CREATE INDEX idx_companies_name ON companies USING gin(to_tsvector('simple', name));
CREATE UNIQUE INDEX idx_companies_source_id ON companies(source_id) WHERE source_id IS NOT NULL;
