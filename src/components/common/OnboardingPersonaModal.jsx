import React, { useState } from 'react';
import { 
  Sparkles, Check, ArrowRight, Code, Terminal, Briefcase, 
  CreditCard, MessageSquare, Palette, Compass, Quote, FileText, 
  Grid, UserPlus, X as CloseIcon, Loader2, ShieldCheck, Heart, Layers
} from 'lucide-react';
import { useAppStore } from '../../store/AppStore';
import { DEFAULT_PERSONAS } from '../../pages/EditProfileView';

// ⭐️ 시작 페르소나 프리셋 목록 정의
export const getOnboardingPersonas = (currentLang = 'ko') => [
  {
    id: 'portfolio',
    emoji: '💼',
    name: currentLang === 'zh' ? '开发者 & 技术作品集' : currentLang === 'en' ? 'Developer & Tech Portfolio' : '개발자 & 테크 포트폴리오',
    subtitle: 'Developer & Career',
    tagline: currentLang === 'zh' ? '展示工程师专业实力与技术深度的科技风主页' : currentLang === 'en' ? 'Tech-focused profile highlighting engineering expertise' : '전문성과 기술 역량을 어필하는 테크 중심 프로필',
    desc: currentLang === 'zh' ? '以技术栈、项目经历、学经历程与数字名片展示工程师专业实力。' : currentLang === 'en' ? 'Showcase tech stack, projects, resume, and digital business card.' : '기술 스택, 프로젝트 경험, 학력/경력 이력서, 디지털 명함으로 개발 커리어를 완벽하게 보여줍니다.',
    tags: ['#Developer', '#Resume', '#Portfolio', '#TechStack'],
    color: 'from-blue-500 to-indigo-600',
    borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30',
    badgeBg: 'bg-indigo-100 text-indigo-700',
    tabs: ['developer', 'developer2', 'career', 'businessCard']
  },
  {
    id: 'social',
    emoji: '🍻',
    name: currentLang === 'zh' ? '社交 & 兴趣生活' : currentLang === 'en' ? 'Social & Lifestyle' : '친목 & 소셜 네트워킹',
    subtitle: 'Social & Lifestyle',
    tagline: currentLang === 'zh' ? '自由展示个人魅力与独特品味的生动主页' : currentLang === 'en' ? 'Express personality and taste freely' : '나만의 매력과 취향을 자유롭게 표현하는 프로필',
    desc: currentLang === 'zh' ? '通过MBTI、百问百答采访、爱好、像素画与随笔展现生动有趣的自己。' : currentLang === 'en' ? 'Express personality with MBTI, 100 Q&A interview, hobbies, and pixel dot art.' : 'MBTI, 100문 100답 인터뷰, 즐겨하는 취미, 픽셀 도트 아트와 메모로 친근하고 매력적인 나를 소개합니다.',
    tags: ['#Social', '#Networking', '#QnA', '#Lifestyle'],
    color: 'from-amber-500 to-orange-500',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/30',
    badgeBg: 'bg-amber-100 text-amber-800',
    tabs: ['addProfile', 'qna', 'hobby', 'art', 'memo']
  },
  {
    id: 'vision',
    emoji: '💖',
    name: currentLang === 'zh' ? '自我成长与愿景规划' : currentLang === 'en' ? 'Growth & Mandalart' : '자기성장 & 비전 달성',
    subtitle: 'Growth & Mandalart',
    tagline: currentLang === 'zh' ? '将目标、灵感与核心价值观可视化的成长档案' : currentLang === 'en' ? 'Growth archive visualizing goals and values' : '목표와 영감, 가치관을 시각화하는 성장 아카이브',
    desc: currentLang === 'zh' ? '用9x9曼陀罗目标计划表、人生名言录与成长笔记记录进阶之路。' : currentLang === 'en' ? 'Visualize goals with 9x9 Mandalart, inspiring quotes, and self-growth reflections.' : '9x9 만다라트 목표 달성 계획표, 가슴을 울린 인생 명언집, 상세 소개와 Q&A로 성장의 여정을 기록합니다.',
    tags: ['#Growth', '#Mandalart', '#Vision', '#Quotes'],
    color: 'from-rose-500 to-pink-600',
    borderActive: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30',
    badgeBg: 'bg-rose-100 text-rose-700',
    tabs: ['addProfile', 'vision', 'quotes', 'qna', 'hobby']
  },
  {
    id: 'creator',
    emoji: '🎨',
    name: currentLang === 'zh' ? '创作者与灵感画廊' : currentLang === 'en' ? 'Creator & Archive' : '크리에이터 & 갤러리',
    subtitle: 'Creator & Archive',
    tagline: currentLang === 'zh' ? '收录个人作品、兴趣爱好与灵感火花的专属展厅' : currentLang === 'en' ? 'Personal gallery gathering hobbies and creative inspirations' : '취미와 창작물, 영감을 모아두는 나만의 갤러리',
    desc: currentLang === 'zh' ? '用兴趣相册画廊、15x15像素画布与创意灵感便签填满专属空间。' : currentLang === 'en' ? 'Fill your space with photo gallery, 15x15 dot art, and creative memos.' : '취미 사진 갤러리, 15x15 픽셀 아트 캔버스, 자유로운 생각 메모와 영감 문장들로 공간을 채웁니다.',
    tags: ['#Creator', '#Gallery', '#DotArt', '#Memo'],
    color: 'from-purple-500 to-violet-600',
    borderActive: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30',
    badgeBg: 'bg-purple-100 text-purple-700',
    tabs: ['hobby', 'art', 'memo', 'quotes', 'qna']
  },
  {
    id: 'minimal',
    emoji: '⚡',
    name: currentLang === 'zh' ? '极简主义与自主配置' : currentLang === 'en' ? 'Minimal & Custom' : '미니멀 & 직접 구성',
    subtitle: 'Minimal & Custom',
    tagline: currentLang === 'zh' ? '以最轻量的方式启程，仅添加必要的功能标签' : currentLang === 'en' ? 'Start simple and freely expand tabs anytime' : '가장 심플하게 시작하여 필요한 탭만 직접 추가',
    desc: currentLang === 'zh' ? '从最核心的基础资料开始，随时可在编辑页面通过[+ 添加标签]扩展。' : currentLang === 'en' ? 'Start simple with essential info, and freely expand tabs anytime.' : '핵심 기본 정보부터 가볍게 시작하며, 프로필 편집 화면에서 언제든 [+ 탭 추가]로 확장할 수 있습니다.',
    tags: ['#Simple', '#Minimal', '#Custom', '#AddTabs'],
    color: 'from-emerald-500 to-teal-600',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    tabs: ['developer', 'addProfile']
  }
];

