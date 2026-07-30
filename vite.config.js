import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cravelog.me', // ⭐️ 운영 서버로 타겟 변경!
        changeOrigin: true,
        secure: false, // 만약 HTTPS 인증서 문제가 생기면 무시
      },
    },
  },
})