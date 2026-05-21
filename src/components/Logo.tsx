import React from 'react';

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-gt-400 flex items-center justify-center font-bold text-xs text-white shadow-[0_4px_12px_rgba(108,99,232,0.4)] border border-white/10 italic">
        AI
      </div>
      <div className="flex flex-col -space-y-1">
        <span className="font-serif font-black text-base text-gt-100 italic">AI HUB</span>
        <span className="text-[10px] font-bold text-gt-300 uppercase tracking-widest pl-0.5">by Brasil Startups</span>
      </div>
    </div>
  );
};
