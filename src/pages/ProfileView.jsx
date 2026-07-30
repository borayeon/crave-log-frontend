import React, { useState } from 'react';
import {
Code, Briefcase, HeartHandshake, Edit2,
User, HelpCircle, Palette, Compass, Quote, PenTool,
Globe, ChevronDown, ChevronUp, Share
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const ProfileView = () => {
const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();
const [expandedSection, setExpandedSection] = useState(null);

const isGuest = !isAdmin || isGuestMode;
const isProfileEmpty = user?.name === "손님" && (user?.tags || []).length === 0;
const shouldBlur = isProfileEmpty && !isAdmin;

const sections = [
    { id: 'developer', icon: <Code size={18} />, label: 'Developer', content: renderDeveloperContent },
    { id: 'career', icon: <Briefcase size={18} />, label: 'Career', content: renderCareerContent },
    { id: 'idol', icon: <HeartHandshake size={18} />, label: 'TMI & Favorites', content: renderIdolContent },
    { id: 'qna', icon: <HelpCircle size={18} />, label: 'Q&A', content: renderQnaContent },
    { id: 'hobby', icon: <Palette size={18} />, label: 'Hobby', content: renderHobbyContent },
    { id: 'vision', icon: <Compass size={18} />, label: 'Mandalart', content: renderVisionContent },
    { id: 'quotes', icon: <Quote size={18} />, label: 'Quotes', content: renderQuotesContent },
    { id: 'guestbook', icon: <PenTool size={18} />, label: 'Guestbook', content: renderGuestbookContent },
].filter(tab => !isGuest || user?.privacy?.[tab.id] !== false);

const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("프로필 링크가 클립보드에 복사되었습니다.");
    }).catch(() => {
        showToast("링크 복사에 실패했습니다.");
    });
};

const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
};

// ==========================================
// 🌟 Dummy Data & Helpers
// ==========================================
const dummyLinks = [
    { platform: 'github', name: "GitHub", url: "https://github.com" },
    { platform: 'blog', name: "Blog", url: "https://velog.io" }
];

const displayLinks = user?.links?.length > 0 ? user.links : dummyLinks;
const displayQuotes = user?.quotes?.length ? user.quotes : [{ text: "아무것도 하지 않으면 아무 일도 일어나지 않는다.", author: "Anonymous" }];
const featuredQuote = displayQuotes[Math.floor(Math.random() * displayQuotes.length)];

