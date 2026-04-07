CREATE TYPE template_type AS ENUM ('alimtalk', 'friendtalk');
CREATE TYPE template_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

CREATE TABLE message_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type template_type NOT NULL DEFAULT 'alimtalk',
  kakao_template_code TEXT,
  content TEXT NOT NULL,
  match_rules JSONB DEFAULT '{}',
  status template_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
