# 🪐 CraveLog - Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-1.21-F56565?style=for-the-badge&logo=feather&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

**나만의 직무 이력과 다채로운 취향을 한곳에 기록하고 공유하는 아카이빙 플랫폼**  
**CraveLog**의 프론트엔드 공식 레포지토리입니다.

[🌐 라이브 데모 바로가기](https://cravelog.me) · [🖥️ 관리자 콘솔 저장소](../crave-log-admin) · [⚙️ 백엔드 저장소](../crave-log-backend)

</div>

---

## 📖 목차 (Table of Contents)
- [✨ 프로젝트 개요 (Overview)](#-프로젝트-개요-overview)
- [🎯 주요 기능 (Key Features)](#-주요-기능-key-features)
- [🛠️ 기술 스택 (Tech Stack)](#️-기술-스택-tech-stack)
- [📁 디렉터리 구조 (Directory Structure)](#-디렉터리-구조-directory-structure)
- [🚀 시작하기 (Getting Started)](#-시작하기-getting-started)
- [🔐 환경 변수 설정 (.env)](#-환경-변수-설정-env)
- [🏛️ 아키텍처 및 상태 관리](#️-아키텍처-및-상태-관리)
- [📊 하이브리드 트래픽 추적 시스템](#-하이브리드-트래픽-추적-시스템)
- [🌐 배포 가이드 (Deployment)](#-배포-가이드-deployment)

---

## ✨ 프로젝트 개요 (Overview)

**CraveLog**는 사용자가 커리어(Developer, Career) 정보뿐만 아니라 덕질, 일상, 취미(Idol, Favorites) 등 **자신을 구성하는 모든 취향과 발자취**를 우아한 하나의 링크(Link-in-bio)로 표현할 수 있도록 설계된 차세대 프로필 아카이빙 서비스입니다.

- **페르소나 분리**: 전문적인 포트폴리오와 개인적인 취향을 탭별로 분리 관리
- **프라이버시 중심**: 탭별/카테고리별 세밀한 공개 범위 및 암호(Passcode) 잠금
- **다국어 지원**: 글로벌 사용자를 위한 한국어 / 영어 / 중국어 완벽 대응
- **반응형 디자인**: 모바일, 태블릿, 데스크톱에 최적화된 반응형 글래스모피즘 UI

---

## 🎯 주요 기능 (Key Features)

### 👤 1. 다이내믹 프로필 & 페르소나 온보딩
- URL 파라미터(`?u=handle`) 기반의 부드러운 프로필 조회 및 호스트/게스트 뷰 자동 분기
- 신규 유저 진입 시 직무 및 관심사 프리셋을 간편 설정하는 **Onboarding Persona Modal**
- 직관적인 프로필 편집기(`EditProfileView`): 아바타, 바이오, SNS 링크, 카테고리 트리 편집

### 🔒 2. 정밀한 프라이버시 & 암호 잠금 (Access Control)
- 카테고리 탭별 개별 공개 설정 (`전체 공개` / `나만 보기` / `비밀번호 잠금`)
- 비밀번호 설정 시 모달(`PasscodeModal`)을 통한 원타임 세션 잠금 해제 지원
- 비인가 게스트의 비공개 콘텐츠 접근 원천 차단

### 🗂️ 3. 다중 뷰 모드 (Multi-View Layouts)
- **타임라인 뷰 (`TimelineView`)**: 날짜 순 인터랙티브 타임라인, 카테고리 트리 계층 필터링
- **아카이브 뷰 (`ArchiveView`)**: 감각적인 앨범/그리드 카드 갤러리 UI 및 미디어 프리뷰
- **상세 모달 (`RecordDetailModal`)**: 이미지 슬라이더, 본문 마크다운, 태그, 유튜브 및 외부 링크 연동

### 🌐 4. 글로벌 다국어 지원 (i18n)
- `src/utils/i18n.js`를 통한 통합 다국어 딕셔너리 구축 (한국어 / English / 中文)
- 상단 네비게이션 바에서 원클릭 언어 전환 및 `localStorage` 유지

### 📈 5. 실시간 방문자 통계 모달 (`VisitStatsModal`)
- 프로필 소유자를 위한 일일 순 방문자(UV) 및 최근 7일간의 방문 추이 바 차트 제공
- 주간 최고 방문 기록 및 어제 대비 증감률 시각화

### 🔍 6. 고속 통합 검색 시스템 (`SearchView`)
- 사용자(유저 핸들/이름) 및 전체 공개 기록 실시간 통합 검색
- 최근 검색어 자동 저장 및 인기 검색 트래픽 비콘 자동 연동

---

## 🛠️ 기술 스택 (Tech Stack)

### Core & Framework
| 기술 | 버전 | 설명 |
| :--- | :--- | :--- |
| **React** | `^19.2.7` | 최신 React 19 아키텍처 및 훅 기반 렌더링 |
| **Vite** | `^8.1.0` | 초고속 HMR 및 빌드 번들러 |
| **Tailwind CSS** | `^4.3.1` | 최신 Tailwind v4 엔진 기반 유틸리티 스타일링 |
| **Lucide React** | `^1.21.0` | 모던하고 일관된 고품질 벡터 아이콘 팩 |
| **Oxlint** | `^1.69.0` | 고속 Rust 기반 JS/JSX 코드 정적 분석 도구 |

### Architecture Highlights
- **상태 관리**: React Context API (`AppStore.jsx`) 기반의 경량·고효율 중앙 스토어
- **통신**: Fetch API 기반 커스텀 인터셉터(`apiFetch`)로 JWT 자동 주입 및 401 갱신 처리
- **SEO & 메타**: 페이지/프로필별 동적 메타 태그 대응

---

## 📁 디렉터리 구조 (Directory Structure)

```text
crave-log-frontend/
├── public/                 # 파비콘 및 정적 에셋
├── src/
│   ├── assets/             # 로고, 플레이스홀더 이미지 등
│   ├── components/
│   │   ├── common/         # 공용 재사용 컴포넌트
│   │   │   ├── AuthModal.jsx             # 로그인 / 회원가입 2-Step 인증 모달
│   │   │   ├── OnboardingPersonaModal.jsx# 신규 사용자 페르소나 온보딩
│   │   │   ├── CustomDateRangePicker.jsx # 기간 선택 필터
│   │   │   ├── EmptyState.jsx            # 빈 상태 UI
│   │   │   ├── ServiceInfoBanner.jsx     # 공지 및 서비스 안내 배너
│   │   │   └── Toast.jsx                 # 글로벌 토스트 알림
│   │   ├── features/       # 도메인 특화 모달 및 위젯
│   │   │   ├── AddRecordModal.jsx        # 기록 추가/수정 모달
│   │   │   ├── PasscodeModal.jsx         # 비밀번호 해제 모달
│   │   │   ├── PrivacyPolicyModal.jsx    # 개인정보처리방침 안내
│   │   │   ├── RecordDetailModal.jsx     # 기록 상세 조회 모달
│   │   │   ├── VisitStatsModal.jsx       # 프로필 방문자 통계 분석
│   │   │   ├── archive/                  # 아카이브 카드 뷰 컴포넌트
│   │   │   └── timeline/                 # 타임라인 카드 및 노드 컴포넌트
│   │   ├── layout/         # 레이아웃 네비게이션
│   │   │   ├── TopNavBar.jsx             # 상단 반응형 헤더 (검색, 언어, 프로필)
│   │   │   ├── MobileBottomNav.jsx       # 모바일 전용 하단 탭바
│   │   │   └── Sidebar.jsx               # 데스크톱 사이드바
│   │   └── Footer.jsx      # 공통 푸터
│   ├── pages/              # 주요 뷰 라우트
│   │   ├── LandingView.jsx               # 메인 랜딩 페이지
│   │   ├── ProfileView.jsx               # 사용자 프로필 메인 뷰
│   │   ├── TimelineView.jsx              # 타임라인 기록 뷰
│   │   ├── ArchiveView.jsx               # 갤러리 아카이브 뷰
│   │   ├── SearchView.jsx                # 통합 유저/기록 검색 뷰
│   │   ├── EditProfileView.jsx           # 프로필/페르소나 수정 뷰
│   │   ├── AccessControlView.jsx         # 탭별 공개범위/암호 설정 뷰
│   │   ├── AccountSettingsView.jsx       # 계정 보안 및 비밀번호 변경
│   │   └── NotFoundView.jsx              # 404 에러 화면
│   ├── store/
│   │   └── AppStore.jsx    # 사용자 세션, 다국어, 토스트, API 통신 중앙 관리
│   ├── utils/
│   │   ├── analyticsTracker.js           # 비콘 & GA4 하이브리드 트래픽 추적
│   │   ├── i18n.js                       # 3개 국어(KO, EN, ZH) 다국어 사전
│   │   └── mediaUtils.js                 # 미디어 URL 정규화 및 리사이징 헬퍼
│   ├── App.jsx             # 애플리케이션 라우팅 및 뷰 오케스트레이션
│   ├── index.css           # 글로벌 테마 및 스타일 설정
│   └── main.jsx            # React 엔트리포인트
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 시작하기 (Getting Started)

### 1. 요구 사항 (Prerequisites)
- **Node.js**: `v18.0.0` 이상 권장 (LTS)
- **npm** 또는 **pnpm / yarn**

### 2. 레포지토리 클론 및 설치
```bash
# 1. 저장소 클론
git clone https://github.com/your-username/crave-log.git
cd crave-log/crave-log-frontend

# 2. 패키지 설치
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
기본적으로 `http://localhost:5173`에서 애플리케이션이 실행됩니다.

### 4. 린트 및 프로덕션 빌드
```bash
# 고속 Oxlint 코드 정적 검사
npm run lint

# 최적화 프로덕션 번들 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

---

## 🔐 환경 변수 설정 (.env)

프로젝트 루트(`/crave-log-frontend`)에 `.env` 파일을 생성하고 아래 변수를 정의합니다:

```env
# 백엔드 REST API 베이스 주소
VITE_API_BASE_URL=http://localhost:8080/api/v1

# 구글 애널리틱스 4 (GA4) 측정 ID (운영 배포 시 적용)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **💡 로컬 통계 오염 방지 (Option B 적용)**:  
> `localhost`, `127.0.0.1` 등 로컬 개발 환경에서는 GA4 스크립트 전송이 자동 제외되어 구글 애널리틱스 실운영 통계가 오염되지 않습니다. 자체 백엔드 비콘은 정상 수집됩니다.

---

## 🏛️ 아키텍처 및 상태 관리

### AppStore (`src/store/AppStore.jsx`)
- **인증 세션**: JWT 토큰 로컬스토리지 동기화, 자동 로그인 복원, 로그아웃 이벤트 처리
- **API Fetcher (`apiFetch`)**: 모든 백엔드 HTTP 요청에 대해 `Authorization: Bearer <token>` 헤더를 자동 주입하며 401(Unauthorized) 응답 시 자동 세션 만료 및 재로그인 안내
- **글로벌 UI 상태**: 토스트 메시지 큐(`showToast`), 다국어 현재 언어(`currentLang`) 저장

---

## 📊 하이브리드 트래픽 추적 시스템

`src/utils/analyticsTracker.js`를 통해 **자체 비콘**과 **GA4**를 유기적으로 병행 수집합니다:

1. **페이지뷰 & 체류 시간 (Duration)**:
   - 라우트 진입 시 350ms 디바운스를 거쳐 유효 방문을 기록
   - 페이지 전환 시 이전 화면의 체류 시간을 자동 계산하여 백엔드로 전달
   - **페이지 이탈(탭 닫기, 백그라운드 전환)** 시 `visibilitychange` 및 `pagehide` 이벤트를 감지하여 마지막 체류 시간을 `navigator.sendBeacon`으로 무손실 전송
2. **이벤트 추적**:
   - `trackSearchEvent`: 사용자가 입력한 검색 키워드 집계
   - `trackOutboundClick`: 게시글 내 첨부된 유튜브 영상 및 외부 링크 클릭률 수집

---

## 🌐 배포 가이드 (Deployment)

### Vercel 배포 시
- **Root Directory**: `crave-log-frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA 라우팅 (`vercel.json`)**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 📄 라이선스 (License)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
