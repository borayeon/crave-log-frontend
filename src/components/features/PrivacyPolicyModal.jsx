import React from 'react';
import { X as CloseIcon, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/AppStore';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  const { currentLang } = useAppStore();
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[300] bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 영역 */}
        <header className="px-6 md:px-8 py-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900">
                {currentLang === 'zh' ? '隐私政策' : currentLang === 'en' ? 'Privacy Policy' : '개인정보처리방침'}
              </h2>
              <p className="text-xs font-bold text-zinc-500 mt-0.5 uppercase tracking-widest">Privacy Policy</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-zinc-400 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </header>

        {/* 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-zinc-50/30 text-sm text-zinc-700 leading-relaxed font-medium">
          
          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-2">
            <p className="font-bold text-indigo-900 text-xs">
              {currentLang === 'zh' 
                ? '本政策自2026年8月13日起正式生效施行。' 
                : currentLang === 'en' 
                ? 'This Privacy Policy is effective as of August 13, 2026.' 
                : '본 방침은 2026년 8월 13일부터 시행됩니다.'}
            </p>
          </div>

          {currentLang === 'zh' ? (
            <>
              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">第1条 (个人信息的处理目的)</h3>
                <p className="mb-2">“CraveLog”出于以下目的处理个人信息。所处理的个人信息不会用于以下目的之外的用途，如用途发生变更，将事先征得同意并采取必要措施。</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">会员注册及管理:</span> 确认注册意向、身份验证、维持及管理会员资格、防止不正当使用、发送通知。</li>
                  <li><span className="font-bold text-zinc-800">服务提供:</span> 个人名片与主页生成、基于邮箱验证的密码重置、社交登录关联。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">第2条 (收集的个人信息项目)</h3>
                <p className="mb-2">“CraveLog”为提供顺畅服务收集以下个人信息项目：</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">必填项:</span> 电子邮箱、密码、社交登录账户识别码、姓名、唯一用户账号(Handle)。</li>
                  <li><span className="font-bold text-zinc-800">选填项:</span> 头像、状态寄语、职务及专业、个人主页链接、兴趣与问答数据。</li>
                  <li><span className="font-bold text-zinc-800">自动收集项:</span> 服务使用记录、访问日志、Cookie、访问 IP 地址。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">第3条 (个人信息保存及使用期限)</h3>
                <p className="mb-2">在法律规定的期限内或在用户同意的期限内依法保存和处理个人信息。</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">会员管理:</span> 直至用户注销账号（有调查或法律法规要求的除外）。</li>
                  <li><span className="font-bold text-zinc-800">验证码记录:</span> 缓存在 Redis 内存中，5分钟后自动彻底销毁。</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">第4条 (向第三方提供及委托)</h3>
                <p>“CraveLog”仅在明示的范围内处理个人信息，除经用户同意或法律规定外，不会向第三方提供个人信息。（目前无向第三方提供或委托事项）</p>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">第5条 (用户权利及行使方式)</h3>
                <p>用户随时可以查询、修改自己的个人信息，或申请注销账号。联系个人信息保护负责人即可迅速获得处理。</p>
              </section>

              <section className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                <h3 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2">第6条 (个人信息保护负责人)</h3>
                <p className="mb-2 text-xs">为全面负责个人信息处理业务及解决相关疑问与投诉，指定以下保护负责人：</p>
                <ul className="space-y-1 text-xs font-bold text-zinc-800">
                  <li>• 姓名: 金泰庆 (Kim Tae-kyung)</li>
                  <li>• 邮箱: cravelog.admin@gmail.com</li>
                </ul>
              </section>
            </>
          ) : currentLang === 'en' ? (
            <>
              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">Article 1 (Purpose of Processing Personal Data)</h3>
                <p className="mb-2">'CraveLog' processes personal data for the following purposes. The personal data processed will not be used for purposes other than those specified:</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">Member Registration & Management:</span> Confirmation of registration, user identification/authentication, membership maintenance, prevention of improper use, and notification delivery.</li>
                  <li><span className="font-bold text-zinc-800">Service Delivery:</span> Profile, index, and portfolio creation, email-based password reset, social login integration.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">Article 2 (Categories of Personal Data Collected)</h3>
                <p className="mb-2">'CraveLog' collects the following categories of personal information to provide smooth services:</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">Required:</span> Email address, password, social account identifier, name, unique handle.</li>
                  <li><span className="font-bold text-zinc-800">Optional:</span> Profile picture, status message, career/major info, social links, portfolio data.</li>
                  <li><span className="font-bold text-zinc-800">Automatically Collected:</span> Usage logs, access timestamps, cookies, IP addresses.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">Article 3 (Retention and Processing Period)</h3>
                <p className="mb-2">Personal data is retained and processed within the period prescribed by applicable law or consented to by the user.</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">Membership Management:</span> Until account deletion (unless ongoing investigations apply).</li>
                  <li><span className="font-bold text-zinc-800">Verification Codes:</span> Automatically destroyed from in-memory Redis after 5 minutes.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">Article 4 (Third-Party Provision and Entrustment)</h3>
                <p>'CraveLog' does not provide user data to third parties without consent, except where required by law. (Currently no third-party provision or entrustment).</p>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">Article 5 (Rights of Data Subjects)</h3>
                <p>Users can view, edit their personal data or request deletion at any time by contacting our Privacy Officer.</p>
              </section>

              <section className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                <h3 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2">Article 6 (Privacy Officer)</h3>
                <p className="mb-2 text-xs">For privacy inquiries or complaints, contact our Data Protection Officer below:</p>
                <ul className="space-y-1 text-xs font-bold text-zinc-800">
                  <li>• Name: Tae-kyung Kim</li>
                  <li>• Email: cravelog.admin@gmail.com</li>
                </ul>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제1조 (개인정보의 처리 목적)
                </h3>
                <p className="mb-2">'CraveLog(크레이브로그)'는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">회원 가입 및 관리:</span> 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지</li>
                  <li><span className="font-bold text-zinc-800">서비스 제공:</span> 프로필(포트폴리오, 인덱스) 생성 및 공개, 이메일 인증 기반 비밀번호 재설정, 소셜 로그인(카카오) 연동</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제2조 (수집하는 개인정보 항목)
                </h3>
                <p className="mb-2">'CraveLog'는 원활한 서비스 제공을 위해 다음의 개인정보 항목을 수집하고 있습니다.</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">필수항목:</span> 이메일, 비밀번호 (자체 회원가입 시), 카카오 계정 식별정보 (카카오 로그인 시), 이름, 고유 아이디(Handle)</li>
                  <li><span className="font-bold text-zinc-800">선택항목:</span> 프로필 사진, 상태 메시지, 직무/전공 정보, 개인 소셜 링크, 기타 포트폴리오 및 취향 정보 (강점, 목표, 만다라트, Q&A, 취미 등)</li>
                  <li><span className="font-bold text-zinc-800">자동수집항목:</span> 서비스 이용기록, 접속 로그, 쿠키(Cookie), 접속 IP 정보</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제3조 (개인정보의 처리 및 보유 기간)
                </h3>
                <p className="mb-2">'CraveLog'는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 보유·이용 기간 내에서 개인정보를 처리·보유합니다.</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">회원 가입 및 관리:</span> 서비스 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                  <li><span className="font-bold text-zinc-800">인증번호 발송 기록:</span> Redis 인메모리를 통해 수집 5분 경과 후 자동 영구 파기</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제4조 (개인정보의 제3자 제공 및 위탁)
                </h3>
                <p>'CraveLog'는 정보주체의 개인정보를 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. (현재 제3자 제공 및 위탁 사항 없음)</p>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제5조 (정보주체의 권리·의무 및 행사방법)
                </h3>
                <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지(탈퇴)를 요청할 수도 있습니다. 개인정보 보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
              </section>

              <section>
                <h3 className="text-base font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제6조 (개인정보의 파기)
                </h3>
                <p className="mb-2">'CraveLog'는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다.</p>
                <ul className="list-disc pl-5 space-y-1.5 marker:text-zinc-400">
                  <li><span className="font-bold text-zinc-800">파기절차:</span> 이용자가 입력한 정보는 목적 달성 후 즉시 파기됩니다.</li>
                  <li><span className="font-bold text-zinc-800">파기방법:</span> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
                </ul>
              </section>

              <section className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                <h3 className="text-sm font-black text-zinc-900 mb-3 flex items-center gap-2">
                  제7조 (개인정보 보호책임자)
                </h3>
                <p className="mb-2 text-xs">본 서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 관련 문의 및 불만 처리를 위하여 아래와 같이 보호책임자를 지정하고 있습니다.</p>
                <ul className="space-y-1 text-xs font-bold text-zinc-800">
                  <li>• 이름: 김태경</li>
                  <li>• 이메일: cravelog.admin@gmail.com</li> 
                </ul>
              </section>
            </>
          )}

        </div>

        {/* 하단 닫기 버튼 영역 */}
        <footer className="px-6 md:px-8 py-5 border-t border-zinc-100 bg-white shrink-0 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-zinc-800 hover:shadow-lg transition-all"
          >
            {currentLang === 'zh' ? '已确认' : currentLang === 'en' ? 'I Understand' : '확인했습니다'}
          </button>
        </footer>
      </div>
    </div>
  );
};
export default PrivacyPolicyModal;