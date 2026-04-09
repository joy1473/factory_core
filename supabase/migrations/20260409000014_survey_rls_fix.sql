-- Public read policies for survey system
-- send_history: allow lookup by tracking_token for survey page
CREATE POLICY "Public read by tracking_token" ON send_history FOR SELECT USING (tracking_token IS NOT NULL);

-- message_templates: allow public read for survey form schema
CREATE POLICY "Public read templates for survey" ON message_templates FOR SELECT USING (true);
