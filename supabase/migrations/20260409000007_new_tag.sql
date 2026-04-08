-- "신규" 커스텀 태그 추가 (문의로 자동 등록된 기업용)
INSERT INTO tags (type, name, color)
VALUES ('custom', '신규', '#ff6644')
ON CONFLICT DO NOTHING;
