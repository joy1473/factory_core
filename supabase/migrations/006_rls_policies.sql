-- inquiries: 누구나 INSERT (문의 폼)
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read inquiries"
  ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update inquiries"
  ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');

-- companies: Admin만
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access companies"
  ON companies FOR ALL USING (auth.role() = 'authenticated');

-- tags: 읽기는 Public, 쓰기는 Admin
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tags"
  ON tags FOR SELECT USING (true);
CREATE POLICY "Admin full access tags"
  ON tags FOR ALL USING (auth.role() = 'authenticated');

-- company_tags: Admin만
ALTER TABLE company_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access company_tags"
  ON company_tags FOR ALL USING (auth.role() = 'authenticated');

-- message_templates: Admin만
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access templates"
  ON message_templates FOR ALL USING (auth.role() = 'authenticated');

-- send_history: Admin만
ALTER TABLE send_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access history"
  ON send_history FOR ALL USING (auth.role() = 'authenticated');
