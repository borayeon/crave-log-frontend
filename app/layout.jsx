// app/layout.jsx
import './globals.css'; // 나중에 스타일을 위해 필요합니다

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}