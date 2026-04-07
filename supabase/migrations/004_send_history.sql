CREATE TYPE send_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

CREATE TABLE send_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  rendered_content TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status send_status NOT NULL DEFAULT 'pending',
  result_code TEXT,
  result_message TEXT
);

CREATE INDEX idx_send_history_company ON send_history(company_id);
CREATE INDEX idx_send_history_status ON send_history(status);
CREATE INDEX idx_send_history_sent_at ON send_history(sent_at DESC);