export const ONBOARDING_PERSONAS = getOnboardingPersonas('ko');

// 각 서브 탭의 레이블 및 아이콘 매핑
export const getTabLabelMap = (currentLang = 'ko') => ({
  developer: { label: currentLang === 'zh' ? 'Developer (开发者)' : currentLang === 'en' ? 'Developer' : 'Developer (개발자)', icon: <Code size={12} /> },
  developer2: { label: currentLang === 'zh' ? 'Resume (简历)' : currentLang === 'en' ? 'Resume' : 'Resume (이력서)', icon: <Terminal size={12} /> },
  career: { label: currentLang === 'zh' ? 'Career (职业经历)' : currentLang === 'en' ? 'Career' : 'Career (커리어)', icon: <Briefcase size={12} /> },
  addProfile: { label: currentLang === 'zh' ? 'Profile (个人介绍)' : currentLang === 'en' ? 'Profile' : 'Profile (상세소개)', icon: <UserPlus size={12} /> },
  businessCard: { label: currentLang === 'zh' ? 'Business Card (数字名片)' : currentLang === 'en' ? 'Business Card' : 'Business Card (명함)', icon: <CreditCard size={12} /> },
  qna: { label: currentLang === 'zh' ? 'Q&A (百问百答)' : currentLang === 'en' ? 'Q&A' : 'Q&A (100문100답)', icon: <MessageSquare size={12} /> },
  hobby: { label: currentLang === 'zh' ? 'Hobby (兴趣爱好)' : currentLang === 'en' ? 'Hobby' : 'Hobby (취미)', icon: <Palette size={12} /> },
  vision: { label: currentLang === 'zh' ? 'Mandalart (曼陀罗)' : currentLang === 'en' ? 'Mandalart' : 'Mandalart (만다라트)', icon: <Compass size={12} /> },
  quotes: { label: currentLang === 'zh' ? 'Quotes (人生语录)' : currentLang === 'en' ? 'Quotes' : 'Quotes (명언집)', icon: <Quote size={12} /> },
  memo: { label: currentLang === 'zh' ? 'Memo (思考便签)' : currentLang === 'en' ? 'Memo' : 'Memo (메모장)', icon: <FileText size={12} /> },
  art: { label: currentLang === 'zh' ? 'Dot Art (像素艺术)' : currentLang === 'en' ? 'Dot Art' : 'Dot Art (도트아트)', icon: <Grid size={12} /> }
});

