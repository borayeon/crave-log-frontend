import React, { useState } from 'react';
import { Lock, KeyRound, X, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const PasscodeModal = ({ recordId, recordTitle, onClose, onSuccess }) => {
  const { apiFetch, showToast, t } = useAppStore();
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg(t('passcode.enter_pin', '비밀번호를 입력해주세요.'));
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await apiFetch(`/records/${recordId}/verify-passcode`, {
        method: 'POST',
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      if (res?.ok) {
        const unlockedData = await res.json();
        showToast(t('passcode.unlocked_toast', '🔓 비밀 기록이 해제되었습니다.'));
        onSuccess(unlockedData);
        onClose();
      } else {
        const err = await res.json().catch(() => null);
        setErrorMsg(err?.message || t('passcode.incorrect', '비밀번호가 일치하지 않습니다.'));
      }
    } catch (err) {
      console.error('Passcode verification error:', err);
      setErrorMsg(t('auth.server_error', '검증 중 오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[500] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative border border-zinc-100 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
            <KeyRound size={22} />
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-black text-zinc-900 tracking-tight">
          {t('passcode.unlock_title', '비밀 공개 기록 해제')}
        </h3>
        <p className="text-xs text-zinc-500 font-semibold mt-1 mb-5 break-keep">
          {t('passcode.unlock_desc', { title: recordTitle || '선택한 기록' }, `"${recordTitle || '선택한 기록'}"을 열람하려면 작성자가 설정한 비밀번호(PIN)를 입력하세요.`)}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder={t('passcode.placeholder', '비밀번호 입력...')}
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl py-3 px-4 text-sm font-black tracking-widest text-zinc-900 outline-none transition-all"
              />
              <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1">
                <AlertCircle size={13} /> {errorMsg}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-xl text-xs font-black transition-all"
            >
              {t('common.cancel', '취소')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !passcode}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : t('profile.unlock_btn', '잠금 해제')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeModal;
