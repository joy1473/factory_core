-- 문의를 통한 신규 기업 자동 생성 허용
CREATE POLICY "Public insert companies from inquiry"
  ON companies FOR INSERT
  WITH CHECK (true);

-- company_tags도 public insert 허용 (신규 태그 부여)
CREATE POLICY "Public insert company_tags"
  ON company_tags FOR INSERT
  WITH CHECK (true);
