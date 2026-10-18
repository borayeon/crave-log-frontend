/**
 * CraveLog i18n Translation Dictionary and Utilities
 * Supported Languages:
 *   - 'ko': 한국어 (Default)
 *   - 'en': English
 *   - 'zh': 简体中文 (Chinese Simplified)
 */

export const SUPPORTED_LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'zh', label: '简体中文', flag: '🇨🇳', short: 'ZH' },
];

export const translations = {
  ko: {
    // Languages
    'lang.ko': '한국어',
    'lang.en': 'English',
    'lang.zh': '简体中文',
    'lang.select': '언어 선택',

    // Navigation & View Titles
    'nav.home': '홈 / 소개',
    'nav.home_full': '홈 / 소개 (Home)',
    'nav.profile': '프로필',
    'nav.profile_full': '프로필 (Profile)',
    'nav.my_profile': '내 프로필',
    'nav.edit_profile': '프로필 설정',
    'nav.edit_profile_full': '프로필 설정 (Set Profile)',
    'nav.archive': '컬렉션',
    'nav.archive_full': '컬렉션 (Collection)',
    'nav.timeline': '타임라인',
    'nav.timeline_full': '타임라인 (Timeline)',
    'nav.access_control': '공개 권한 & 팔로우',
    'nav.account_settings': '계정 설정',
    'nav.account_settings_full': '계정 설정 (Settings)',
    'nav.search': '검색 결과',
    'nav.search_full': '검색 결과 (Search)',
    'nav.intro_short': '소개',
    'nav.access_short': '공개/팔로우',

    // Header & User Menu
    'header.search_placeholder': '사용자 및 기록 검색...',
    'header.search_btn': '검색하기',
    'header.new_record': '새 기록',
    'header.login': '로그인',
    'header.logout': '로그아웃',
    'header.mypage': '마이페이지',
    'header.access_control': '공개 권한 & 팔로우',
    'header.account_settings': '계정 설정',
    'header.guest_mode_on': '게스트 뷰 체험',
    'header.guest_mode_off': '내 프로필로 복귀',
    'header.about': 'CraveLog 소개',
    'header.user_menu': '사용자 메뉴',
    'header.home_tooltip_user': '내 프로필로 이동',
    'header.home_tooltip_guest': 'CraveLog 홈 / 소개로 이동',

    // Common Actions
    'common.save': '저장',
    'common.cancel': '취소',
    'common.edit': '수정',
    'common.delete': '삭제',
    'common.confirm': '확인',
    'common.close': '닫기',
    'common.add': '추가',
    'common.activate': '활성화',
    'common.deactivate': '비활성화',
    'common.share': '공유',
    'common.copy_link': '링크 복사',
    'common.loading': '불러오는 중...',
    'common.all': '전체',
    'common.more': '더보기',
    'common.settings': '설정',

    // Privacy & Access Levels (4-step security)
    'privacy.level0': '전체 공개',
    'privacy.level0_desc': '모든 방문자에게 공개됩니다.',
    'privacy.level1': '팔로워 공개',
    'privacy.level1_desc': '수락된 팔로워만 열람할 수 있습니다.',
    'privacy.level2': 'PIN 잠금',
    'privacy.level2_desc': '설정한 비밀번호를 입력해야 열람할 수 있습니다.',
    'privacy.level4': '나만 보기',
    'privacy.level4_desc': '오직 본인만 볼 수 있는 비공개 영역입니다.',

    // Personas & Sub-tabs
    'persona.developer': '개발자',
    'persona.career': '커리어/이력',
    'persona.idol': '덕질/취향',
    'persona.custom': '커스텀 탭',
    'persona.deactivated_title': '비활성화된 페르소나',
    'persona.deactivated_desc': '현재 숨김 상태인 페르소나입니다. 언제든 다시 활성화할 수 있습니다.',
    'persona.reactivate': '활성화하기',
    'persona.deactivate_btn': '페르소나 비활성화',
    'persona.tab_add': '탭 추가',

    // Onboarding Starter Presets
    'onboarding.title': 'CraveLog에 오신 것을 환영합니다! 🎉',
    'onboarding.subtitle': '나만의 취향과 성향을 담을 시작 프리셋을 선택해보세요.',
    'onboarding.preset_dev': '개발자 중심 프리셋',
    'onboarding.preset_dev_desc': '기술 스택, 프로젝트, 아키텍처 중심으로 프로필을 구성합니다.',
    'onboarding.preset_fan': '취향 & 덕질 프리셋',
    'onboarding.preset_fan_desc': '좋아하는 아티스트, 취향, 관심사 위주로 아기자기하게 구성합니다.',
    'onboarding.preset_all': '올인원 (모든 페르소나)',
    'onboarding.preset_all_desc': '개발, 이력서, 취향 탭을 모두 활성화하여 풍부하게 시작합니다.',
    'onboarding.preset_minimal': '미니멀 (기본 프로필)',
    'onboarding.preset_minimal_desc': '심플한 자기소개와 링크로 가볍게 시작합니다.',
    'onboarding.start_btn': '이 프리셋으로 시작하기',
    'onboarding.skip': '나중에 설정하기 (건너뛰기)',

    // Toasts & Alerts
    'toast.login_required': '로그인이 필요한 서비스입니다. 🔒',
    'toast.logged_out': '로그아웃 되었습니다. 👋',
    'toast.link_copied': '링크가 클립보드에 복사되었습니다! 📋',
    'toast.lang_changed': '언어가 변경되었습니다.',
    'toast.saved': '성공적으로 저장되었습니다! ✅',
    'toast.deleted': '삭제되었습니다. 🗑️',
    'toast.preset_applied': '선택하신 프리셋이 적용되었습니다! 🚀',
    'toast.persona_deactivated': '페르소나가 비활성화되었습니다.',
    'toast.persona_activated': '페르소나가 활성화되었습니다.',

    // Sidebar & Info Cards
    'sidebar.banner1_badge': 'Portfolio 2.0',
    'sidebar.banner1_title': '새로운 차원의 프로필',
    'sidebar.banner1_desc': '이력서나 포트폴리오를 넘어, 나라는 사람의 취향과 성향을 아카이빙합니다.',
    'sidebar.banner2_badge': 'Archive',
    'sidebar.banner2_title': '기록의 재발견',
    'sidebar.banner2_desc': '파편화된 지식부터 소소한 일상까지 모든 기록을 나만의 색깔로 안전하게 보관하세요.',
    'sidebar.banner3_badge': 'Networking',
    'sidebar.banner3_title': '간편한 네트워킹',
    'sidebar.banner3_desc': '복잡한 설명 없이 잘 꾸며진 프로필 링크 하나로 나를 가장 완벽하게 소개해보세요.',
    'sidebar.desc_home': 'CraveLog 시작하기',
    'sidebar.desc_profile': '나를 소개하는 공간',
    'sidebar.desc_archive': '내 취향 모아보기',
    'sidebar.desc_timeline': '시간순 기록장',
    'sidebar.desc_access': '기록 보안 및 인맥 관리',

    // Auth Modal
    'auth.login_tab': '로그인',
    'auth.signup_tab': '회원가입',
    'auth.email': '이메일 주소',
    'auth.password': '비밀번호',
    'auth.handle': '사용자 핸들 (@아이디)',
    'auth.name': '닉네임 / 이름',
    'auth.login_btn': '로그인하기',
    'auth.signup_btn': '가입하기',
    'auth.guest_continue': '게스트로 둘러보기',
  },

  en: {
    // Languages
    'lang.ko': '한국어 (Korean)',
    'lang.en': 'English',
    'lang.zh': '简体中文 (Chinese)',
    'lang.select': 'Language',

    // Navigation & View Titles
    'nav.home': 'Home / Intro',
    'nav.home_full': 'Home / Intro',
    'nav.profile': 'Profile',
    'nav.profile_full': 'Profile',
    'nav.my_profile': 'My Profile',
    'nav.edit_profile': 'Edit Profile',
    'nav.edit_profile_full': 'Edit Profile',
    'nav.archive': 'Collection',
    'nav.archive_full': 'Collection',
    'nav.timeline': 'Timeline',
    'nav.timeline_full': 'Timeline',
    'nav.access_control': 'Access & Follows',
    'nav.account_settings': 'Settings',
    'nav.account_settings_full': 'Account Settings',
    'nav.search': 'Search',
    'nav.search_full': 'Search Results',
    'nav.intro_short': 'Intro',
    'nav.access_short': 'Access',

    // Header & User Menu
    'header.search_placeholder': 'Search users & records...',
    'header.search_btn': 'Search',
    'header.new_record': 'New Record',
    'header.login': 'Log In',
    'header.logout': 'Log Out',
    'header.mypage': 'My Page',
    'header.access_control': 'Access & Follows',
    'header.account_settings': 'Account Settings',
    'header.guest_mode_on': 'Preview Guest View',
    'header.guest_mode_off': 'Return to My Profile',
    'header.about': 'About CraveLog',
    'header.user_menu': 'User Menu',
    'header.home_tooltip_user': 'Go to My Profile',
    'header.home_tooltip_guest': 'Go to CraveLog Home',

    // Common Actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.add': 'Add',
    'common.activate': 'Activate',
    'common.deactivate': 'Deactivate',
    'common.share': 'Share',
    'common.copy_link': 'Copy Link',
    'common.loading': 'Loading...',
    'common.all': 'All',
    'common.more': 'More',
    'common.settings': 'Settings',

    // Privacy & Access Levels (4-step security)
    'privacy.level0': 'Public',
    'privacy.level0_desc': 'Visible to everyone.',
    'privacy.level1': 'Followers Only',
    'privacy.level1_desc': 'Visible only to accepted followers.',
    'privacy.level2': 'PIN Protected',
    'privacy.level2_desc': 'Requires PIN passcode to view.',
    'privacy.level4': 'Private',
    'privacy.level4_desc': 'Only visible to you.',

    // Personas & Sub-tabs
    'persona.developer': 'Developer',
    'persona.career': 'Career',
    'persona.idol': 'Favorites & Fandom',
    'persona.custom': 'Custom Tab',
    'persona.deactivated_title': 'Deactivated Personas',
    'persona.deactivated_desc': 'These personas are currently hidden. You can re-activate them anytime.',
    'persona.reactivate': 'Re-activate',
    'persona.deactivate_btn': 'Deactivate Persona',
    'persona.tab_add': 'Add Tab',

    // Onboarding Starter Presets
    'onboarding.title': 'Welcome to CraveLog! 🎉',
    'onboarding.subtitle': 'Choose a starter preset to shape your unique profile.',
    'onboarding.preset_dev': 'Developer Focus',
    'onboarding.preset_dev_desc': 'Tailored for tech stack, projects, and engineering insights.',
    'onboarding.preset_fan': 'Fandom & Lifestyle',
    'onboarding.preset_fan_desc': 'Archive your favorite artists, tastes, and culture.',
    'onboarding.preset_all': 'All-in-One (All Personas)',
    'onboarding.preset_all_desc': 'Enable developer, career, and fandom tabs together.',
    'onboarding.preset_minimal': 'Minimal (Simple Profile)',
    'onboarding.preset_minimal_desc': 'Start lightweight with just basic bio and essential links.',
    'onboarding.start_btn': 'Start with this preset',
    'onboarding.skip': 'Skip for now',

    // Toasts & Alerts
    'toast.login_required': 'Login is required for this service. 🔒',
    'toast.logged_out': 'Logged out successfully. 👋',
    'toast.link_copied': 'Link copied to clipboard! 📋',
    'toast.lang_changed': 'Language has been updated.',
    'toast.saved': 'Saved successfully! ✅',
    'toast.deleted': 'Deleted successfully. 🗑️',
    'toast.preset_applied': 'Starter preset applied! 🚀',
    'toast.persona_deactivated': 'Persona has been deactivated.',
    'toast.persona_activated': 'Persona has been activated.',

    // Sidebar & Info Cards
    'sidebar.banner1_badge': 'Portfolio 2.0',
    'sidebar.banner1_title': 'Next-Gen Profile',
    'sidebar.banner1_desc': 'Beyond resumes, archive your personal identity, tastes, and vibes.',
    'sidebar.banner2_badge': 'Archive',
    'sidebar.banner2_title': 'Rediscover Notes',
    'sidebar.banner2_desc': 'From fragmented knowledge to daily moments, keep everything in your own style.',
    'sidebar.banner3_badge': 'Networking',
    'sidebar.banner3_title': 'Effortless Networking',
    'sidebar.banner3_desc': 'Introduce yourself perfectly with just one well-crafted profile link.',
    'sidebar.desc_home': 'Get Started with CraveLog',
    'sidebar.desc_profile': 'Your Personal Space',
    'sidebar.desc_archive': 'Browse Curated Tastes',
    'sidebar.desc_timeline': 'Chronological Log',
    'sidebar.desc_access': 'Privacy & Network Management',

    // Auth Modal
    'auth.login_tab': 'Log In',
    'auth.signup_tab': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.handle': 'User Handle (@id)',
    'auth.name': 'Nickname / Name',
    'auth.login_btn': 'Log In',
    'auth.signup_btn': 'Create Account',
    'auth.guest_continue': 'Explore as Guest',
  },

  zh: {
    // Languages
    'lang.ko': '韩语 (한국어)',
    'lang.en': '英语 (English)',
    'lang.zh': '简体中文',
    'lang.select': '选择语言',

    // Navigation & View Titles
    'nav.home': '首页 / 介绍',
    'nav.home_full': '首页 / 介绍 (Home)',
    'nav.profile': '个人主页',
    'nav.profile_full': '个人主页 (Profile)',
    'nav.my_profile': '我的主页',
    'nav.edit_profile': '编辑资料',
    'nav.edit_profile_full': '编辑资料 (Settings)',
    'nav.archive': '收藏集',
    'nav.archive_full': '收藏集 (Collection)',
    'nav.timeline': '时间线',
    'nav.timeline_full': '时间线 (Timeline)',
    'nav.access_control': '公开权限与关注',
    'nav.account_settings': '账号设置',
    'nav.account_settings_full': '账号设置 (Settings)',
    'nav.search': '搜索结果',
    'nav.search_full': '搜索结果 (Search)',
    'nav.intro_short': '介绍',
    'nav.access_short': '权限/关注',

    // Header & User Menu
    'header.search_placeholder': '搜索用户与记录...',
    'header.search_btn': '搜索',
    'header.new_record': '新建记录',
    'header.login': '登录',
    'header.logout': '退出登录',
    'header.mypage': '个人中心',
    'header.access_control': '公开权限与关注',
    'header.account_settings': '账号设置',
    'header.guest_mode_on': '体验访客视图',
    'header.guest_mode_off': '返回我的主页',
    'header.about': '关于 CraveLog',
    'header.user_menu': '用户菜单',
    'header.home_tooltip_user': '返回我的主页',
    'header.home_tooltip_guest': '返回 CraveLog 首页',

    // Common Actions
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.confirm': '确认',
    'common.close': '关闭',
    'common.add': '添加',
    'common.activate': '启用',
    'common.deactivate': '停用',
    'common.share': '分享',
    'common.copy_link': '复制链接',
    'common.loading': '加载中...',
    'common.all': '全部',
    'common.more': '查看更多',
    'common.settings': '设置',

    // Privacy & Access Levels (4-step security)
    'privacy.level0': '公开',
    'privacy.level0_desc': '所有人均可浏览。',
    'privacy.level1': '仅关注者',
    'privacy.level1_desc': '仅允许已确认的关注者查看。',
    'privacy.level2': 'PIN密码保护',
    'privacy.level2_desc': '需输入访问密码才能查看。',
    'privacy.level4': '仅自己可见',
    'privacy.level4_desc': '仅本人可见的私密空间。',

    // Personas & Sub-tabs
    'persona.developer': '开发者',
    'persona.career': '职业履历',
    'persona.idol': '偶像与爱好',
    'persona.custom': '自定义标签',
    'persona.deactivated_title': '已停用的角色',
    'persona.deactivated_desc': '当前隐藏的角色标签，您可以随时重新启用。',
    'persona.reactivate': '重新启用',
    'persona.deactivate_btn': '停用该角色',
    'persona.tab_add': '添加标签',

    // Onboarding Starter Presets
    'onboarding.title': '欢迎来到 CraveLog！🎉',
    'onboarding.subtitle': '请选择一个初始预设，开启您的个性化主页。',
    'onboarding.preset_dev': '开发者专属预设',
    'onboarding.preset_dev_desc': '以技术栈、项目经历与技术思考为核心。',
    'onboarding.preset_fan': '同好与生活预设',
    'onboarding.preset_fan_desc': '围绕喜爱的偶像、兴趣爱好及日常生活进行记录。',
    'onboarding.preset_all': '全能型（启用所有角色）',
    'onboarding.preset_all_desc': '同时启用开发者、求职和爱好标签，功能最丰富。',
    'onboarding.preset_minimal': '极简主义（基础资料）',
    'onboarding.preset_minimal_desc': '从简单的自我介绍与常用链接开始，轻量无负担。',
    'onboarding.start_btn': '使用此预设开启',
    'onboarding.skip': '稍后设置（跳过）',

    // Toasts & Alerts
    'toast.login_required': '此功能需要登录才能使用。🔒',
    'toast.logged_out': '已成功退出登录。👋',
    'toast.link_copied': '链接已复制到剪贴板！📋',
    'toast.lang_changed': '语言设置已更新。',
    'toast.saved': '保存成功！✅',
    'toast.deleted': '已删除。🗑️',
    'toast.preset_applied': '初始预设已成功应用！🚀',
    'toast.persona_deactivated': '角色已成功停用。',
    'toast.persona_activated': '角色已成功启用。',

    // Sidebar & Info Cards
    'sidebar.banner1_badge': 'Portfolio 2.0',
    'sidebar.banner1_title': '全新维度的个人名片',
    'sidebar.banner1_desc': '超越传统简历，收纳属于你的个人品味与独特魅力。',
    'sidebar.banner2_badge': 'Archive',
    'sidebar.banner2_title': '重温点滴记录',
    'sidebar.banner2_desc': '从碎片化知识到日常生活，以专属色彩安全归档。',
    'sidebar.banner3_badge': 'Networking',
    'sidebar.banner3_title': '轻松连接与分享',
    'sidebar.banner3_desc': '无需冗长赘述，仅凭一个精致的专属链接完美展示自己。',
    'sidebar.desc_home': '开始体验 CraveLog',
    'sidebar.desc_profile': '展示自我的个人空间',
    'sidebar.desc_archive': '浏览精选收藏',
    'sidebar.desc_timeline': '时间轴记录簿',
    'sidebar.desc_access': '隐私权限与社交网络管理',

    // Auth Modal
    'auth.login_tab': '登录',
    'auth.signup_tab': '注册',
    'auth.email': '电子邮箱',
    'auth.password': '登录密码',
    'auth.handle': '用户名 (@账号)',
    'auth.name': '昵称 / 姓名',
    'auth.login_btn': '立即登录',
    'auth.signup_btn': '创建新账号',
    'auth.guest_continue': '以访客身份浏览',
  }
};

/**
 * Translate a key into the given language with fallback support
 * @param {string} key - Translation key
 * @param {string} lang - 'ko' | 'en' | 'zh'
 * @param {string} [fallback] - Fallback text if key not found
 * @returns {string}
 */
export const translate = (key, lang = 'ko', fallback = '') => {
  const currentLangDict = translations[lang] || translations.ko;
  if (currentLangDict && currentLangDict[key] !== undefined) {
    return currentLangDict[key];
  }
  // Fallback to Korean
  if (translations.ko && translations.ko[key] !== undefined) {
    return translations.ko[key];
  }
  return fallback || key;
};

/**
 * Detect browser initial language
 * @returns {'ko' | 'en' | 'zh'}
 */
export const detectInitialLang = () => {
  if (typeof window === 'undefined') return 'ko';
  const saved = localStorage.getItem('cravelog_lang');
  if (saved && (saved === 'ko' || saved === 'en' || saved === 'zh')) {
    return saved;
  }
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (navLang.startsWith('zh')) return 'zh';
  if (navLang.startsWith('en')) return 'en';
  return 'ko';
};
