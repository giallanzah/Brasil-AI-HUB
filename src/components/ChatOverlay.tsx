import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from './ChatService';
import { Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatOverlayProps {
  roomId: string;
  userId: string;
  userName: string;
  partnerName: string;
  onClose: () => void;
}

export default function ChatOverlay({ roomId, userId, userName, partnerName, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribeMessages = ChatService.subscribeToMessages(roomId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    const unsubscribeTyping = ChatService.subscribeToTyping(roomId, userId, (isTyping) => {
      setIsPartnerTyping(isTyping);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      // Limpar status de digitando ao fechar/desmontar
      ChatService.setTypingStatus(roomId, userId, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Notificar que está digitando
    if (val.trim()) {
      ChatService.setTypingStatus(roomId, userId, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        ChatService.setTypingStatus(roomId, userId, false);
      }, 3000);
    } else {
      ChatService.setTypingStatus(roomId, userId, false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    const text = inputText;
    setInputText('');
    await ChatService.sendMessage(roomId, userId, userName, text);
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-96 z-[110] bg-gt-400 text-white p-4 rounded-full shadow-2xl hover:bg-gt-500 transition-colors"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-6 right-96 z-[110] w-80 h-96 bg-gt-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gt-teal-main rounded-full animate-pulse" />
          <span className="text-xs font-black text-gt-100 uppercase tracking-widest">Chat com {partnerName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400">
            <motion.div rotate={180}>—</motion.div>
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.senderId === userId ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">
              {msg.senderId === userId ? 'Você' : msg.senderName}
            </span>
            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${
              msg.senderId === userId 
                ? 'bg-gt-400 text-white rounded-tr-none' 
                : 'bg-gt-800 text-gt-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isPartnerTyping && (
           <div className="flex flex-col items-start animate-pulse">
             <span className="text-[10px] text-gt-300 font-bold mb-1 uppercase tracking-tighter italic">
               {partnerName} está digitando...
             </span>
             <div className="bg-gt-800/50 px-3 py-1.5 rounded-2xl flex gap-1 items-center">
               <div className="w-1.5 h-1.5 bg-gt-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 bg-gt-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 bg-gt-300 rounded-full animate-bounce" />
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
        <input 
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Mensagem..."
          className="flex-1 bg-gt-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gt-400/50 transition-colors"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="bg-gt-400 hover:bg-gt-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
