-- 샘플 행사 데이터
INSERT INTO events (title, description, start_date, end_date, header_image_url) VALUES
('2024 글로벌 비즈니스 매칭 데이', '국내외 기업과 바이어가 만나는 최대 규모의 비즈니스 매칭 행사입니다.', '2024-12-01', '2024-12-03', '/placeholder.svg?height=400&width=1200');

-- 샘플 기업 데이터
INSERT INTO companies (event_id, name, email, password_hash, description, website_url, industry, location) 
SELECT 
  e.id,
  company_data.name,
  company_data.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  company_data.description,
  company_data.website_url,
  company_data.industry,
  company_data.location
FROM events e,
(VALUES 
  ('삼성전자', 'samsung@company.com', '글로벌 전자기업으로 반도체, 스마트폰 등을 제조합니다.', 'https://samsung.com', '전자/IT', '서울'),
  ('LG화학', 'lg@company.com', '화학, 배터리, 소재 분야의 글로벌 리더입니다.', 'https://lgchem.com', '화학/소재', '서울'),
  ('현대자동차', 'hyundai@company.com', '글로벌 자동차 제조업체로 친환경 모빌리티를 선도합니다.', 'https://hyundai.com', '자동차', '울산'),
  ('네이버', 'naver@company.com', '국내 최대 포털 서비스와 글로벌 IT 서비스를 제공합니다.', 'https://naver.com', 'IT/인터넷', '경기'),
  ('카카오', 'kakao@company.com', '모바일 플랫폼과 디지털 콘텐츠 서비스를 제공합니다.', 'https://kakao.com', 'IT/인터넷', '경기')
) AS company_data(name, email, description, website_url, industry, location)
WHERE e.title = '2024 글로벌 비즈니스 매칭 데이';

-- 관리자 계정
INSERT INTO admins (email, password_hash, name, role) VALUES
('admin@impacmatching.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '시스템 관리자', 'super_admin');
