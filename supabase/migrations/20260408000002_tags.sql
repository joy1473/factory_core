CREATE TYPE tag_type AS ENUM ('industry', 'size', 'custom');

CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type tag_type NOT NULL DEFAULT 'custom',
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00d4ff',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE company_tags (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (company_id, tag_id)
);

INSERT INTO tags (type, name, color) VALUES
  ('industry', 'CNC/기계가공', '#00d4ff'),
  ('industry', '금형/사출', '#00ff88'),
  ('industry', '자동차부품', '#ffaa00'),
  ('industry', '전자/반도체', '#ff6644'),
  ('industry', '식품', '#aa88ff'),
  ('industry', '화학/소재', '#ff88aa'),
  ('industry', '로봇/자동화', '#44ddff'),
  ('industry', 'SW/IT', '#88ff88'),
  ('size', '소상공인 (10인 미만)', '#888888'),
  ('size', '소기업 (10~49인)', '#aaaaaa'),
  ('size', '중기업 (50~299인)', '#cccccc'),
  ('size', '중견기업 (300인+)', '#ffffff');
