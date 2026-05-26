"use client";
import { Instagram, Github } from 'lucide-react';

export const USER_DATA = {
  name: "태경", handle: "taekyeong.dev", role: "Backend Developer",
  location: "Seoul, South Korea", bio: "기록의 힘을 믿습니다. 일상의 소소한 파편들을 모아 나만의 깊고 고유한 우주를 만듭니다 🚀",
  status: "CraveLog 엔진 고도화 중", tags: ["Spring Boot", "Next.js", "MySQL", "Docker", "Running", "Specialty Coffee"]
};

export const SOCIAL_LINKS = [
  { id: 'insta', name: 'Instagram', icon: Instagram, url: '#', color: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' },
  { id: 'github', name: 'GitHub', icon: Github, url: '#', color: 'bg-[#18181b]' },
];

export const INITIAL_TIMELINE = [
  { id: 't1', date: "2026.05.20", title: "CraveLog UI 개편 작업", content: "옵시디언 스타일 물리 엔진 그래프 뷰 탑재.", tag: "개발" },
  { id: 't2', date: "2026.04.15", title: "마포 한강변 야간 러닝 시작", desc: "퇴근 후 바람 부는 마포 대교 아래를 달리니 막혔던 코딩 아이디어가 솟아난다.", tag: "일상" },
];

export const INITIAL_NODES = [
  { id: 'me', label: '나 (태경)', category: 'root', color: 'from-indigo-500 to-rose-400', size: 'lg', desc: 'CraveLog의 시작점', extra: '나의 Identity' },
  { id: 'info', label: '내 정보', parentId: 'me', category: '내 정보', color: 'from-blue-400 to-indigo-500', size: 'md', desc: '태경에 대한 기본 프로필 데이터' },
  { id: 'hobbies', label: '취미', parentId: 'me', category: '취미', color: 'from-amber-400 to-orange-500', size: 'md', desc: '좋아하고 열정을 불태우는 행동들' },
  { id: 'daily', label: '일상', parentId: 'me', category: '일상', color: 'from-emerald-400 to-teal-500', size: 'md', desc: '하루하루의 소소한 가치 기록' },
  { id: 'info-school', label: '학교', parentId: 'info', category: '내 정보', color: 'from-slate-400 to-slate-500', size: 'sm', desc: '컴퓨터공학 전공' },
  { id: 'hobby-movie', label: '영화', parentId: 'hobbies', category: '취미', color: 'from-slate-400 to-slate-500', size: 'sm', desc: '인터스텔라, 인셉션' },
];
