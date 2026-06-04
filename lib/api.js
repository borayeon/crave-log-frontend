import axios from 'axios';

const api = axios.create({
  // 백엔드 포트 8080을 바라보도록 설정
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: API를 전송하기 전에 항상 실행
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 카카오 로그인 토큰 추출
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;