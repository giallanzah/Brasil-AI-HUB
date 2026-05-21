import React, { useState, useEffect, useRef } from 'react';
import { ChatService, ChatMessage } from './ChatService';
import { Send, X, Globe, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface GlobalChatOverlayProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function GlobalChatOverlay({ userId, userName, onClose }: GlobalChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Escuta mensagens do canal 'global' que armazena mensagens gerais persistidas
    const unsubscribeMessages = ChatService.subscribeToMessages('global', (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => {
      unsubscribeMessages();
    };
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText;
    setInputText('');
    await ChatService.sendMessage('global', userId, userName, text);
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 lg:right-16 z-[120] bg-indigo-600 text-white px-5 py-4 rounded-full shadow-2xl hover:bg-indigo-500 transition-colors flex items-center gap-2 font-bold tracking-tight text-xs border border-indigo-400/20"
      >
        <Globe className="w-5 h-5 animate-spin-slow" />
        <span>Mural Geral</span>
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-6 right-6 lg:right-16 z-[120] w-96 h-[480px] bg-[#1a1732]/95 backdrop-blur-2xl border border-gt-400/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="text-xs font-black text-white uppercase tracking-widest italic">Mural Geral & Asíncrono</span>
          <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded-full">Equipe</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 text-xs font-bold px-2">
            Mínimizar
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div className="bg-indigo-950/40 border-b border-indigo-800/20 px-4 py-2 text-[10px] text-indigo-200">
        Este chat conecta todos os membros. Mensagens são salvas para todos os usuários lerem online ou quando entrarem offline!
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 gap-2">
            <MessageSquare className="w-8 h-8 opacity-40 text-indigo-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 italic">Mural Vazio</p>
            <p className="text-[10px] leading-relaxed max-w-[200px]">Seja o primeiro a enviar uma mensagem para toda a equipe!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.senderId === userId ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                  {msg.senderId === userId ? 'Você' : msg.senderName}
                </span>
                {msg.senderId !== userId && (
                  <span className="text-[6px] text-indigo-300 bg-indigo-500/10 px-1 rounded">STAFF</span>
                )}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                msg.senderId === userId 
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10' 
                  : 'bg-white/5 text-slate-100 rounded-tl-none border border-white/5'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escreva um recado para a equipe..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </motion.div>
  );
}
