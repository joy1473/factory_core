-- 회사명 검색은 Public 허용 (이름, 연락처만 노출)
CREATE POLICY "Public search companies by name"
  ON companies FOR SELECT
  USING (true);
