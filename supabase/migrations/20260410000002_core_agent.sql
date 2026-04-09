-- =============================================
-- Core Agent: Chat + Reports
-- =============================================

CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data_snapshot JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full chat_conversations" ON chat_conversations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read chat_conversations" ON chat_conversations FOR SELECT USING (true);
CREATE POLICY "Public insert chat_conversations" ON chat_conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full chat_messages" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read chat_messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public insert chat_messages" ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full reports" ON reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON reports FOR INSERT WITH CHECK (true);
