import React, { useState } from 'react';
import { Settings, Lock, AlertTriangle, KeyRound, Save, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/AppStore';

const AccountSettingsView = () => {
  const { setViewMode, apiFetch, showToast, handleLogout } = useAppStore();
  const [activeTab, setActiveTab] = useState('password');
  
  // 비밀번호 변경 상태
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  // 탈퇴용 비밀번호 상태
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 1. 비밀번호 변경 요청
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwData.currentPassword || !pwData.newPassword || !pwData.confirmPassword) {
      return showToast("모든 항목을 입력해주세요.");
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      return showToast("새 비밀번호가 서로 일치하지 않습니다.");
    }
    
    // 정규식 검증
    const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
    if (!regex.test(pwData.newPassword)) {
      return showToast("새 비밀번호는 영문, 숫자, 특수문자 조합 8자 이상이어야 합니다.");
    }

    try {
      const res = await apiFetch('/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: pwData.currentPassword,
          newPassword: pwData.newPassword
        })
      });

      if (res.ok) {
        showToast("비밀번호가 성공적으로 변경되었습니다. 🔐");
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorText = await res.text();
        showToast("현재 비밀번호가 일치하지 않습니다.");
      }
    } catch (err) {
      showToast("서버 오류가 발생했습니다.");
    }
  };

  // 2. 계정 탈퇴 요청
  const handleDeleteAccount = async () => {
    if (!deletePassword) return showToast("본인 확인을 위해 비밀번호를 입력해주세요.");

    try {
      const res = await apiFetch('/me', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword })
      });

      if (res.ok) {
        showToast("계정이 영구적으로 삭제되었습니다. 그동안 이용해주셔서 감사합니다.");
        handleLogout(); // 삭제 성공 시 자동 로그아웃 및 홈으로 이동
      } else {
        showToast("비밀번호가 일치하지 않습니다.");
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      showToast("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-10 animate-in fade-in duration-300 pb-28 md:pb-10">
      <header className="mb-8 border-b border-zinc-200/60 pb-6">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <Settings className="text-indigo-500" size={28} /> 계정 설정
        </h2>
        <p className="text-sm font-bold text-zinc-400 mt-2 uppercase tracking-widest">
          Account Settings
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 p-1 bg-zinc-100/50 rounded-2xl border border-zinc-200/50">
        <button onClick={() => setActiveTab('password')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'password' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'}`}>
          <Lock size={16} /> 비밀번호 재설정
        </button>
        <button onClick={() => setActiveTab('delete')} className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'delete' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'}`}>
          <AlertTriangle size={16} /> 계정 탈퇴
        </button>
      </div>

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200/60 animate-in fade-in">
          <h3 className="text-lg font-black text-zinc-800 mb-6 flex items-center gap-2">
            <KeyRound size={20} className="text-indigo-500" /> 비밀번호 변경
          </h3>
          
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">현재 비밀번호</label>
              <input type="password" value={pwData.currentPassword} onChange={e=>setPwData({...pwData, currentPassword: e.target.value})} className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">새 비밀번호</label>
              <input type="password" value={pwData.newPassword} onChange={e=>setPwData({...pwData, newPassword: e.target.value})} className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="영문, 숫자, 특수문자 조합 8자 이상" />
            </div>
            <div>
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-1">새 비밀번호 확인</label>
              <input type="password" value={pwData.confirmPassword} onChange={e=>setPwData({...pwData, confirmPassword: e.target.value})} className="w-full mt-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
          </div>
          
          <button type="submit" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
            <Save size={16} /> 변경사항 저장
          </button>
        </form>
      )}

      {activeTab === 'delete' && (
        <div className="bg-rose-50 p-8 rounded-[2rem] border border-rose-200 animate-in fade-in relative overflow-hidden">
          <div className="max-w-lg">
            <h3 className="text-xl font-black text-rose-600 flex items-center gap-2 mb-3">
              <AlertTriangle size={24} /> 정말로 떠나시나요?
            </h3>
            <p className="text-sm font-medium text-rose-700/80 mb-6 leading-relaxed">
              계정을 삭제하면 **모든 프로필 정보와 저장된 취향 기록, 태그가 영구적으로 파기**되며, 이는 어떠한 경우에도 복구할 수 없습니다. 계속 진행하시려면 비밀번호를 입력해주세요.
            </p>

            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="현재 비밀번호를 입력하세요" 
                value={deletePassword}
                onChange={e=>setDeletePassword(e.target.value)}
                className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 focus:ring-2 focus:ring-rose-500 outline-none" 
              />
              <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!deletePassword}
                  className="px-6 py-3 bg-rose-600 disabled:bg-rose-300 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2"
              >
                  <Trash2 size={16} /> 내 계정 영구 삭제
              </button>
            </div>
          </div>

          {/* 확인 팝업 오버레이 */}
          {showDeleteConfirm && (
              <div className="absolute inset-0 bg-rose-100/95 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
                  <AlertTriangle size={48} className="text-rose-500 mb-4" />
                  <h4 className="text-xl font-black text-rose-900 mb-2">정말 삭제하시겠습니까?</h4>
                  <p className="text-sm font-medium text-rose-700 mb-6">모든 데이터가 즉시, 그리고 영구적으로 파기됩니다.</p>
                  <div className="flex gap-3">
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 bg-white text-zinc-600 rounded-xl font-bold shadow-sm border border-zinc-200 hover:bg-zinc-50">
                          취소하기
                      </button>
                      <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-sm hover:bg-rose-700">
                          네, 완전히 삭제합니다
                      </button>
                  </div>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountSettingsView;