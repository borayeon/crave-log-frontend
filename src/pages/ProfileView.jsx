import React from 'react';
import {
Code, Briefcase, HeartHandshake, Edit2,
User, HelpCircle, Palette, Compass, Quote, PenTool,
Globe, Share, ExternalLink
} from 'lucide-react';
import { useAppStore } from '../store/AppStore';

// 🌟 커스텀 깃허브 아이콘 (lucide-react 브랜드 로고 삭제 대응)
const GithubIcon = ({ size = 24, className = "" }) => (



);

const ProfileView = () => {
const { setViewMode, user, showToast, isAdmin, setLoginModalOpen, isGuestMode } = useAppStore();

const isGuest = !isAdmin || isGuestMode;
const isProfileEmpty = user?.name === "손님" && (user?.tags || []).length === 0;
const shouldBlur = isProfileEmpty && !isAdmin;

const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user?.handle}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showToast("프로필 링크가 클립보드에 복사되었습니다.");
    }).catch(() => {
        showToast("링크 복사에 실패했습니다.");
    });
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
// 🌟 Section Renderers (Fully Visible)
// ==========================================
const renderDeveloper = () => (
    <section id="developer" className="scroll-mt-24">
        <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Code className="text-zinc-400" size={24}/> Developer
        </h3>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-8">
            {user?.developer?.about && (
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {user.developer.about}
                </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Tech Stack</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-4"><span className="font-bold text-zinc-900 w-20">Backend</span><span className="text-zinc-600">{user?.developer?.techStack?.backend || '-'}</span></li>
                        <li className="flex gap-4"><span className="font-bold text-zinc-900 w-20">Database</span><span className="text-zinc-600">{user?.developer?.techStack?.db || '-'}</span></li>
                        <li className="flex gap-4"><span className="font-bold text-zinc-900 w-20">Frontend</span><span className="text-zinc-600">{user?.developer?.techStack?.frontend || '-'}</span></li>
                    </ul>
                </div>
                
                {user?.developer?.projects?.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Projects</h4>
                        <div className="space-y-4">
                            {user.developer.projects.map((proj, idx) => (
                                <div key={idx} className="group">
                                    <h5 className="font-bold text-zinc-900 flex items-center gap-2">
                                        {proj.name}
                                        {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-zinc-900"><GithubIcon size={14}/></a>}
                                        {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-zinc-900"><ExternalLink size={14}/></a>}
                                    </h5>
                                    <p className="text-xs text-zinc-500 mt-1">{proj.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </section>
);

const renderCareer = () => (
    <section id="career" className="scroll-mt-24">
        <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <Briefcase className="text-zinc-400" size={24}/> Career
        </h3>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
            <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Target Role</h4>
                <p className="text-lg font-black text-zinc-900">{user?.career?.targetJob || '미설정'}</p>
            </div>
            
            <div className="pt-4 border-t border-zinc-50">
                <h4 className="text-xs font-bold text-zinc-900 mb-4">Career Goals</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Short Term</span>
                        <p className="text-sm font-medium text-zinc-800">{user?.career?.careerGoals?.short || '-'}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Mid Term</span>
                        <p className="text-sm font-medium text-zinc-800">{user?.career?.careerGoals?.mid || '-'}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Long Term</span>
                        <p className="text-sm font-medium text-zinc-800">{user?.career?.careerGoals?.long || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const renderVision = () => {
    const core = user?.vision?.core || "핵심 목표";
    const subs = user?.vision?.subs || Array(8).fill("서브 목표");
    return (
        <section id="vision" className="scroll-mt-24">
            <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Compass className="text-zinc-400" size={24}/> Vision
            </h3>
            <div className="bg-zinc-900 p-8 md:p-10 rounded-[2rem] shadow-md text-center">
                <div className="inline-block p-4 border border-zinc-700/50 rounded-2xl mb-8 bg-zinc-800/50 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Core Goal</p>
                    <p className="font-black text-white text-xl md:text-2xl">{core}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {subs.map((sub, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg border border-zinc-700">
                            {sub}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

const renderIdol = () => (
    <section id="idol" className="scroll-mt-24">
        <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
            <HeartHandshake className="text-zinc-400" size={24}/> TMI & Favorites
        </h3>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-100 shadow-sm grid grid-cols-2 gap-y-6 gap-x-4">
            <div><span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Nickname</span> <span className="text-sm font-bold text-zinc-900">{user?.idol?.nickname || '-'}</span></div>
            <div><span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Specialty</span> <span className="text-sm font-bold text-zinc-900">{user?.idol?.specialty || '-'}</span></div>
            <div><span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Favorite Color</span> <span className="text-sm font-bold text-zinc-900">{(user?.idol?.favorites?.colors || []).join(', ') || '-'}</span></div>
            <div><span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Favorite Music</span> <span className="text-sm font-bold text-zinc-900">{(user?.idol?.favorites?.music || []).join(', ') || '-'}</span></div>
        </div>
    </section>
);

const renderHobby = () => {
    const hobby = user?.hobby?.title ? user.hobby : { title: "기록과 산책", description: "조용한 동네를 걷습니다.", keywords: ["산책", "기록"] };
    return (
        <section id="hobby" className="scroll-mt-24">
            <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                <Palette className="text-zinc-400" size={24}/> Hobby
            </h3>
            <div className="bg-zinc-50 p-6 md:p-8 rounded-[2rem] border border-zinc-100">
                <h4 className="text-lg font-black text-zinc-900 mb-3">{hobby.title}</h4>
                <p className="text-sm text-zinc-600 leading-relaxed mb-6">{hobby.description}</p>
                <div className="flex flex-wrap gap-2">
                    {(hobby.keywords || []).map(kw => <span key={kw} className="px-3 py-1 bg-white text-zinc-700 border border-zinc-200 text-xs font-bold rounded-lg">#{kw}</span>)}
                </div>
            </div>
        </section>
    );
};

// ==========================================
// 🌟 Main Split Layout
// ==========================================
return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-8 animate-in fade-in duration-500 pb-24 font-sans">
        
        {/* Top Actions */}
        <div className="flex justify-end gap-3 mb-8">
            {!isProfileEmpty && (
                <button onClick={handleShare} className="px-4 py-2 rounded-full bg-white border border-zinc-200 flex items-center gap-2 text-zinc-600 text-xs font-bold hover:bg-zinc-50 transition">
                    <Share size={14} /> 공유
                </button>
            )}
            {isAdmin && !isGuestMode ? (
                <button onClick={() => setViewMode('edit_profile')} className="px-4 py-2 rounded-full bg-zinc-900 flex items-center gap-2 text-white text-xs font-bold hover:bg-zinc-800 transition">
                    <Edit2 size={14} /> 편집
                </button>
            ) : !isAdmin ? (
                <button onClick={() => setLoginModalOpen(true)} className="px-4 py-2 rounded-full bg-zinc-900 flex items-center text-white text-xs font-bold hover:bg-zinc-800 transition">
                    내 프로필 만들기
                </button>
            ) : null}
        </div>

        <div className={`flex flex-col md:flex-row gap-10 md:gap-16 ${shouldBlur ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            
            {/* 👈 LEFT COLUMN: Sticky Profile */}
            <aside className="w-full md:w-80 shrink-0 md:sticky md:top-24 h-max flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-zinc-200 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-zinc-200 bg-zinc-50">
                            {isProfileEmpty ? '?' : user?.name?.charAt(0)}
                        </div>
                    )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-2">{user?.name || '사용자'}</h1>
                {user?.handle && <p className="text-sm font-bold text-zinc-400 mb-6">@{user.handle}</p>}
                
                <p className="text-sm text-zinc-600 leading-relaxed font-medium mb-8 max-w-sm">
                    {user?.bio || "아직 작성된 한 줄 소개가 없습니다."}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                    {(user?.tags || []).map(tag => (
                        <span key={tag} className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg">#{tag}</span>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {displayLinks.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" 
                           className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors shadow-sm" title={link.name}>
                            {link.platform === 'github' ? <GithubIcon size={18} /> : <Globe size={18} />}
                        </a>
                    ))}
                </div>

                {/* Featured Quote under profile */}
                <div className="mt-12 pt-8 border-t border-zinc-200 w-full hidden md:block">
                    <Quote className="text-zinc-300 mb-3" size={24}/>
                    <p className="text-sm font-medium text-zinc-700 italic leading-relaxed">"{featuredQuote.text}"</p>
                </div>
            </aside>

            {/* 👉 RIGHT COLUMN: Scrollable Content */}
            <main className="flex-1 space-y-16 md:space-y-24 pb-20">
                {(!isGuest || user?.privacy?.developer !== false) && renderDeveloper()}
                {(!isGuest || user?.privacy?.career !== false) && renderCareer()}
                {(!isGuest || user?.privacy?.vision !== false) && renderVision()}
                {(!isGuest || user?.privacy?.hobby !== false) && renderHobby()}
                {(!isGuest || user?.privacy?.idol !== false) && renderIdol()}
                
                {/* Q&A Section */}
                {(!isGuest || user?.privacy?.qna !== false) && (
                    <section id="qna" className="scroll-mt-24">
                        <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                            <HelpCircle className="text-zinc-400" size={24}/> Q&A
                        </h3>
                        <div className="space-y-4">
                            {(user?.qna?.length ? user.qna : [{ q: "나를 한 단어로 표현한다면?", a: "꾸준함." }]).map((item, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                                    <p className="font-black text-zinc-900 mb-2 text-sm">Q. {item.q}</p>
                                    <p className="text-sm text-zinc-600 leading-relaxed font-medium">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

        </div>

        {/* Empty State Overlay */}
        {isProfileEmpty && !isAdmin && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-6 text-center">
                <div className="w-20 h-20 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mb-6 shadow-sm"><User size={40}/></div>
                <h3 className="text-2xl font-black text-zinc-900 mb-3">아직 프로필이 없습니다</h3>
                <p className="text-base font-medium text-zinc-500 mb-8 max-w-sm">로그인 후 나만의 직무, 목표, 취향 정보를 입력하고 완벽한 이력서를 완성해보세요.</p>
                <button onClick={() => setLoginModalOpen(true)} className="px-8 py-4 bg-zinc-900 text-white rounded-full text-sm font-black shadow-xl hover:bg-zinc-800 transition transform hover:scale-105">
                    내 프로필 만들기
                </button>
            </div>
        )}
    </div>
);


};

export default ProfileView;