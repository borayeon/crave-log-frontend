export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop';

export const MUSIC_DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop';

export const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const getDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return null;
  }
};

export const getFaviconUrl = (domainOrUrl) => {
  if (!domainOrUrl) return '/favicon.svg';
  let domain = domainOrUrl;
  if (domainOrUrl.includes('://')) {
    domain = getDomain(domainOrUrl);
  }
  if (!domain) return '/favicon.svg';
  domain = domain.replace(/^www\./, '');
  if (domain === 'cravelog.me' || domain.includes('cravelog') || domain === 'localhost') {
    return '/favicon.svg';
  }
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export const getFallbackAvatarUrl = (text) => {
  const initial = (text || 'U').charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${initial}&background=EFF6FF&color=4F46E5&bold=true&size=128`;
};
