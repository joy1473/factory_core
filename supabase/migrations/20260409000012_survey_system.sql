-- =============================================
-- Survey Form System — DB Migration
-- =============================================

-- 1. message_templates 확장
ALTER TABLE message_templates
ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'general'
  CHECK (template_type IN ('interview', 'inquiry', 'general')),
ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '{"questions":[]}'::jsonb,
ADD COLUMN IF NOT EXISTS email_subject TEXT;

-- 2. send_history 확장 (추적 필드)
ALTER TABLE send_history
ADD COLUMN IF NOT EXISTS tracking_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS open_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS click_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- 3. email_tracking 테이블
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  history_id UUID NOT NULL REFERENCES send_history(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  event_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_email_tracking_history ON email_tracking(history_id);

ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert tracking" ON email_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read tracking" ON email_tracking FOR SELECT USING (auth.role() = 'authenticated');

-- 4. survey_responses 테이블
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES message_templates(id),
  history_id UUID REFERENCES send_history(id),
  token TEXT UNIQUE NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  respondent_info JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_template ON survey_responses(template_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_token ON survey_responses(token);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert survey" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select own survey" ON survey_responses FOR SELECT USING (true);
CREATE POLICY "Admin read surveys" ON survey_responses FOR SELECT USING (auth.role() = 'authenticated');
