-- Add colors JSONB column to scene_presets for CoreBot Family pastel theme
ALTER TABLE scene_presets
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '{
  "primary": "#A8E6CF",
  "accent": "#7FCDBB",
  "alert": "#FF9A9A",
  "grid": "#A8E6CF",
  "particles": "#A8E6CF",
  "sticker": "#A8E6CF"
}'::jsonb;

-- Update existing presets with scene-specific colors
UPDATE scene_presets SET colors = '{"primary":"#A8E6CF","accent":"#7FCDBB","alert":"#FF9A9A","grid":"#A8E6CF","particles":"#A8E6CF","sticker":"#A8E6CF"}'::jsonb WHERE scene_id = 'general';
UPDATE scene_presets SET colors = '{"primary":"#DDA0DD","accent":"#C89BD9","alert":"#FF9A9A","grid":"#DDA0DD","particles":"#DDA0DD","sticker":"#DDA0DD"}'::jsonb WHERE scene_id = 'electronics';
UPDATE scene_presets SET colors = '{"primary":"#FFD3B6","accent":"#FFB89A","alert":"#FF9A9A","grid":"#FFD3B6","particles":"#FFD3B6","sticker":"#FFD3B6"}'::jsonb WHERE scene_id = 'metal';
UPDATE scene_presets SET colors = '{"primary":"#FDFD96","accent":"#F0E68C","alert":"#FF9A9A","grid":"#FDFD96","particles":"#FDFD96","sticker":"#FDFD96"}'::jsonb WHERE scene_id = 'office';
