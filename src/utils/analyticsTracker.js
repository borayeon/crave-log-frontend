/**
 * CraveLog 플랫폼 트래픽 추적 유틸리티
 * SPA 페이지 전환 시 비동기로 백엔드에 방문 기록을 전송합니다.
 */

let debounceTimer = null;
let lastTrackedPath = null;

export const trackPlatformVisit = (path = '/') => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    // 동일 경로 연속 호출 방지
    if (path === lastTrackedPath) return;
    lastTrackedPath = path;

    try {
      const payload = {
        path: path || window.location.pathname || '/',
        referer: document.referrer || '',
      };

      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

      // sendBeacon 지원 시 최우선 사용 (페이지 이탈 시에도 안전)
      const beaconUrl = `${apiUrl}/analytics/track`;
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(beaconUrl, blob);
      } else {
        await fetch(beaconUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        });
      }
    } catch (err) {
      // 트래픽 로깅 실패가 사용자 화면에 영향을 주지 않도록 침묵 처리
      console.debug('Platform tracking error:', err);
    }
  }, 400);
};
