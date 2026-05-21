import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const ControlOverlay = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVisible) {
      timer = setTimeout(() => setIsVisible(false), 8000);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // "?" key is usually Shift + / or a specific key
      if (e.key === '?' || e.key === '/') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-[20px] left-[20px] w-[72px] h-[72px] bg-gt-900/75 backdrop-blur-[8px] rounded-[12px] border border-gt-400/20 z-[100] p-1.5 shadow-2xl overflow-hidden pointer-events-none"
        >
          <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0.5 opacity-60">
            <div />
            <div className="flex items-center justify-center">
              <ChevronUp className="w-4 h-4 text-white" />
            </div>
            <div />
            
            <div className="flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-1 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
            
            <div />
            <div className="flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
            <div />
          </div>
          <div className="absolute top-0.5 right-1 text-[7px] font-black text-white/20 uppercase">
             WASD
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
