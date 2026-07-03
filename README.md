CraveLog - Frontend (React)

[프로젝트 메인 이미지 또는 데모 GIF]

나만의 취향과 이야기를 차곡차곡 기록하고 공유하는 아카이빙 플랫폼, CraveLog의 프론트엔드 웹 애플리케이션입니다.

✨ 프로젝트 소개 (About)

CraveLog는 사용자가 자신의 직무(Developer, Career) 목표와 개인적인 취향(Idol, Favorites)을 하나의 링크로 모아 보여줄 수 있는 서비스입니다. 카테고리와 태그를 통해 기록을 체계적으로 관리하고, 직관적인 타임라인과 갤러리 뷰를 통해 과거의 기록을 예쁘게 열람할 수 있습니다.

🔗 Live Demo (실제 배포된 Vercel 링크로 수정해주세요)

🚀 기술 스택 (Tech Stack)

Library: React (Vite 기반)

Styling: Tailwind CSS

Icons: Lucide React

State Management: React Context API

Deployment: Vercel

🎯 주요 기능 (Key Features)

동적 프로필 (Dynamic Profile): 사용자 정보를 기반으로 탭 형식의 프로필 인터페이스 렌더링.

프라이버시 컨트롤: 각 탭(Developer, Career, Idol)별 공개/비공개 설정 및 미리보기 모드 지원.

트리 구조 태그 탐색기: 폴더(카테고리) 및 해시태그(태그) 기반의 기록 필터링 및 관리.

다양한 뷰 모드: 기록을 시간순으로 보여주는 Timeline View와 앨범처럼 모아보는 Archive View 제공.

모달 기반 인터랙션: 페이지 이동 없이 카카오 로그인 및 새 기록 작성을 처리하는 모달 UI.

이미지 처리: Base64 변환을 통한 파일 업로드 지원.

📁 프로젝트 구조 (Project Structure)

src/
├── components/
│   ├── common/      # 토스트, 로그인 모달, EmptyState 등 재사용 컴포넌트
│   ├── features/    # 기록 추가 등 특정 도메인 로직이 포함된 컴포넌트
│   └── layout/      # 네비게이션 바, 사이드바 등 화면의 뼈대를 이루는 컴포넌트
├── pages/           # Profile, Edit Profile, Archive, Timeline 등 주요 화면
├── store/           # Context API를 활용한 전역 상태 및 API 로직 관리 (AppStore.jsx)
├── App.jsx          # 메인 엔트리 및 라우팅 역할 수행
└── index.css        # Tailwind CSS 설정


🛠️ 설치 및 실행 (Getting Started)

사전 요구 사항 (Prerequisites)

Node.js (v16 이상 권장)

npm 또는 yarn

로컬 환경 실행 방법 (Running Locally)

Repository Clone:

git clone https://github.com/your-username/cravelog-frontend.git
cd cravelog-frontend


의존성 설치 (Install Dependencies):

npm install
# 또는
yarn install


환경 변수 설정:
프로젝트 루트 디렉토리에 .env 파일을 생성하고 백엔드 API 주소를 설정합니다.

VITE_API_BASE_URL=http://localhost:8080/api/v1


개발 서버 실행 (Start Development Server):

npm run dev
# 또는
yarn dev


실행 후 제공되는 로컬 주소(보통 http://localhost:5173)로 접속합니다.

🚢 배포 (Deployment)

이 프로젝트는 Vercel을 통해 배포되도록 최적화되어 있습니다.
Vercel 대시보드에서 프로젝트를 Import 한 후, Environment Variables 항목에 VITE_API_BASE_URL 값을 운영 중인 백엔드 API 주소(예: https://your-api.onrender.com/api/v1)로 설정해야 정상적으로 통신합니다.

📄 License

This project is licensed under the MIT License.