export const TAB_LABEL_MAP = getTabLabelMap('ko');

const OnboardingPersonaModal = () => {
  const { 
    onboardingModalOpen, 
    setOnboardingModalOpen, 
    user, 
    apiFetch, 
    fetchAllData, 
    setViewMode, 
    showToast,
    t,
    currentLang 
  } = useAppStore();

  const [selectedPersonaId, setSelectedPersonaId] = useState('portfolio');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⭐️ 다국어 지원이 적용된 시작 페르소나 및 서브 탭 매핑
  const localizedPersonas = getOnboardingPersonas(currentLang);
  const tabLabelMap = getTabLabelMap(currentLang);

  if (!onboardingModalOpen) return null;

  const currentPersona = localizedPersonas.find(p => p.id === selectedPersonaId) || localizedPersonas[0];

  const ONBOARDING_TO_PERSONA_MAP = {
    portfolio: 'portfolio',
    social: 'social',
    vision: 'dating',
    creator: 'fan',
    minimal: 'custom'
  };

  const handleApplyPersona = async () => {
    setIsSubmitting(true);
    try {
      const safeUser = JSON.parse(JSON.stringify(user || {}));

      // 1. 기존 페르소나 목록 또는 DEFAULT_PERSONAS 복사
      const basePersonas = safeUser.idol?.personas 
        ? JSON.parse(JSON.stringify(safeUser.idol.personas))
        : JSON.parse(JSON.stringify(DEFAULT_PERSONAS));

      const targetPersonaKey = ONBOARDING_TO_PERSONA_MAP[currentPersona.id] || currentPersona.id;

      // 2. ⭐️ 선택한 페르소나만 활성화(isActive: true)하고 나머지는 모두 비활성화(isActive: false)!
      const updatedPersonas = {};
      Object.keys(basePersonas).forEach(pKey => {
        if (pKey === 'all') return;
        const pObj = { ...basePersonas[pKey] };
        if (pKey === targetPersonaKey) {
          pObj.isActive = true;
          pObj.tabs = currentPersona.tabs;
          if (currentPersona.id === 'vision' && pKey === 'dating') {
            pObj.name = currentLang === 'zh' ? '💖 愿景与成长' : currentLang === 'en' ? '💖 Vision & Growth' : '💖 비전 & 성장';
            pObj.desc = currentLang === 'zh' ? '将目标与愿景可视化的成长档案' : currentLang === 'en' ? 'Growth archive visualizing goals and values' : '목표와 비전을 시각화하는 성장 아카이브';
          }
        } else {
          // ⭐️ 나머지 페르소나는 비활성화 처리
          pObj.isActive = false;
        }
        updatedPersonas[pKey] = pObj;
      });

      // 3. 페르소나 순서도 선택한 페르소나를 우선 배치
      const remainingPersonaKeys = Object.keys(updatedPersonas).filter(k => k !== targetPersonaKey);
      const updatedPersonaOrder = ['all', targetPersonaKey, ...remainingPersonaKeys];

      // 4. 서브 탭 tabOrder 및 페르소나 정보 업데이트
      const updatedIdol = {
        ...(safeUser.idol || {}),
        tabOrder: currentPersona.tabs,
        personas: updatedPersonas,
        personaOrder: updatedPersonaOrder,
        onboardingCompleted: true,
        selectedPersona: targetPersonaKey
      };

      const payload = {
        ...safeUser,
        idol: updatedIdol
      };

      // 5. 백엔드 프로필 저장 API 호출
      const res = await apiFetch('/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchAllData();
        setOnboardingModalOpen(false);
        setViewMode('profile');
        showToast(currentLang === 'zh' ? `🎉 已成功设定为“${currentPersona.name}”模式！其余角色已自动停用。` : currentLang === 'en' ? `🎉 Configured to '${currentPersona.name}' mode! Other personas have been deactivated.` : `🎉 '${currentPersona.name}' 모드로 설정되었습니다! 선택한 페르소나 외 나머지는 비활성화되었습니다.`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || (currentLang === 'zh' ? '保存设置失败，请重试。' : currentLang === 'en' ? 'Failed to save settings. Please try again.' : '설정 저장에 실패했습니다. 다시 시도해주세요.'));
      }
    } catch (error) {
      console.error(error);
      showToast(currentLang === 'zh' ? '服务器连接发生错误。' : currentLang === 'en' ? 'Server connection error occurred.' : '서버 연결 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setOnboardingModalOpen(false);
    showToast(currentLang === 'zh' ? '以默认资料模式开始。您随时可通过 [+ 添加标签] 开启所需内容。' : currentLang === 'en' ? 'Starting in default profile mode. You can enable tabs anytime via [+ Add Tab].' : '기본 프로필 모드로 시작합니다. 언제든 [+ 탭 추가]로 원하는 탭을 켤 수 있습니다.');
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-zinc-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* 상단 닫기 버튼 */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors z-10"
          title={currentLang === 'zh' ? '跳过' : currentLang === 'en' ? 'Skip' : '건너뛰기'}
        >
          <CloseIcon size={20} />
        </button>

        {/* 모달 헤더 */}
        <div className="text-center pb-5 border-b border-zinc-100">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black mb-2 shadow-2xs">
            <Sparkles size={14} className="animate-spin text-indigo-500" style={{ animationDuration: '4s' }} />
            <span>{t('onboarding.guide_badge', 'CraveLog Welcome Guide')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {t('onboarding.main_q', '어떤 목적으로 프로필을 시작하시겠어요? ✨')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
            {t('onboarding.main_desc', '선택하시는 목적에 맞추어 꼭 필요한 서브 탭들을 자동으로 구성해드립니다.')}
          </p>
        </div>

        {/* 페르소나 선택 카드 리스트 */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            {localizedPersonas.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;

              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col gap-2 group ${
                    isSelected 
                      ? persona.borderActive 
                      : 'border-zinc-200/80 bg-white hover:border-zinc-300 hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 rounded-2xl bg-zinc-100/80 shrink-0 group-hover:scale-110 transition-transform">
                        {persona.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                            {persona.name}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${persona.badgeBg}`}>
                            {persona.subtitle}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          {persona.tagline}
                        </p>
                      </div>
                    </div>

                    {/* 선택 체크박스 아이콘 */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'border border-zinc-300 text-transparent group-hover:border-zinc-400'
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-600 font-medium pl-1 leading-relaxed">
                    {persona.desc}
                  </p>

                  {/* 자동 활성화되는 서브 탭 뱃지 리스트 */}
                  <div className="pt-2 border-t border-zinc-100/80 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mr-1">
                      {currentLang === 'zh' ? '自动启用标签' : currentLang === 'en' ? 'Auto-enabled Tabs' : '자동 활성화 탭'} ({persona.tabs.length}):
                    </span>
                    {persona.tabs.map(tabId => {
                      const tabInfo = tabLabelMap[tabId];
                      return (
                        <span 
                          key={tabId} 
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.8 rounded-lg bg-white border border-zinc-200 text-zinc-700 shadow-2xs"
                        >
                          {tabInfo?.icon}
                          <span>{tabInfo?.label || tabId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 모달 하단 액션 버튼 */}
        <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
          <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/70">
            <span className="text-indigo-600 font-black shrink-0">💡 {currentLang === 'zh' ? '提示:' : currentLang === 'en' ? 'Notice:' : '알림:'}</span>
            <span>{t('onboarding.note_text', '선택하신 페르소나만 프로필에 활성화되며, 나머지 페르소나는 비활성화되어 심플하게 시작합니다.')}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600 hover:underline transition-colors order-2 sm:order-1 cursor-pointer"
            >
              {t('onboarding.skip_btn', '다음에 선택할게요 (기본으로 시작)')}
            </button>

            <button
              type="button"
              onClick={handleApplyPersona}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-indigo-600 text-white text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2 group cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>{currentLang === 'zh' ? '正在应用配置...' : currentLang === 'en' ? 'Applying setup...' : '페르소나 구성 적용 중...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {currentLang === 'zh' ? `以“${currentPersona.name}”开启` : currentLang === 'en' ? `Start with '${currentPersona.name}'` : `'${currentPersona.name}'으로 시작하기`}
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPersonaModal;
