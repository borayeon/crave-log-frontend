import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 text-center pb-8 animate-in fade-in duration-500 shrink-0 w-full border-t border-zinc-200/60 pt-6">
      
      {/* ⭐️ 정책 및 정보 링크 영역 */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] md:text-xs font-bold text-zinc-400 mb-4 px-4">
        <a 
          href="https://possible-lungfish-74d.notion.site/2-Terms-of-Service-3c56310e41b180049918e27f2cbfd71c?source=copy_link" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-zinc-600 transition-colors"
        >
          이용약관
        </a>
        <span className="text-zinc-300 hidden sm:inline">|</span>
        
        <a 
          href="https://possible-lungfish-74d.notion.site/1-Privacy-Policy-3c56310e41b1802e9c09d052c4b3dfe5?source=copy_link" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          개인정보처리방침
        </a>
        <span className="text-zinc-300 hidden sm:inline">|</span>

        {/* ⭐️ 라이선스 및 크레딧 표기 (추후 Notion 페이지 만들어서 href 수정) */}
        <a 
          href="https://possible-lungfish-74d.notion.site/Licenses-Credits-3c56310e41b180db862afaf3297ab599?source=copy_link" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-zinc-600 transition-colors flex items-center gap-1"
        >
          <ShieldCheck size={12} />
          <span>라이선스 및 크레딧</span>
        </a>
        <span className="text-zinc-300 hidden sm:inline">|</span>

        {/* ⭐️ 연락처 (mailto: 이메일 주소 수정) */}
        <a 
          href="mailto:retsbe13@gmail.com" 
          className="hover:text-zinc-600 transition-colors flex items-center gap-1"
        >
          <Mail size={12} />
          <span>Contact Us</span>
        </a>
      </div>

      <p className="text-[10px] text-zinc-400 font-medium">
        © 2026 CraveLog. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;