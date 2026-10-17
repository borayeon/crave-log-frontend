/**
 * CraveLog 하이브리드 트래픽 추적 유틸리티
 * 1. CraveLog 자체 백엔드 비콘 (100% 누락 없는 실제 데이터 수집)
 * 2. Google Analytics 4 (GA4) 태그 연동 (마케팅 및 유입 채널 분석)
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

// GA4 초기화 함수
export const initGoogleAnalytics = () => {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined') return;
  if (document.getElementById('ga-gtag-script')) return;

  try {
    const script = document.createElement('script');
    script.id = 'ga-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // SPA이므로 수동 page_view 전송
    });
  } catch (e) {
    console.debug('GA4 Init Error:', e);
  }
};

let debounceTimer = null;
let lastTrackedPath = null;
let pageEnterTime = Date.now();

// 1. 페이지 방문 및 체류 시간 추적
export const trackPlatformVisit = (path = '/') => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    if (path === lastTrackedPath) return;

    // 이전 화면 체류 시간 계산 (최대 30분 제한)
    const now = Date.now();
    const durationSeconds = lastTrackedPath
      ? Math.min(Math.max(Math.round((now - pageEnterTime) / 1000), 1), 1800)
      : null;
    pageEnterTime = now;
    lastTrackedPath = path;

    const payload = {
      path: path || window.location.pathname || '/',
      referer: document.referrer || '',
      durationSeconds: durationSeconds,
      eventType: 'PAGE_VIEW',
    };

    // A. CraveLog 자체 백엔드로 비콘 전송
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
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
      console.debug('Platform tracking error:', err);
    }

    // B. Google Analytics 4 (GA4) 이벤트 전송
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
      try {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_title: document.title || 'CraveLog',
        });
      } catch (e) {
        console.debug('GA4 PageView error:', e);
      }
    }
  }, 350);
};

// 2. 검색 이벤트 추적 (인기 검색어)
export const trackSearchEvent = (query = '') => {
  if (!query || query.trim() === '') return;
  const cleanQuery = query.trim();

  // A. CraveLog 백엔드로 비콘 전송
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const payload = {
      path: window.location.pathname || '/',
      referer: document.referrer || '',
      eventType: 'SEARCH',
      eventDetail: cleanQuery,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${apiUrl}/analytics/track`, blob);
    } else {
      fetch(`${apiUrl}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (e) {
    console.debug('Search tracking error:', e);
  }

  // B. GA4 검색 이벤트
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    try {
      window.gtag('event', 'search', {
        search_term: cleanQuery,
      });
    } catch (e) {
      console.debug('GA4 search error:', e);
    }
  }
};

// 3. 외부 링크 클릭 이벤트 추적 (유튜브, 원문 링크)
export const trackOutboundClick = (url = '', title = '') => {
  if (!url) return;

  // A. CraveLog 백엔드로 비콘 전송
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const payload = {
      path: window.location.pathname || '/',
      referer: document.referrer || '',
      eventType: 'OUTBOUND_CLICK',
      eventDetail: url,
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${apiUrl}/analytics/track`, blob);
    } else {
      fetch(`${apiUrl}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch (e) {
    console.debug('Outbound tracking error:', e);
  }

  // B. GA4 아웃바운드 클릭 이벤트
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    try {
      window.gtag('event', 'click', {
        outbound: true,
        link_url: url,
        link_text: title,
      });
    } catch (e) {
      console.debug('GA4 click error:', e);
    }
  }
};
