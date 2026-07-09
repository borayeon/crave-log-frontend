import React, { useState } from 'react';
import { Lock, MessageSquare, Mail, User as UserIcon, AtSign, KeyRound, ArrowLeft } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../../store/AppStore';

const AuthModal = () => {
  const { loginModalOpen, setLoginModalOpen, showToast, setIsAdmin, fetchAllData, setViewMode } = useAppStore();
  
  // 모달 화면 상태 ('main' 카카오/이메일 선택, 'email_login' 로그인 폼, 'signup' 회원가입 폼)
  const [mode, setMode] = useState('main'); 
  
  // 폼 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  
  // ⭐️ 추가된 상태들 (비밀번호 확인, 찾기 탭, 찾은 아이디)
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [findTab, setFindTab] = useState('id'); // 'id' | 'pw'
  const [foundHandle, setFoundHandle] = useState('');

  if (!loginModalOpen) return null;

  const handleKakaoLogin = () => {
    const backendDomain = API_BASE_URL.replace('/api/v1', '');
    window.location.href = `${backendDomain}/oauth2/authorization/kakao`;
  };

  const resetAndClose = () => {
    setLoginModalOpen(false);
    // 모달이 닫히는 애니메이션을 위해 0.3초 뒤에 값 리셋
    setTimeout(() => {
        setMode('main');
        setEmail(''); setPassword(''); setName(''); setHandle('');
        setPasswordConfirm(''); setFoundHandle(''); setFindTab('id'); // ⭐️ 추가 리셋
    }, 300); 
  };

  // ⭐️ 자체 이메일 로그인 처리
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('accessToken', data.token); // JWT 토큰 저장
        setIsAdmin(true); // 호스트 권한 부여
        await fetchAllData(); // 서버에서 내 정보 불러오기
        setViewMode('profile');
        showToast("로그인 성공! 환영합니다 🎉");
        resetAndClose();
      } else {
        showToast(data.message || "로그인에 실패했습니다.");
      }
    } catch (e) {
      showToast("서버 연결에 실패했습니다.");
    }
  };

  // ⭐️ 자체 이메일 회원가입 처리
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm || !name || !handle) {
        showToast("모든 항목을 입력해주세요.");
        return;
    }
    
    // ⭐️ 비밀번호 일치 확인 로직
    if (password !== passwordConfirm) {
        showToast("비밀번호가 서로 일치하지 않습니다.");
        return;
    }

    // 핸들(ID)은 URL에 쓰이므로 영문 소문자/숫자/. 만 허용
    const handleRegex = /^[a-z0-9.]+$/;
    if (!handleRegex.test(handle)) {
        showToast("아이디(핸들)는 영문 소문자, 숫자, 마침표(.)만 가능합니다.");
        return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, handle })
      });
      
      if (res.ok) {
        showToast("회원가입이 완료되었습니다! 로그인 해주세요. 🚀");
        setMode('email_login'); // 성공 시 로그인 화면으로 이동
        setPassword(''); // 비밀번호 입력칸 비워주기
        setPasswordConfirm('');
      } else {
        const data = await res.json();
        showToast(data.message || "회원가입에 실패했습니다.");
      }
    } catch (e) {
      showToast("서버 연결에 실패했습니다.");
    }
  };

  // ⭐️ 아이디 찾기 처리
  const handleFindId = async (e) => {
    e.preventDefault();
    if (!email || !name) return showToast("이름과 이메일을 입력해주세요.");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/find-id`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (res.ok) setFoundHandle(data.handle);
      else showToast(data.message || "일치하는 정보가 없습니다.");
    } catch (e) { showToast("서버 오류가 발생했습니다."); }
  };

  // ⭐️ 비밀번호 재설정 처리
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !name || !password || !passwordConfirm) return showToast("모든 항목을 입력해주세요.");
    if (password !== passwordConfirm) return showToast("새 비밀번호가 일치하지 않습니다.");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, newPassword: password })
      });
      if (res.ok) {
        showToast("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요! 🔑");
        setMode('email_login');
        setPassword(''); setPasswordConfirm('');
      } else {
        const data = await res.json();
        showToast(data.message || "일치하는 정보가 없습니다.");
      }
    } catch (e) { showToast("서버 오류가 발생했습니다."); }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={resetAndClose}>
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center shadow-2xl border border-zinc-100 relative overflow-hidden transition-all duration-300" onClick={e => e.stopPropagation()}>
        
        {/* 뒤로 가기 버튼 (main 화면이 아닐 때만 표시) */}
        {mode !== 'main' && (
            <button onClick={() => setMode('main')} className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition">
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 shadow-sm mt-2">
          <Lock size={28} className="text-zinc-400" />
        </div>
        
        {/* 1. 메인 (로그인 선택) 화면 */}
        {mode === 'main' && (
            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2">CraveLog 시작하기</h2>
                <p className="text-xs text-zinc-500 text-center leading-relaxed font-medium mb-8">
                  나만의 취향 공간을 만들고<br/>포트폴리오를 관리해보세요.
                </p>
                
                <button onClick={handleKakaoLogin} className="w-full py-3.5 bg-[#FEE500] hover:bg-[#E5CF00] text-black rounded-xl font-black text-sm flex items-center justify-center gap-2 transition duration-300 shadow-sm mb-3">
                  <MessageSquare size={16} className="fill-black" /> 카카오 계정으로 계속하기
                </button>
                
                <button onClick={() => setMode('email_login')} className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition duration-300 shadow-sm">
                  <Mail size={16} /> 이메일로 시작하기
                </button>

                <div className="w-full flex items-center justify-center mt-6 gap-2 text-xs font-bold text-zinc-500">
                    계정이 없으신가요? <button onClick={() => setMode('signup')} className="text-indigo-600 hover:underline">이메일로 가입하기</button>
                </div>
            </div>
        )}

        {/* 2. 이메일 로그인 폼 화면 */}
        {mode === 'email_login' && (
            <form onSubmit={handleEmailLogin} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-6 text-center">이메일 로그인</h2>
                
                <div className="space-y-3 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">이메일</label>
                        <div className="relative mt-1">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="hello@example.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">비밀번호</label>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm flex items-center justify-center transition duration-300 shadow-md mb-4">
                  로그인
                </button>

                {/* ⭐️ 아이디/비밀번호 찾기 버튼 추가 */}
                <div className="w-full text-center">
                    <button type="button" onClick={() => { setMode('find_account'); setFindTab('id'); setFoundHandle(''); }} className="text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors">
                        아이디 / 비밀번호를 잊으셨나요?
                    </button>
                </div>
            </form>
        )}

        {/* 3. 이메일 회원가입 폼 화면 */}
        {mode === 'signup' && (
            <form onSubmit={handleSignup} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-6 text-center">이메일 회원가입</h2>
                
                <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto px-1 pb-1 scrollbar-hide">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">이름 (닉네임)</label>
                        <div className="relative mt-1">
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="홍길동" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">고유 아이디 (URL 사용)</label>
                        <div className="relative mt-1">
                            <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={handle} onChange={e=>setHandle(e.target.value.toLowerCase())} required placeholder="gildong.dev" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">이메일</label>
                        <div className="relative mt-1">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="hello@example.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">비밀번호</label>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    {/* ⭐️ 비밀번호 확인 입력 필드 추가 */}
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">비밀번호 확인</label>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required placeholder="••••••••" className={`w-full bg-zinc-50 border rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none ${passwordConfirm && password !== passwordConfirm ? 'border-rose-400' : 'border-zinc-200'}`} />
                        </div>
                        {passwordConfirm && password !== passwordConfirm && (
                            <p className="text-[10px] text-rose-500 font-bold pl-1 mt-1">비밀번호가 일치하지 않습니다.</p>
                        )}
                    </div>
                </div>

                <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm flex items-center justify-center transition duration-300 shadow-md shrink-0">
                  회원가입 완료
                </button>
            </form>
        )}

        {/* ⭐️ 4. 아이디/비밀번호 찾기 폼 화면 */}
        {mode === 'find_account' && (
            <div className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex bg-zinc-100 p-1 rounded-xl mb-6">
                    <button onClick={() => { setFindTab('id'); setFoundHandle(''); }} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${findTab === 'id' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>아이디 찾기</button>
                    <button onClick={() => setFindTab('pw')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${findTab === 'pw' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>비밀번호 재설정</button>
                </div>

                {findTab === 'id' ? (
                    <form onSubmit={handleFindId} className="space-y-4">
                        <p className="text-xs font-medium text-zinc-500 mb-4 text-center">가입 시 등록한 이름과 이메일을 입력해주세요.</p>
                        <div>
                            <div className="relative">
                                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="이름 (닉네임)" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="이메일" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>
                        
                        {foundHandle ? (
                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center animate-in zoom-in-95">
                                <p className="text-xs font-bold text-indigo-500 mb-1">회원님의 아이디(핸들)는</p>
                                <p className="text-lg font-black text-indigo-700">@{foundHandle}</p>
                                <button type="button" onClick={() => setMode('email_login')} className="mt-4 w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">로그인하러 가기</button>
                            </div>
                        ) : (
                            <button type="submit" className="w-full mt-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-sm transition shadow-md">아이디 찾기</button>
                        )}
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4 max-h-[40vh] overflow-y-auto px-1 pb-1 scrollbar-hide">
                        <p className="text-[11px] font-medium text-zinc-500 mb-2 text-center leading-relaxed">
                            보안을 위해 계정 정보가 일치하면<br/>즉시 새로운 비밀번호로 덮어씁니다.
                        </p>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="이름 (닉네임)" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-zinc-800 outline-none" />
                        </div>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="가입한 이메일" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-zinc-800 outline-none" />
                        </div>
                        <div className="relative mt-4">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="새 비밀번호" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-zinc-800 outline-none" />
                        </div>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required placeholder="새 비밀번호 확인" className={`w-full bg-zinc-50 border rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-zinc-800 outline-none ${passwordConfirm && password !== passwordConfirm ? 'border-rose-400' : 'border-zinc-200'}`} />
                        </div>
                        <button type="submit" className="w-full mt-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-sm transition shadow-md shrink-0">비밀번호 재설정</button>
                    </form>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;