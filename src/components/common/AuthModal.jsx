import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, KeyRound, User as UserIcon, AtSign, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useAppStore, API_BASE_URL } from '../../store/AppStore';

const AuthModal = () => {
  const { loginModalOpen, setLoginModalOpen, showToast, setIsAdmin, fetchAllData, setViewMode } = useAppStore();
  
  // 상태 관리: EMAIL_CHECK -> PASSWORD_INPUT -> SIGNUP / FIND_PW_CODE -> FIND_PW_RESET
  const [step, setStep] = useState('EMAIL_CHECK'); 
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [authCode, setAuthCode] = useState(''); // 이메일 인증코드

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
        setEmail(''); setPassword(''); setPasswordConfirm(''); setName(''); setHandle(''); setAuthCode('');
        setIsLoading(false);
    }, 300); 
  };

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
        }
      } else showToast("서버와 통신할 수 없습니다.");
    } catch (e) {
      showToast("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const validatePassword = (pw) => {
      const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
      return regex.test(pw);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !passwordConfirm || !name || !handle) return showToast("모든 항목을 입력해주세요.");
    if (!validatePassword(password)) return showToast("비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.");
    if (password !== passwordConfirm) return showToast("비밀번호가 서로 일치하지 않습니다.");
    if (!/^[a-z0-9.]+$/.test(handle)) return showToast("아이디는 영문 소문자, 숫자, 마침표(.)만 가능합니다.");

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
      } else showToast("회원가입에 실패했습니다.");
    } catch (e) { showToast("오류가 발생했습니다."); } finally { setIsLoading(false); }
  };

  // ⭐️ 1. 비밀번호 찾기 (인증번호 발송 요청)
  const handleRequestPasswordReset = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        showToast("이메일로 인증번호가 발송되었습니다. ✉️");
        setStep('FIND_PW_CODE');
      } else showToast("이메일 발송에 실패했습니다.");
    } catch (e) { showToast("네트워크 오류가 발생했습니다."); } finally { setIsLoading(false); }
  };

  // ⭐️ 2. 인증번호 검증
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if(authCode.length < 6) return showToast("6자리 코드를 입력해주세요.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: authCode })
      });
      const data = await res.json();
      if (res.ok && data.isValid) {
        showToast("인증이 완료되었습니다. 새 비밀번호를 설정해주세요.");
        setStep('FIND_PW_RESET');
        setPassword(''); setPasswordConfirm('');
      } else showToast("잘못된 인증번호입니다.");
    } catch (e) { showToast("검증 중 오류가 발생했습니다."); } finally { setIsLoading(false); }
  };

  // ⭐️ 3. 비밀번호 재설정
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) return showToast("비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.");
    if (password !== passwordConfirm) return showToast("비밀번호가 서로 일치하지 않습니다.");
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: authCode, newPassword: password })
      });
      if (res.ok) {
        showToast("비밀번호가 성공적으로 변경되었습니다! 🔐");
        setStep('PASSWORD_INPUT');
        setPassword('');
      } else showToast("비밀번호 변경에 실패했습니다.");
    } catch (e) { showToast("오류가 발생했습니다."); } finally { setIsLoading(false); }
  };

  const getBackButtonAction = () => {
    if (step === 'PASSWORD_INPUT') return 'EMAIL_CHECK';
    if (step === 'SIGNUP') return 'EMAIL_CHECK';
    if (step === 'FIND_PW_CODE') return 'PASSWORD_INPUT';
    if (step === 'FIND_PW_RESET') return 'FIND_PW_CODE';
    return 'EMAIL_CHECK';
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/60 z-[150] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={resetAndClose}>
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 flex flex-col shadow-2xl border border-zinc-100 relative overflow-hidden transition-all duration-300" onClick={e => e.stopPropagation()}>
        
        {step !== 'EMAIL_CHECK' && (
            <button 
                onClick={() => setStep(getBackButtonAction())} 
                className="absolute top-6 left-6 p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition z-10"
            >
                <ArrowLeft size={20} />
            </button>
        )}

        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 shadow-sm mt-2">
                {step.includes('FIND_PW') ? <AlertCircle size={28} className="text-rose-500" /> : <Sparkles size={28} className="text-indigo-500" />}
            </div>
            
            <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-2 text-center">
                {step === 'EMAIL_CHECK' && "CraveLog 로그인"}
                {step === 'PASSWORD_INPUT' && "비밀번호 입력"}
                {step === 'SIGNUP' && "계정 생성"}
                {step === 'FIND_PW_CODE' && "이메일 인증"}
                {step === 'FIND_PW_RESET' && "새 비밀번호 설정"}
            </h2>
            
            <p className="text-xs text-zinc-500 text-center leading-relaxed font-medium mb-8">
                {step === 'EMAIL_CHECK' && "하나의 계정으로 모든 기기에서\n나만의 아카이브를 관리하세요."}
                {step === 'PASSWORD_INPUT' && <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">{email}</span>}
                {step === 'SIGNUP' && "환영합니다! CraveLog에서 사용할\n프로필 정보를 입력해주세요."}
                {step === 'FIND_PW_CODE' && <><span className="text-indigo-600 font-bold">{email}</span><br/>위 주소로 발송된 6자리 코드를 입력해주세요.</>}
                {step === 'FIND_PW_RESET' && "안전한 계정 관리를 위해\n새로운 비밀번호를 입력해주세요."}
            </p>
        </div>

        {/* 1. 이메일 체크 */}
        {step === 'EMAIL_CHECK' && (
            <form onSubmit={handleCheckEmail} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative mb-6">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus placeholder="이메일 주소" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                    />
                </div>
                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  {isLoading ? '확인 중...' : '다음'}
                </button>
                <div className="mt-6 flex flex-col gap-3">
                    <button type="button" onClick={() => setStep('SIGNUP')} className="text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors text-left pl-1">계정 생성</button>
                </div>
            </form>
        )}

        {/* 2. 비밀번호 입력 */}
        {step === 'PASSWORD_INPUT' && (
            <form onSubmit={handleLogin} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative mb-6">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        ref={passwordInputRef} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="비밀번호" 
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
                    />
                </div>
                <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
                {/* ⭐️ 비밀번호 찾기 버튼 추가 */}
                <button type="button" onClick={handleRequestPasswordReset} className="mt-4 text-[11px] font-bold text-zinc-400 hover:text-rose-500 transition-colors">
                    비밀번호를 잊으셨나요?
                </button>
            </form>
        )}

        {/* 3. 비밀번호 찾기 (코드 입력) */}
        {step === 'FIND_PW_CODE' && (
             <form onSubmit={handleVerifyCode} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="relative mb-6">
                     <input 
                         type="text" maxLength={6} value={authCode} onChange={e=>setAuthCode(e.target.value.replace(/[^0-9]/g, ''))} required placeholder="000000" 
                         className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-4 text-center text-2xl tracking-[0.5em] font-black text-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none transition-all shadow-inner" 
                     />
                 </div>
                 <button disabled={isLoading || authCode.length < 6} type="submit" className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                   {isLoading ? '확인 중...' : '인증 완료'}
                 </button>
                 <button type="button" onClick={handleRequestPasswordReset} className="mt-4 text-[11px] font-bold text-zinc-400 hover:text-rose-500 transition-colors">
                     코드를 받지 못하셨나요? 재전송
                 </button>
             </form>
        )}

        {/* 4. 비밀번호 재설정 */}
        {step === 'FIND_PW_RESET' && (
             <form onSubmit={handleResetPassword} className="w-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4 mb-6">
                    <div>
                        <div className="relative mt-1">
                            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="새 비밀번호" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none" />
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
                            <input type="password" value={passwordConfirm} onChange={e=>setPasswordConfirm(e.target.value)} required placeholder="비밀번호 확인" className={`w-full bg-zinc-50 border rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none ${passwordConfirm && password !== passwordConfirm ? 'border-rose-400' : 'border-zinc-200'}`} />
                        </div>
                    </div>
                </div>
                 <button disabled={isLoading} type="submit" className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white rounded-xl font-black text-sm transition duration-300 shadow-md">
                   {isLoading ? '변경 중...' : '비밀번호 변경'}
                 </button>
             </form>
        )}

        {/* 회원가입 */}
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