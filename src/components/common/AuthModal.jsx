import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, KeyRound, User as UserIcon, AtSign, Sparkles, CheckCircle2, ShieldCheck, Check, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const AuthModal = () => {
  const { loginModalOpen, setLoginModalOpen, showToast, setIsAdmin, fetchAllData, setViewMode } = useAppStore();
  
  // 인증 단계: 'EMAIL_ENTRY' -> 'LOGIN_PASSWORD' (기존) 또는 'SIGNUP_PASSWORD' -> 'SIGNUP_INFO' (신규)
  const [step, setStep] = useState('EMAIL_ENTRY'); 
  const [isLoading, setIsLoading] = useState(false);

  // 폼 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  // 자동 포커스를 위한 Ref
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const signupPasswordInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (loginModalOpen && step === 'EMAIL_ENTRY' && emailInputRef.current) emailInputRef.current.focus();
    if (step === 'LOGIN_PASSWORD' && passwordInputRef.current) passwordInputRef.current.focus();
    if (step === 'SIGNUP_PASSWORD' && signupPasswordInputRef.current) signupPasswordInputRef.current.focus();
    if (step === 'SIGNUP_INFO' && nameInputRef.current) nameInputRef.current.focus();
  }, [step, loginModalOpen]);

  if (!loginModalOpen) return null;

  const resetAndClose = () => {
    setLoginModalOpen(false);
    setTimeout(() => {
        setStep('EMAIL_ENTRY');
        setEmail(''); setPassword(''); setPasswordConfirm(''); setName(''); setHandle('');
        setIsLoading(false);
    }, 300); 
  };

  // 1단계: 이메일 입력 및 회원 여부 확인
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!email) return showToast("이메일을 입력해주세요.");
    
    setIsLoading(true);
    try {
      // ⭐️ [API 연동 지점] 백엔드에 이메일 존재 여부 확인 요청
      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      // 데모를 위한 분기 처리: test@cravelog.com은 기존 회원으로 가정
      if (email === "test@cravelog.com") {
        setStep('LOGIN_PASSWORD');
      } else {
        showToast("가입되지 않은 이메일입니다. 새 계정 설정을 시작합니다.");
        setStep('SIGNUP_PASSWORD');
      }
    } catch (e) {
      showToast("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2-1단계: 기존 회원 로그인 처리
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password) return showToast("비밀번호를 입력해주세요.");

    setIsLoading(true);
    try {
      // ⭐️ [API 연동 지점] 로그인 처리
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsAdmin(true);
      await fetchAllData();
      setViewMode('profile');
      showToast("로그인 성공! 환영합니다 🎉");
      resetAndClose();
    } catch (e) {
      showToast("비밀번호가 일치하지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ 비밀번호 보안 조건 실시간 체크
  const isValidLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*#?&]/.test(password);
  const isPasswordValid = isValidLength && hasLetter && hasNumber && hasSpecial;
  const isPasswordMatch = password && password === passwordConfirm;

  // 2-2단계: 신규 회원 비밀번호 검증 후 다음 단계로
  const handleSignupPasswordSubmit = (e) => {
    e.preventDefault();
    if (!isPasswordValid) return showToast("비밀번호 조건을 모두 충족해주세요.");
    if (!isPasswordMatch) return showToast("비밀번호가 서로 일치하지 않습니다.");
    setStep('SIGNUP_INFO');
  };

  // 3단계: 신규 유저 정보 입력 및 가입 완료
  const handleCompleteSignup = async (e) => {
    e.preventDefault();
    if (!name || !handle) return showToast("이름과 아이디를 입력해주세요.");

    const handleRegex = /^[a-z0-9.]+$/;
    if (!handleRegex.test(handle)) return showToast("아이디는 영문 소문자, 숫자, 마침표(.)만 가능합니다.");

    setIsLoading(true);
    try {
      // ⭐️ [API 연동 지점] 최종 회원가입 처리
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsAdmin(true);
      await fetchAllData();
      setViewMode('profile');
      showToast("CraveLog 가입을 환영합니다! 🎉 나만의 인덱스를 꾸며보세요.");
      resetAndClose();
    } catch (e) {
      showToast("회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ 카카오 로그인 처리 (데모)
  const handleKakaoLogin = async () => {
    showToast("카카오 로그인 진행 중...");
    // 실제 환경에서는 여기서 OAuth URL로 리다이렉트
    // window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
    
    // 데모를 위한 임시 처리
    setTimeout(() => {
        setIsAdmin(true);
        fetchAllData();
        setViewMode('profile');
        showToast("카카오로 로그인되었습니다! 💛");
        resetAndClose();
    }, 800);
  };

  // 뒤로가기 버튼 로직
  const goBack = () => {
    if (step === 'LOGIN_PASSWORD' || step === 'SIGNUP_PASSWORD') {
        setStep('EMAIL_ENTRY');
        setPassword('');
        setPasswordConfirm('');
    } else if (step === 'SIGNUP_INFO') {
        setStep('SIGNUP_PASSWORD');
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={resetAndClose}>
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col shadow-2xl border border-zinc-100 relative overflow-hidden transition-all duration-300" onClick={e => e.stopPropagation()}>
        
        {/* 뒤로 가기 버튼 */}
        {step !== 'EMAIL_ENTRY' && (
            <button onClick={goBack} className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition z-10">
                <ArrowLeft size={20} />
            </button>
        )}

        {/* 상단 헤더 아이콘 & 타이틀 */}
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 shadow-sm mt-2">
            {step === 'EMAIL_ENTRY' && <Sparkles size={28} className="text-indigo-500" />}
            {step === 'LOGIN_PASSWORD' && <KeyRound size={28} className="text-indigo-500" />}
            {step === 'SIGNUP_PASSWORD' && <ShieldCheck size={28} className="text-indigo-500" />}
            {step === 'SIGNUP_INFO' && <CheckCircle2 size={28} className="text-indigo-500" />}
            </div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2 text-center">
                {step === 'EMAIL_ENTRY' && "CraveLog 로그인"}
                {step === 'LOGIN_PASSWORD' && "비밀번호 입력"}
                {step === 'SIGNUP_PASSWORD' && "안전한 비밀번호 설정"}
                {step === 'SIGNUP_INFO' && "프로필 설정"}
            </h2>
            <p className="text-xs text-zinc-500 text-center leading-relaxed font-medium mb-8">
                {step === 'EMAIL_ENTRY' && <>하나의 계정으로 모든 기기에서<br/>나만의 아카이브를 관리하세요.</>}
                {step === 'LOGIN_PASSWORD' && <>환영합니다!<br/><span className="text-indigo-600 font-bold">{email}</span></>}
                {step === 'SIGNUP_PASSWORD' && <><span className="text-indigo-600 font-bold">{email}</span><br/>계정에 사용할 비밀번호를 만들어주세요.</>}
                {step === 'SIGNUP_INFO' && <>거의 다 왔습니다!<br/>CraveLog에서 보여질 기본 정보를 입력해주세요.</>}
            </p>
        </div>

        {/* 1단계: 이메일 입력 폼 및 소셜 로그인 */}
        {step === 'EMAIL_ENTRY' && (
            <div className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleCheckEmail}>
                    <div className="relative mb-6">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input ref={emailInputRef} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="이메일 주소" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                    </div>
                    <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl font-black text-sm transition duration-300 shadow-md mb-6">
                    {isLoading ? '확인 중...' : '다음'}
                    </button>
                </form>

                {/* ⭐️ 소셜 로그인 구분선 및 버튼 추가 */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-zinc-200"></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-zinc-200"></div>
                </div>

                <button 
                    onClick={handleKakaoLogin} 
                    className="w-full py-3.5 bg-[#FEE500] hover:bg-[#E5CF00] text-black rounded-xl font-black text-sm flex items-center justify-center gap-2 transition duration-300 shadow-sm"
                >
                    <MessageSquare size={16} className="fill-black" /> 카카오 계정으로 계속하기
                </button>
            </div>
        )}

        {/* 2-1단계: 로그인 폼 */}
        {step === 'LOGIN_PASSWORD' && (
            <form onSubmit={handleLoginSubmit} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative mb-4">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input ref={passwordInputRef} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="비밀번호" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                </div>
                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>
        )}

        {/* 2-2단계: 신규 가입 비밀번호 설정 폼 */}
        {step === 'SIGNUP_PASSWORD' && (
            <form onSubmit={handleSignupPasswordSubmit} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4 mb-4">
                    <div className="relative">
                        <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input ref={signupPasswordInputRef} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="새 비밀번호 입력" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                    </div>
                    <div className="relative">
                        <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required placeholder="비밀번호 다시 입력" className={`w-full bg-zinc-50 border rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 outline-none transition-all shadow-inner focus:ring-2 focus:ring-indigo-500 ${passwordConfirm && !isPasswordMatch ? 'border-rose-400' : 'border-zinc-200'}`} />
                    </div>
                </div>

                {/* ⭐️ 실시간 피드백이 제공되는 보안 조건 UI */}
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 mb-6">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">보안 조건</p>
                    <ul className="space-y-1.5 text-xs font-bold text-zinc-500">
                        <li className={`flex items-center gap-2 transition-colors ${isValidLength ? 'text-emerald-500' : ''}`}><Check size={14} className={isValidLength ? "text-emerald-500" : "text-zinc-300"} /> 8자 이상 입력</li>
                        <li className={`flex items-center gap-2 transition-colors ${hasLetter && hasNumber ? 'text-emerald-500' : ''}`}><Check size={14} className={hasLetter && hasNumber ? "text-emerald-500" : "text-zinc-300"} /> 영문, 숫자 포함</li>
                        <li className={`flex items-center gap-2 transition-colors ${hasSpecial ? 'text-emerald-500' : ''}`}><Check size={14} className={hasSpecial ? "text-emerald-500" : "text-zinc-300"} /> 특수문자 포함 (@$!%*#?&)</li>
                    </ul>
                </div>

                <button disabled={!isPasswordValid || !isPasswordMatch} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  다음 단계로
                </button>
            </form>
        )}

        {/* 3단계: 프로필 정보 입력 폼 */}
        {step === 'SIGNUP_INFO' && (
            <form onSubmit={handleCompleteSignup} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">이름 (닉네임)</label>
                        <div className="relative mt-1">
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input ref={nameInputRef} type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="홍길동" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">고유 아이디 (URL 사용)</label>
                        <div className="relative mt-1">
                            <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={handle} onChange={e=>setHandle(e.target.value.toLowerCase())} required placeholder="gildong.dev" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
                        </div>
                    </div>
                </div>

                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-black text-sm flex items-center justify-center transition duration-300 shadow-md">
                  {isLoading ? '가입 중...' : 'CraveLog 시작하기'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;