// ==========================================
// 🌟 Minimal Render Functions (Content Only)
// ==========================================
function renderDeveloperContent() {
    return (
        <div className="space-y-6 text-sm text-zinc-700">
            {user?.developer?.about && (
                <p className="leading-relaxed whitespace-pre-wrap">{user.developer.about}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100">
                <div>
                    <h4 className="font-bold text-zinc-900 mb-3">Tech Stack</h4>
                    <ul className="space-y-2">
                        <li className="flex gap-2"><span className="text-zinc-400 w-16">Backend</span> {user?.developer?.techStack?.backend || '-'}</li>
                        <li className="flex gap-2"><span className="text-zinc-400 w-16">Database</span> {user?.developer?.techStack?.db || '-'}</li>
                        <li className="flex gap-2"><span className="text-zinc-400 w-16">Frontend</span> {user?.developer?.techStack?.frontend || '-'}</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-zinc-900 mb-3">Projects</h4>
                    <ul className="space-y-3">
                        {(user?.developer?.projects || []).map((proj, idx) => (
                            <li key={idx}>
                                <p className="font-bold text-zinc-800">{proj.name}</p>
                                <p className="text-zinc-500 text-xs mt-1">{proj.desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function renderCareerContent() {
    return (
        <div className="space-y-6 text-sm text-zinc-700">
            <p><span className="font-bold text-zinc-900">Target:</span> {user?.career?.targetJob || '미설정'}</p>
            <div className="pt-4 border-t border-zinc-100">
                <h4 className="font-bold text-zinc-900 mb-3">Career Goals</h4>
                <ul className="space-y-2">
                    <li><span className="text-zinc-400 w-12 inline-block">Short</span> {user?.career?.careerGoals?.short || '-'}</li>
                    <li><span className="text-zinc-400 w-12 inline-block">Mid</span> {user?.career?.careerGoals?.mid || '-'}</li>
                    <li><span className="text-zinc-400 w-12 inline-block">Long</span> {user?.career?.careerGoals?.long || '-'}</li>
                </ul>
            </div>
        </div>
    );
}

function renderIdolContent() {
    return (
        <div className="grid grid-cols-2 gap-4 text-sm text-zinc-700">
            <div><span className="block text-xs text-zinc-400 mb-1">Nickname</span> <span className="font-medium text-zinc-900">{user?.idol?.nickname || '-'}</span></div>
            <div><span className="block text-xs text-zinc-400 mb-1">Specialty</span> <span className="font-medium text-zinc-900">{user?.idol?.specialty || '-'}</span></div>
            <div><span className="block text-xs text-zinc-400 mb-1">Favorite Color</span> <span className="font-medium text-zinc-900">{(user?.idol?.favorites?.colors || []).join(', ') || '-'}</span></div>
            <div><span className="block text-xs text-zinc-400 mb-1">Favorite Music</span> <span className="font-medium text-zinc-900">{(user?.idol?.favorites?.music || []).join(', ') || '-'}</span></div>
        </div>
    );
}

function renderQnaContent() {
    const qnas = user?.qna?.length ? user.qna : [{ q: "나를 한 단어로 표현한다면?", a: "꾸준함." }];
    return (
        <div className="space-y-4 text-sm">
            {qnas.map((item, idx) => (
                <div key={idx} className="bg-zinc-50 p-4 rounded-xl">
                    <p className="font-bold text-zinc-900 mb-1">Q. {item.q}</p>
                    <p className="text-zinc-600 leading-relaxed">{item.a}</p>
                </div>
            ))}
        </div>
    );
}

function renderHobbyContent() {
    const hobby = user?.hobby?.title ? user.hobby : { title: "기록과 산책", description: "조용한 동네를 걷습니다.", keywords: ["산책", "기록"] };
    return (
        <div className="text-sm text-zinc-700">
            <h4 className="font-bold text-zinc-900 mb-2">{hobby.title}</h4>
            <p className="leading-relaxed mb-4">{hobby.description}</p>
            <div className="flex gap-2">
                {(hobby.keywords || []).map(kw => <span key={kw} className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">#{kw}</span>)}
            </div>
        </div>
    );
}

function renderVisionContent() {
    const core = user?.vision?.core || "핵심 목표";
    const subs = user?.vision?.subs || Array(8).fill("서브 목표");
    return (
        <div className="text-center py-4">
            <div className="inline-block p-4 border border-zinc-200 rounded-full mb-6">
                <p className="text-xs text-zinc-400 mb-1">Core Vision</p>
                <p className="font-black text-zinc-900 text-lg">{core}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                {subs.map((sub, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 text-zinc-600 text-xs rounded-lg">{sub}</span>
                ))}
            </div>
        </div>
    );
}

function renderQuotesContent() {
    return (
        <div className="text-center py-6">
            <p className="text-lg font-medium text-zinc-800 italic leading-relaxed mb-4">"{featuredQuote.text}"</p>
            <p className="text-xs font-bold text-zinc-400">- {featuredQuote.author}</p>
        </div>
    );
}

function renderGuestbookContent() {
    return (
        <div className="text-center py-8">
            <p className="text-sm text-zinc-500 mb-4">방명록 기능이 곧 활성화됩니다.</p>
            <button className="px-4 py-2 border border-zinc-200 text-zinc-900 text-xs font-bold rounded-full hover:bg-zinc-50">
                기록 남기기
            </button>
        </div>
    );
}

// ==========================================
// 🌟 Ultra Minimal Main Layout
// ==========================================
return (
    <div className="max-w-2xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500 pb-24 font-sans">
        
        {/* Top Minimal Actions */}
        <div className="flex justify-end gap-3 mb-10">
            {!isProfileEmpty && (
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition">
                    <Share size={16} />
                </button>
            )}
            {isAdmin && !isGuestMode ? (
                <button onClick={() => setViewMode('edit_profile')} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition">
                    <Edit2 size={16} />
                </button>
            ) : !isAdmin ? (
                <button onClick={() => setLoginModalOpen(true)} className="px-4 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-bold hover:bg-zinc-800 transition">
                    내 프로필 만들기
                </button>
            ) : null}
        </div>

        <main className={shouldBlur ? 'opacity-30 blur-[2px] pointer-events-none' : ''}>
            
            {/* 1. Profile Header (Linktree Style) */}
            <header className="flex flex-col items-center text-center mb-12">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-zinc-100 border border-zinc-200 mb-6">
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-300">
                            {isProfileEmpty ? '?' : user?.name?.charAt(0)}
                        </div>
                    )}
                </div>
                
                <h1 className="text-2xl font-black text-zinc-900 mb-1">{user?.name || '사용자'}</h1>
                {user?.handle && <p className="text-sm font-medium text-zinc-400 mb-4">@{user.handle}</p>}
                
                <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto mb-6">
                    {user?.bio || "아직 작성된 한 줄 소개가 없습니다."}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {(user?.tags || []).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">#{tag}</span>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {displayLinks.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" 
                           className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors" title={link.name}>
                            <Globe size={20} />
                        </a>
                    ))}
                </div>
            </header>

            {/* 2. Accordion List Sections */}
            <div className="space-y-3">
                {sections.map((section) => {
                    const isExpanded = expandedSection === section.id;
                    return (
                        <div key={section.id} className="border border-zinc-200 rounded-2xl overflow-hidden bg-white transition-all duration-300">
                            <button 
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-zinc-400">{section.icon}</div>
                                    <span className="font-bold text-zinc-900 text-sm">{section.label}</span>
                                </div>
                                <div className="text-zinc-400">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </button>
                            
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    {section.content()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>

        {/* Empty State Overlay */}
        {isProfileEmpty && !isAdmin && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-6"><User size={32}/></div>
                <h3 className="text-xl font-black text-zinc-900 mb-3">아직 프로필이 없습니다</h3>
                <p className="text-sm font-medium text-zinc-500 mb-8 max-w-sm">로그인 후 나만의 정보를 입력해보세요.</p>
                <button onClick={() => setLoginModalOpen(true)} className="px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-md hover:bg-zinc-800 transition">
                    시작하기
                </button>
            </div>
        )}
    </div>
);


};

export default ProfileView;