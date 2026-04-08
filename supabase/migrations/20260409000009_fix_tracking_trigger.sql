-- Fix: upper() doesn't work on enum type, cast to text first
CREATE OR REPLACE FUNCTION generate_inquiry_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_code := upper(NEW.type::text) || '-' || to_char(now(), 'YYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
