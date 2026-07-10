import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, KeyRound, User as UserIcon, AtSign, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react'; // ⭐️ MessageSquare 복구
import { useAppStore, API_BASE_URL } from '../../store/AppStore';

const AuthModal = () => {
  const { loginModalOpen, setLoginModalOpen, showToast, setIsAdmin, fetchAllData, setViewMode } = useAppStore();
  
  // 단계 관리: 'EMAIL_CHECK' (1단계) -> 'PASSWORD_INPUT' (2단계) -> 'SIGNUP' (회원가입)
  const [step, setStep] = useState('EMAIL_CHECK'); 
  const [isLoading, setIsLoading] = useState(false);

  // 폼 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  // 자동 포커스를 위한 Ref
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (step === 'PASSWORD_INPUT' && passwordInputRef.current) {
        passwordInputRef.current.focus();
    }
  }, [step]);

  if (!loginModalOpen) return null;

  const resetAndClose = () => {
    setLoginModalOpen(false);
    setTimeout(() => {
        setStep('EMAIL_CHECK');
        setEmail(''); setPassword(''); setPasswordConfirm(''); setName(''); setHandle('');
        setIsLoading(false);
    }, 300); 
  };

  // 1단계: 이메일 존재 여부 확인
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!email) return showToast("이메일을 입력해주세요.");
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
            setStep('PASSWORD_INPUT');
        } else {
            showToast("등록되지 않은 이메일입니다. 계정을 생성해주세요.");
            setStep('SIGNUP'); // ⭐️ 바로 회원가입으로 넘겨주어 이탈 방지
        }
      } else {
         showToast("서버와 통신할 수 없습니다.");
      }
    } catch (e) {
      console.error(e);
      showToast("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 비밀번호 입력 후 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return showToast("비밀번호를 입력해주세요.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
         const data = await res.json();
         localStorage.setItem('accessToken', data.token);
         setIsAdmin(true);
         await fetchAllData();
         setViewMode('profile');
         showToast("로그인 성공! 환영합니다 🎉");
         resetAndClose();
      } else {
         showToast("비밀번호가 올바르지 않습니다.");
      }
    } catch (e) {
      showToast("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 정규식 검증 함수 (영문, 숫자, 특수문자 포함 8자 이상)
  const validatePassword = (pw) => {
      const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
      return regex.test(pw);
  };

  // 3단계: 신규 회원가입 처리
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm || !name || !handle) return showToast("모든 항목을 입력해주세요.");
    
    if (!validatePassword(password)) {
        return showToast("비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.");
    }

    if (password !== passwordConfirm) {
        return showToast("비밀번호가 서로 일치하지 않습니다.");
    }

    const handleRegex = /^[a-z0-9.]+$/;
    if (!handleRegex.test(handle)) return showToast("아이디는 영문 소문자, 숫자, 마침표(.)만 가능합니다.");

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, handle })
      });
      
      if (res.ok) {
          showToast("가입이 완료되었습니다! 로그인해주세요. 🎉");
          setStep('PASSWORD_INPUT');
          setPassword(''); setPasswordConfirm('');
      } else {
          showToast("회원가입에 실패했습니다.");
      }
    } catch (e) {
      showToast("회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ 카카오 로그인 리다이렉트 핸들러 추가
  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={resetAndClose}>
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col shadow-2xl border border-zinc-100 relative overflow-hidden transition-all duration-300" onClick={e => e.stopPropagation()}>
        
        {/* 뒤로 가기 버튼 (1단계가 아닐 때 표시) */}
        {step !== 'EMAIL_CHECK' && (
            <button 
                onClick={() => setStep(step === 'PASSWORD_INPUT' ? 'EMAIL_CHECK' : 'EMAIL_CHECK')} 
                className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition z-10"
            >
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 shadow-sm mt-2">
                <Sparkles size={28} className="text-indigo-500" />
            </div>
            
            <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2 text-center">
                {step === 'EMAIL_CHECK' && "CraveLog 로그인"}
                {step === 'PASSWORD_INPUT' && "비밀번호 입력"}
                {step === 'SIGNUP' && "계정 생성"}
            </h2>
            
            <p className="text-xs text-zinc-500 text-center leading-relaxed font-medium mb-8">
                {step === 'EMAIL_CHECK' && "하나의 계정으로 모든 기기에서\n나만의 아카이브를 관리하세요."}
                {step === 'PASSWORD_INPUT' && <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">{email}</span>}
                {step === 'SIGNUP' && "환영합니다! CraveLog에서 사용할\n프로필 정보를 입력해주세요."}
            </p>
        </div>

        {/* 1단계: 이메일 체크 폼 */}
        {step === 'EMAIL_CHECK' && (
            <form onSubmit={handleCheckEmail} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative mb-6">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e=>setEmail(e.target.value)} 
                        required 
                        autoFocus
                        placeholder="이메일 주소" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                    />
                </div>
                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  {isLoading ? '확인 중...' : '다음'}
                </button>
                
                {/* ⭐️ 카카오 로그인 버튼 복구 및 디자인 보완 */}
                <div className="mt-8 flex flex-col gap-4">
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-zinc-200"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">or continue with</span>
                        <div className="flex-grow border-t border-zinc-200"></div>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleKakaoLogin} 
                        className="w-full py-3.5 bg-[#FEE500] hover:bg-[#E5CF00] text-black rounded-xl font-black text-sm flex items-center justify-center gap-2 transition shadow-sm"
                    >
                        <MessageSquare size={16} className="fill-black" /> 카카오 계정으로 로그인
                    </button>
                    
                    {/* 계정 생성 링크를 버튼과 시각적으로 분리하여 하단에 배치 */}
                    <button type="button" onClick={() => setStep('SIGNUP')} className="mt-2 text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors text-center">
                        아이디가 없으신가요? 계정 생성
                    </button>
                </div>
            </form>
        )}

        {/* 2단계: 비밀번호 입력 폼 */}
        {step === 'PASSWORD_INPUT' && (
            <form onSubmit={handleLogin} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative mb-6">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        ref={passwordInputRef}
                        type="password" 
                        value={password} 
                        onChange={e=>setPassword(e.target.value)} 
                        required 
                        placeholder="비밀번호" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                    />
                </div>
                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>
        )}

        {/* 3단계: 신규 유저 회원가입 폼 */}
        {step === 'SIGNUP' && (
            <form onSubmit={handleSignup} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 max-h-[50vh] overflow-y-auto px-1 pb-2 scrollbar-hide">
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="relative mt-1">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="사용할 이메일" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="비밀번호" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        {password.length > 0 && (
                            <p className={`text-[10px] font-bold pl-2 mt-1.5 ${validatePassword(password) ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {validatePassword(password) ? '✓ 안전한 비밀번호입니다.' : '영문, 숫자, 특수문자 조합 8자 이상 입력해주세요.'}
                            </p>
                        )}
                    </div>
                    <div>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required placeholder="비밀번호 확인" className={`w-full bg-zinc-50 border rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none ${passwordConfirm && password !== passwordConfirm ? 'border-rose-400' : 'border-zinc-200'}`} />
                        </div>
                    </div>
                    <div>
                        <div className="relative mt-1">
                            <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="이름 (닉네임)" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <div className="relative mt-1">
                            <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="text" value={handle} onChange={e=>setHandle(e.target.value.toLowerCase())} required placeholder="고유 아이디 (URL로 사용됨)" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                </div>

                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-black text-sm flex items-center justify-center transition duration-300 shadow-md shrink-0">
                  {isLoading ? '가입 중...' : '가입하기'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;