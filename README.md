# CraveLog - Frontend (React)

나만의 취향과 이야기를 차곡차곡 기록하고 공유하는 아카이빙 플랫폼 **CraveLog**의 프론트엔드 레포지토리입니다.

---

# ✨ 프로젝트 소개 (About)

CraveLog는 사용자가 자신의 직무(Developer, Career) 정보와 개인적인 취향(Idol, Favorites)을 하나의 링크로 모아 아름답게 표현할 수 있는 서비스입니다.

태그 기반의 트리 구조를 통해 기록을 체계적으로 분류하고, 직관적인 타임라인 및 아카이브 뷰를 통해 사용자의 발자취를 우아하게 렌더링합니다.

---

# 🔗 Live Demo

> 배포 주소를 입력하세요.

```text
https://your-domain.com
```

---

# 🚀 기술 스택 (Tech Stack)

## Frontend

- React 18
- Vite

## Styling

- Tailwind CSS

## Icons

- Lucide React

## State Management

- Context API (`AppStore`)

## Deployment

- Vercel

---

# 🎯 주요 기능 (Key Features)

## 👤 다이내믹 프로필 렌더링

- URL 파라미터 (`?u=handle`) 기반 프로필 조회
- 호스트와 게스트 뷰 자동 분리
- 사용자별 커스텀 프로필 렌더링

## 🔒 프라이버시 컨트롤

- Developer
- Career
- Idol
- Favorites

각 탭별 공개 범위를 개별적으로 설정할 수 있습니다.

## 🗂️ 다중 뷰 모드 지원

### Timeline View

- 시간 순 기록 표시
- 카테고리 트리 편집 지원
- 태그 기반 분류 시스템

### Archive View

- 앨범 형태의 갤러리 UI
- 모달 기반 상세 보기
- 콘텐츠 아카이빙

## 🔎 최적화된 검색 시스템

- 전체 사용자 검색
- 전체 기록 검색
- 빈 입력 예외 처리
- 실시간 검색 경험 제공

## 🔐 2-Step 인증 UI

- 이메일 인증
- 로그인/회원가입 자동 분기
- 자연스러운 인증 플로우 제공

---

# 📁 디렉터리 구조 (Directory Structure)

```text
src/
├── store/
│   └── AppStore.jsx
│       └── 통합 상태 관리 및 API 통신
│
├── components/
│   ├── common/
│   │   └── Toast, AuthModal, EmptyState 등 재사용 컴포넌트
│   │
│   ├── layout/
│   │   └── TopNavBar, Sidebar, MobileBottomNav
│   │
│   └── features/
│       └── AddRecordModal 등 특정 기능 컴포넌트
│
├── pages/
│   └── Profile, Edit, Timeline 등 주요 화면
│
├── App.jsx
│   └── 애플리케이션 진입점 및 뷰 컨트롤러
│
└── index.css
    └── 글로벌 스타일 (Tailwind)
```

---

# 🛠️ 설치 및 실행 (Getting Started)

## 1. 저장소 클론

```bash
git clone https://github.com/your-username/cravelog-frontend.git

cd cravelog-frontend
```

## 2. 패키지 설치

```bash
npm install
```

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 추가합니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

> 배포 환경에서는 `window.location`을 기반으로 API 주소가 동적으로 연결됩니다.

## 4. 개발 서버 실행

```bash
npm run dev
```

---

# 🌐 배포 (Deployment)

프론트엔드는 Vercel을 통해 배포됩니다.

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉터리에 생성됩니다.

---

# 📸 스크린샷 (Screenshots)

프로젝트 화면 이미지를 추가하세요.

```text
assets/
├── home.png
├── profile.png
└── archive.png
```

---

# 📄 라이선스 (License)

이 프로젝트는 개인 포트폴리오 및 학습 목적으로 제작되었습니다.
