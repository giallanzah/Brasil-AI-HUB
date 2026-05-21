/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './lib/AuthContext';
import { loginWithGoogle, logout } from './lib/firebase';
import { LogIn, LogOut, Map as MapIcon, Users, Video, Zap, Shield, Globe, Coffee, MessageSquare, Monitor, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PhaserGame from './game/PhaserGame';
import React, { useState, useEffect } from 'react';
import ChatOverlay from './components/ChatOverlay';
import GlobalChatOverlay from './components/GlobalChatOverlay';
import { Logo } from './components/Logo';
import { ControlOverlay } from './components/ControlOverlay';
import { PresenceManager, UserPresence } from './components/Presence';

type AvatarType = 'male' | 'female';

function FeatureCard({ icon: Icon, title, description, tag }: { icon: any, title: string, description: string, tag?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group h-full flex flex-col"
    >
      <div className="w-12 h-12 bg-gt-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:border-gt-400 transition-colors">
        <Icon className="w-6 h-6 text-gt-300" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 italic">{title}</h3>
      <p className="text-sm text-gt-200 leading-relaxed mb-4">{description}</p>
      {tag && (
        <div className="mt-auto">
           <span className="inline-block px-3 py-1 bg-gt-400/10 border border-gt-400/20 rounded-full text-[10px] font-bold text-gt-200 uppercase tracking-widest italic">{tag}</span>
        </div>
      )}
    </motion.div>
  );
}

function StepCard({ number, title, description, children, reverse = false }: { number: string, title: string, description: string, children: React.ReactNode, reverse?: boolean }) {
  return (
    <div className={`grid lg:grid-cols-2 gap-16 items-center py-24 border-b border-white/5 last:border-b-0 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={`space-y-6 ${reverse ? 'lg:order-2' : ''}`}>
        <div className="w-10 h-10 bg-gt-400/10 border border-gt-400/20 rounded-xl flex items-center justify-center font-serif font-black text-gt-300">
          {number}
        </div>
        <h3 className="text-3xl font-serif font-black text-white italic">{title}</h3>
        <p className="text-lg text-gt-200 leading-relaxed">{description}</p>
      </div>
      <div className={`relative bg-gt-900 border border-white/10 rounded-[2rem] overflow-hidden aspect-[16/10] ${reverse ? 'lg:order-1' : ''}`}>
        {children}
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, role, initial }: { quote: string, name: string, role: string, initial: string }) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:border-white/20 transition-all flex flex-col h-full">
      <div className="flex text-gold mb-6">
        {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 fill-current" />)}
      </div>
      <p className="text-white italic text-base leading-relaxed mb-8 flex-1">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gt-400 flex items-center justify-center font-black text-[10px] italic border-2 border-[#1a1732]">
          {initial}
        </div>
        <div>
          <p className="text-sm font-black text-white">{name}</p>
          <p className="text-[10px] font-bold text-gt-300 uppercase tracking-widest">{role}</p>
        </div>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>('male');

  const handleLogin = () => {
    localStorage.setItem('BS_AVATAR', selectedAvatar);
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-[#1a1732] relative overflow-hidden font-sans scroll-smooth text-white">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gt-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-gt-teal/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-gt-400/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1732]/80 backdrop-blur-xl border-b border-gt-400/20">
        <div className="flex items-center justify-between px-8 h-16 max-w-7xl mx-auto">
          <Logo />
          <ul className="hidden md:flex items-center gap-8">
            <li><a href="#features" className="text-xs font-bold text-gt-200 hover:text-white uppercase tracking-widest transition-colors">Funcionalidades</a></li>
            <li><a href="#how" className="text-xs font-bold text-gt-200 hover:text-white uppercase tracking-widest transition-colors">Como funciona</a></li>
            <li><a href="#testimonials" className="text-xs font-bold text-gt-200 hover:text-white uppercase tracking-widest transition-colors">Depoimentos</a></li>
          </ul>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex p-1 bg-white/5 rounded-xl border border-white/10">
              <button 
                onClick={() => setSelectedAvatar('male')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${selectedAvatar === 'male' ? 'bg-gt-400 text-white shadow-lg shadow-gt-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                HOMEM
              </button>
              <button 
                onClick={() => setSelectedAvatar('female')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${selectedAvatar === 'female' ? 'bg-gt-400 text-white shadow-lg shadow-gt-400/20' : 'text-slate-400 hover:text-white'}`}
              >
                MULHER
              </button>
            </div>
            <button 
              onClick={handleLogin}
              className="bg-gt-400 hover:bg-gt-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gt-400/20"
            >
              Começar →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 mt-16 lg:py-32 grid lg:grid-cols-2 gap-16 items-center relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gt-400/10 border border-gt-400/20 rounded-full">
            <div className="w-2 h-2 bg-gt-teal rounded-full animate-pulse shadow-[0_0_8px_var(--gt-teal-main)]" />
            <span className="text-[10px] font-bold text-gt-200 uppercase tracking-wider italic">O escritório virtual do ecossistema brasileiro</span>
          </div>

          <h1 className="text-6xl sm:text-7xl font-serif font-black leading-[1.05] tracking-tight text-white">
            Seu time remoto, <br />
            <span className="text-gt-300 italic">presente</span> de <br />
            <span className="relative inline-block">
              verdade.
              <div className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-gt-amber to-gt-400 rounded-full opacity-50" />
            </span>
          </h1>

          <p className="text-xl text-gt-200 max-w-lg leading-relaxed font-medium">
            O Brasil Startups Hub é um espaço interativo onde sua equipe vive o dia a dia. 
            Mova-se, puxe uma cadeira e converse como se estivessem na mesma sala.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleLogin}
              className="flex items-center gap-3 bg-gt-400 hover:bg-gt-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-[0_20px_50px_rgba(108,99,232,0.3)] active:scale-95 group"
            >
              <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 bg-white rounded-full p-0.5 group-hover:rotate-12 transition-transform" />
              Entrar com Google
            </button>
            <a href="#preview" className="px-10 py-5 rounded-2xl font-black text-lg text-gt-200 hover:text-white border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 italic">
              Ver o escritório ↓
            </a>
          </div>

          <div className="flex items-center gap-8 pt-10 border-t border-white/5">
             <div className="flex items-center gap-2 text-[11px] font-bold text-gt-300 uppercase tracking-widest italic">
                <Zap className="w-3 h-3 text-gt-400" /> Gratuito até 25 pessoas
             </div>
             <div className="flex items-center gap-2 text-[11px] font-bold text-gt-300 uppercase tracking-widest italic">
                <Shield className="w-3 h-3 text-gt-400" /> 100% Open Source
             </div>
          </div>
        </motion.div>

        {/* Visual Mockup expanded */}
        <motion.div 
          id="preview"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative group"
        >
          <div className="absolute -inset-4 bg-gt-400/10 rounded-[3rem] blur-2xl group-hover:bg-gt-400/20 transition-all" />
          <div className="relative bg-[#1a1732] rounded-[2.5rem] border border-white/10 p-3 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Window controls */}
            <div className="flex gap-1.5 px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-gt-coral-dark/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-gt-amber-main/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-gt-teal-main/40" />
            </div>
            
            <div className="bg-[#1a1732] rounded-[1.8rem] overflow-hidden aspect-[16/10] relative">
               {/* Map Background Simulation */}
               <div className="absolute inset-0 bg-[#e8d5b0]" />
               <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,232,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,232,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
               
               {/* Top Wall UI */}
               <div className="absolute top-0 left-0 w-full h-8 bg-gt-green-outdoor" />

               {/* Meeting Room Alpha Mock */}
               <div className="absolute top-12 left-6 w-32 h-20 bg-gt-coral-light/10 border border-gt-coral-main/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                 <div className="bg-gt-coral-main/10 px-2 py-0.5 rounded text-[6px] font-black text-gt-coral-main absolute bottom-1 uppercase italic tracking-widest">Reunião Alpha</div>
               </div>

               {/* Avatars Simulation */}
               <div className="absolute top-1/2 left-1/3 flex flex-col items-center gap-2">
                 <div className="w-8 h-10 bg-gt-400 rounded-lg shadow-xl relative">
                   <div className="absolute -top-1 -right-1 w-3 h-3 bg-gt-teal-main border-2 border-white rounded-full" />
                 </div>
                 <div className="bg-gt-900 border border-white/20 px-2.5 py-0.5 rounded-full text-[8px] font-black text-white italic">Hugo (você)</div>
               </div>

               <div className="absolute top-1/3 left-1/2 flex flex-col items-center gap-2">
                 <div className="w-8 h-10 bg-gt-coral-main rounded-lg shadow-xl" />
                 <div className="bg-gt-900 border border-white/20 px-2.5 py-0.5 rounded-full text-[8px] font-black text-white italic">Mayara Rodrigues</div>
               </div>

               {/* Proximity Ring */}
               <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-gt-400/20 rounded-full animate-pulse pointer-events-none" />

               {/* Bottom UI Bar */}
               <div className="absolute bottom-6 inset-x-6 flex justify-between items-end">
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-gt-900/90 backdrop-blur rounded-xl border border-white/10 flex items-center justify-center text-gt-300">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="w-10 h-10 bg-gt-900/90 backdrop-blur rounded-xl border border-white/10 flex items-center justify-center text-gt-300">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 p-4 bg-gt-900/90 backdrop-blur border border-gt-400/20 rounded-2xl items-center text-white min-w-[200px]">
                    <div className="w-10 h-10 bg-gt-400 rounded-xl flex items-center justify-center font-bold text-lg italic shadow-lg shadow-gt-400/20">🎙️</div>
                    <div>
                      <div className="text-[10px] font-black tracking-tight italic">CHAT POR PROXIMIDADE</div>
                      <div className="text-[9px] text-gt-200 flex items-center gap-1">
                        <div className="w-1 h-1 bg-gt-teal-main rounded-full animate-pulse" />
                        Mayara está próxima...
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          <div className="p-12 text-center">
            <div className="text-5xl font-serif font-black text-gt-400 italic mb-2">2D</div>
            <p className="text-xs font-bold text-gt-300 uppercase tracking-widest">Mundo Interativo</p>
          </div>
          <div className="p-12 text-center">
            <div className="text-5xl font-serif font-black text-gt-400 italic mb-2">R$0</div>
            <p className="text-xs font-bold text-gt-300 uppercase tracking-widest">Até 25 Pessoas</p>
          </div>
          <div className="p-12 text-center">
            <div className="text-5xl font-serif font-black text-gt-400 italic mb-2">&lt;5m</div>
            <p className="text-xs font-bold text-gt-300 uppercase tracking-widest">Setup Rápido</p>
          </div>
          <div className="p-12 text-center">
            <div className="text-5xl font-serif font-black text-gt-400 italic mb-2">∞</div>
            <p className="text-xs font-bold text-gt-300 uppercase tracking-widest">Customizável</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-32">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
           <span className="text-[10px] font-black text-gt-400 uppercase tracking-[0.3em] italic">Funcionalidades</span>
           <h2 className="text-4xl sm:text-6xl font-serif font-black text-white italic leading-none">Tudo que seu time precisa</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={MapIcon}
            title="Escritório 2D"
            description="Um mapa pixel art completo com salas de reunião, lounge e corredores. Mova-se como num jogo."
            tag="Phaser.js"
          />
          <FeatureCard 
            icon={Zap}
            title="Proximity Chat"
            description="Inicie conversas de vídeo e áudio automaticamente ao se aproximar de alguém. Sem agendar nada."
            tag="Jitsi Meet"
          />
          <FeatureCard 
            icon={LogIn}
            title="Login com Google"
            description="Acesso seguro usando sua conta da organização. Sem cadastros complicados."
            tag="Firebase Auth"
          />
          <FeatureCard 
            icon={Users}
            title="Presença Real"
            description="Veja quem está focado, disponível ou em reunião em tempo real no mapa interativo."
            tag="Firestore"
          />
          <FeatureCard 
            icon={Video}
            title="Salas de Reunião"
            description="Caminhe até uma mesa para entrar em reuniões formais via Google Meet ou Jitsi."
            tag="Google Meet"
          />
          <FeatureCard 
            icon={Globe}
            title="Dados no Brasil"
            description="Infraestrutura 100% cloud com baixa latência e total privacidade para sua empresa."
            tag="Gratuito"
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="max-w-7xl mx-auto px-8 py-32 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
           <span className="text-[10px] font-black text-gt-400 uppercase tracking-[0.3em] italic">Experiência</span>
           <h2 className="text-4xl sm:text-6xl font-serif font-black text-white italic leading-none">Como funciona</h2>
        </div>

        <div className="space-y-0">
          <StepCard 
            number="01"
            title="Acesse o Hub"
            description="Faça login com sua conta do Google. Seu avatar aparece imediatamente no escritório e você já pode se mover usando as teclas WASD."
          >
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-3xl">
               <button onClick={handleLogin} className="flex items-center gap-3 bg-gt-400 text-white px-8 py-4 rounded-2xl font-black italic shadow-xl">
                 <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5 bg-white rounded-full p-0.5" />
                 Entrar com Google
               </button>
            </div>
          </StepCard>

          <StepCard 
            number="02"
            title="Navegue pelo Espaço"
            description="Caminhe pelos corredores, visite as salas de reunião ou vá ao lounge para um café. A Presença da equipe é visual e direta."
            reverse
          >
             <div className="absolute inset-x-8 inset-y-8 bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 bg-gt-900 border border-white/10 px-4 py-2 rounded-xl">
                      <div className="w-2 h-2 bg-gt-teal-main rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-gt-300 uppercase italic">Membro {i} Online</span>
                    </div>
                  ))}
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-gt-400 rounded-lg shadow-2xl" />
             </div>
          </StepCard>

          <StepCard 
            number="03"
            title="Converse Naturalmente"
            description="Ao chegar perto de alguém, o áudio e vídeo conectam automaticamente. É a proximidade real que o trabalho remoto precisava."
          >
             <div className="absolute inset-0 p-8 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                   <div className="bg-gt-700/20 border border-white/10 rounded-2xl flex items-center justify-center font-black italic text-gt-300">HUGO</div>
                   <div className="bg-rose-700/20 border border-white/10 rounded-2xl flex items-center justify-center font-black italic text-rose-300">MAYARA</div>
                </div>
                <div className="p-4 bg-gt-400/10 border border-gt-400/20 rounded-xl flex items-center gap-4">
                   <div className="w-8 h-8 bg-gt-400 rounded-lg flex items-center justify-center font-bold italic">🎙️</div>
                   <div>
                     <p className="text-[10px] font-black italic text-white uppercase">Chat por Proximidade</p>
                     <p className="text-[9px] font-bold text-gt-300">Aproximação detectada...</p>
                   </div>
                </div>
             </div>
          </StepCard>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-8 py-32 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
           <span className="text-[10px] font-black text-gt-400 uppercase tracking-[0.3em] italic">Depoimentos</span>
           <h2 className="text-4xl sm:text-6xl font-serif font-black text-white italic leading-none">Vozes da Comunidade</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="O Hub trouxe de volta a sensação de estar no escritório. Entrar na sala do lado pra tirar uma dúvida rápida — isso fazia muita falta."
            name="Hugo Giallanza"
            role="Presidente • Brasil Startups"
            initial="HG"
          />
          <TestimonialCard 
            quote="A funcionalidade de proximity chat é incrível. Antes, qualquer conversa virava uma reunião agendada. Agora é só chegar perto."
            name="Mayara Giallanza"
            role="Co-fundadora • Brasil Startups"
            initial="MG"
          />
          <TestimonialCard 
            quote="Ver quem está focado ou disponível mudou completamente nossa dinâmica de trabalho remoto nas quintas de oficina."
            name="Juan Ferreira"
            role="Dir. Administrativo • Brasil Startups"
            initial="JF"
          />
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-8 py-20">
<div className="bg-gradient-to-br from-gt-900 to-[#1a1732] border border-gt-400/20 rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden group">
   <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(108,99,232,0.1),transparent_70%)]" />
   <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
      <h2 className="text-4xl sm:text-6xl font-serif font-black text-white italic leading-tight">
        Seu time merece um escritório que funciona
      </h2>
      <p className="text-lg text-gt-200 font-medium leading-relaxed">
        Junte-se a centenas de fundadores brasileiros que já estão transformando o trabalho remoto no Hub.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handleLogin}
          className="bg-gt-400 hover:bg-gt-500 text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-gt-400/30 transition-all hover:scale-105 active:scale-95"
        >
          Entrar — É grátis
        </button>
      </div>
      <p className="text-[10px] font-black text-gt-300 uppercase tracking-[0.3em] italic">
        ✓ Sem cartão de crédito · ✓ Setup em 5 min · ✓ Open Source
      </p>
   </div>
</div>
</section>

      {/* Footer */}
<footer className="max-w-7xl mx-auto px-8 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-20">
<div className="flex flex-col items-center md:items-start gap-4">
  <Logo />
  <p className="text-[10px] font-bold text-gt-300 uppercase tracking-widest italic">© 2025 Brasil Startups · Brasília — DF</p>
</div>
<div className="flex gap-12">
    <div className="space-y-4">
      <h4 className="text-white font-black text-[10px] uppercase tracking-widest italic">Produto</h4>
      <ul className="space-y-2 text-[10px] font-bold text-gt-300 uppercase tracking-widest">
        <li><a href="#" className="hover:text-gt-400 transition-colors">Roadmap</a></li>
        <li><a href="#" className="hover:text-gt-400 transition-colors">API Docs</a></li>
      </ul>
    </div>
    <div className="space-y-4">
      <h4 className="text-white font-black text-[10px] uppercase tracking-widest italic">Social</h4>
      <ul className="space-y-2 text-[10px] font-bold text-gt-300 uppercase tracking-widest">
        <li><a href="#" className="hover:text-gt-400 transition-colors">Discord</a></li>
        <li><a href="#" className="hover:text-gt-400 transition-colors">Instagram</a></li>
      </ul>
    </div>
</div>
<div className="text-right hidden md:block">
   <p className="text-[10px] font-black text-white italic uppercase tracking-widest">Powered by loor.vc</p>
   <p className="text-[10px] text-gt-400 font-bold uppercase mt-1">presidencia@brasilstartups.org</p>
</div>
</footer>
    </div>
  );
}

function Hub() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<{ roomId: string, partnerName: string, partnerId: string } | null>(null);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'online' | 'absent' | 'in-meeting'>('online');
  const [selectedUserForOptions, setSelectedUserForOptions] = useState<UserPresence | null>(null);

  // Carregar usuários online e garantir o usuário local
  useEffect(() => {
    const unsubscribe = PresenceManager.subscribeToUsers((users) => {
      // Sincronizar status do usuário logado se ele estiver na lista
      const localUser = users.find(u => u.userId === user?.uid);
      if (localUser) {
        setCurrentStatus(localUser.status);
      }

      // Se o usuário local não estiver na lista (delay do Firestore), adiciona mock local temporário
      const hasLocal = users.some(u => u.userId === user?.uid);
      if (!hasLocal && user) {
        setOnlineUsers([
          {
            userId: user.uid,
            displayName: user.displayName || 'Você',
            photoURL: user.photoURL || undefined,
            x: 0, y: 0,
            status: currentStatus,
            room: 'Escritório',
            updatedAt: new Date()
          },
          ...users
        ]);
      } else {
        setOnlineUsers(users);
      }
    });
    return () => unsubscribe();
  }, [user, currentStatus]);

  // Escuta eventos do Phaser via window
  useEffect(() => {
    const handleChatEvent = (e: any) => {
      const { detail } = e;
      if (detail.type === 'START_CHAT') {
        setActiveChat({ 
          roomId: detail.roomId, 
          partnerName: detail.partnerName,
          partnerId: detail.partnerId
        });
      } else if (detail.type === 'END_CHAT') {
        setActiveChat(null);
      }
    };

    window.addEventListener('PHASER_CHAT', handleChatEvent);
    return () => window.removeEventListener('PHASER_CHAT', handleChatEvent);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const userId = e.dataTransfer.getData('userId');
    if (userId) {
      // Emitir evento para o Phaser
      window.dispatchEvent(new CustomEvent('PHASER_ACTION', {
        detail: { type: 'TELEPORT_TO_USER', userId }
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1732] overflow-hidden font-sans text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-gt-900/50 backdrop-blur-md border-b border-gt-400/20 z-20">
        <Logo className="scale-90 origin-left" />
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => window.open('https://meet.google.com/new', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gt-400 hover:bg-gt-500 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gt-400/20 italic"
            >
              <Video className="w-3 h-3" />
              Call Rápida
            </button>
            <button 
              onClick={() => setIsGlobalChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 italic"
            >
              <Globe className="w-3.5 h-3.5" />
              Mural Geral
            </button>
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div className="relative group/status z-30">
              <button 
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border font-sans cursor-pointer group shadow-lg ${
                  currentStatus === 'online' ? 'bg-gt-teal-main/10 border-gt-teal-main/30 text-gt-teal-main hover:bg-gt-teal-main/20 shadow-gt-teal-main/5' :
                  currentStatus === 'absent' ? 'bg-gt-amber-main/10 border-gt-amber-main/30 text-gt-amber-main hover:bg-gt-amber-main/20 shadow-gt-amber-main/5' :
                  'bg-gt-coral-main/10 border-gt-coral-main/30 text-gt-coral-main hover:bg-gt-coral-main/20 shadow-gt-coral-main/5'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  currentStatus === 'online' ? 'bg-gt-teal-main shadow-[0_0_8px_var(--gt-teal-main)]' :
                  currentStatus === 'absent' ? 'bg-gt-amber-main' : 'bg-gt-coral-main'
                }`} />
                <span>
                  {currentStatus === 'online' ? 'Disponível' : 
                   currentStatus === 'absent' ? 'Ausente' : 'Em Reunião'}
                </span>
                <span className="text-[7.5px] opacity-60 group-hover:translate-y-0.5 transition-transform duration-200">▼</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-44 bg-[#1a1732]/96 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-1.5 hidden group-hover/status:block hover:block animate-in fade-in duration-200">
                 {(['online', 'absent', 'in-meeting'] as const).map(s => {
                   const labels: Record<string, string> = {
                     'online': 'Disponível',
                     'absent': 'Ausente',
                     'in-meeting': 'Em Reunião'
                   };
                   const dotColors: Record<string, string> = {
                     'online': 'bg-gt-teal-main',
                     'absent': 'bg-gt-amber-main',
                     'in-meeting': 'bg-gt-coral-main'
                   };
                   return (
                     <button
                       key={s}
                       onClick={() => {
                         if (user) {
                           const p = new PresenceManager(user.uid);
                           p.updateStatus(s);
                           setCurrentStatus(s);
                         }
                       }}
                       className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left text-[9px] font-black uppercase tracking-widest hover:bg-white/5 cursor-pointer ${
                         currentStatus === s ? 'text-white bg-white/5 font-black' : 'text-slate-400 font-bold'
                       }`}
                     >
                       <div className={`w-2 h-2 rounded-full ${dotColors[s]}`} />
                       {labels[s]}
                     </button>
                   );
                 })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{user?.displayName}</p>
              <p className="text-[10px] text-gt-300 font-bold tracking-widest mt-1 uppercase">Membro Staff</p>
            </div>
            {user?.photoURL && (
              <img src={user.photoURL} alt="Me" className="w-9 h-9 rounded-xl border border-gt-400/30 shadow-lg" />
            )}
            <button 
              onClick={() => logout()}
              className="p-2.5 hover:bg-gt-coral-main/10 rounded-xl transition-all text-slate-500 hover:text-gt-coral-main border border-transparent hover:border-gt-coral-main/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Container */}
      <main 
        className="flex-1 relative bg-[#1a1732] flex items-center justify-center overflow-hidden"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {user && <PhaserGame userId={user.uid} displayName={user.displayName || 'Membro Staff'} />}
        
        {/* Compact Controls (CORREÇÃO 3) */}
        <ControlOverlay />

        {/* Draggable Mini Map (Refeito) */}
        <motion.div 
          drag
          dragMomentum={false}
          className="absolute bottom-10 right-10 w-48 h-48 bg-gt-900/80 backdrop-blur-2xl rounded-3xl border border-gt-400/30 shadow-2xl overflow-hidden cursor-move z-10 p-4"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gt-400 animate-pulse" />
                  <span className="text-[10px] font-black text-gt-300 uppercase tracking-[0.2em] italic">Mapa do Hub</span>
               </div>
            </div>
            <div className="flex-1 rounded-xl bg-black/40 border border-white/5 p-2 flex flex-col items-center justify-center text-center gap-2">
              <MapIcon className="w-6 h-6 text-gt-400" />
              <p className="text-[9px] font-bold text-gt-200 uppercase leading-tight italic" id="minimap-room">
                Escritório Central
              </p>
            </div>
          </div>
        </motion.div>

        {/* Online Status Card */}
        <aside className="absolute top-10 right-10 w-72 bg-gt-900/96 backdrop-blur-2xl rounded-3xl border border-gt-400/20 shadow-2xl overflow-hidden hidden xl:block z-10">
          <div className="p-6 border-b border-gt-400/20 bg-white/5">
            <h3 className="font-bold text-gt-100 flex items-center justify-between">
              <span className="flex items-center gap-2 italic">
                <Users className="w-4 h-4 text-gt-400" /> Escritório Online
              </span>
              <span className="text-xs px-2.5 py-1 bg-gt-400 text-white rounded-lg font-black uppercase">Live</span>
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-[460px] overflow-y-auto overflow-x-hidden scrollbar-hide" id="user-list">
             {onlineUsers.map(u => (
               <div 
                 key={u.userId}
                 draggable
                 onDragStart={(e) => {
                   e.dataTransfer.setData('userId', u.userId);
                 }}
                 onClick={() => {
                   setSelectedUserForOptions(u);
                 }}
                 className="group flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-gt-400/10 hover:border-gt-400/30 cursor-pointer transition-all shadow-sm active:scale-[0.98] relative overflow-hidden"
               >
                 <div className="relative shrink-0 pointer-events-none">
                   {u.photoURL ? (
                     <img src={u.photoURL} className="w-10 h-10 rounded-xl" alt="" />
                   ) : (
                     <div className="w-10 h-10 rounded-xl bg-gt-400 flex items-center justify-center font-black text-[10px] text-white">
                       {u.displayName?.substring(0, 2).toUpperCase()}
                     </div>
                   )}
                   <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[#1a1732] rounded-full ${
                     u.status === 'online' ? 'bg-gt-teal-main' : u.status === 'absent' ? 'bg-gt-amber-main' : u.status === 'in-meeting' ? 'bg-gt-coral-main' : 'bg-slate-500'
                   }`} />
                 </div>
                 <div className="flex-1 min-w-0 pointer-events-none">
                   <div className="flex items-center gap-1.5 overflow-hidden">
                     <p className="text-[13px] font-black text-white truncate">{u.displayName}</p>
                     {u.userId === user?.uid && (
                       <span className="text-[7px] font-black bg-gt-400/20 text-gt-300 px-1 py-0.5 rounded uppercase tracking-tighter italic">Você</span>
                     )}
                   </div>
                   <p className="text-[9px] text-gt-300 font-bold uppercase tracking-widest truncate opacity-60 mt-0.5 italic">
                     {u.status === 'offline' ? 'Offline' : (u.room || 'Escritório')}
                   </p>
                 </div>
               </div>
             ))}
          </div>

          <div className="p-4 pt-1 border-t border-white/5 bg-white/2">
             <p className="text-[8px] font-black text-gt-300 uppercase tracking-widest mb-3 mt-4 text-center italic">Teleporte Rápido</p>
             <div className="grid grid-cols-2 gap-1.5 pb-4">
                {[
                  { name: 'HUB / ENTRADA', pos: { x: 750, y: 395 } },
                  { name: 'CONFERÊNCIA', pos: { x: 250, y: 780 } },
                  { name: 'LOUNGE', pos: { x: 640, y: 400 } },
                  { name: 'BIBLIOTECA', pos: { x: 1000, y: 780 } },
                  { name: 'RECPÇÃO', pos: { x: 370, y: 90 } },
                  { name: 'INFRA & TI', pos: { x: 170, y: 90 } }
                ].map(loc => (
                  <button 
                    key={loc.name}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('PHASER_ACTION', {
                        detail: { type: 'TELEPORT_TO_COORD', x: loc.pos.x, y: loc.pos.y, room: loc.name }
                      }));
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-gt-400/10 hover:border-gt-400/30 transition-all text-center group"
                  >
                    <span className="text-[7px] font-black text-gt-300 uppercase tracking-tighter group-hover:text-gt-400 italic leading-none">{loc.name}</span>
                  </button>
                ))}
             </div>
          </div>
        </aside>

        {/* Chat Overlay */}
        <AnimatePresence>
          {activeChat && user && (
            <ChatOverlay 
              roomId={activeChat.roomId}
              userId={user.uid}
              userName={user.displayName || 'Staff'}
              partnerName={activeChat.partnerName}
              onClose={() => setActiveChat(null)}
            />
          )}
          {isGlobalChatOpen && user && (
            <GlobalChatOverlay 
              userId={user.uid}
              userName={user.displayName || 'Staff'}
              onClose={() => setIsGlobalChatOpen(false)}
            />
          )}
          {selectedUserForOptions && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm bg-[#1a1732] border border-gt-400/30 rounded-[2.5rem] shadow-2xl p-6 relative overflow-hidden"
              >
                {/* Background ambient light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gt-400/10 rounded-full blur-3xl pointer-events-none" />

                <button 
                  onClick={() => setSelectedUserForOptions(null)}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* User Info Header */}
                <div className="flex flex-col items-center mt-4 mb-6 text-center">
                  <div className="relative mb-3">
                    {selectedUserForOptions.photoURL ? (
                      <img src={selectedUserForOptions.photoURL} className="w-16 h-16 rounded-2xl border-2 border-gt-400 shadow-xl" alt="" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gt-400 flex items-center justify-center font-black text-xl text-white shadow-xl">
                        {selectedUserForOptions.displayName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 border-4 border-[#1a1732] rounded-full ${
                      selectedUserForOptions.status === 'online' ? 'bg-gt-teal-main' : 
                      selectedUserForOptions.status === 'absent' ? 'bg-gt-amber-main' : 
                      selectedUserForOptions.status === 'in-meeting' ? 'bg-gt-coral-main' : 'bg-slate-500'
                    }`} />
                  </div>
                  <h4 className="text-lg font-black text-white italic tracking-tight">{selectedUserForOptions.displayName}</h4>
                  <p className="text-xs text-gt-300 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 justify-center">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedUserForOptions.status === 'online' ? 'bg-gt-teal-main animate-pulse' : 
                      selectedUserForOptions.status === 'absent' ? 'bg-gt-amber-main' : 
                      selectedUserForOptions.status === 'in-meeting' ? 'bg-gt-coral-main' : 'bg-slate-500'
                    }`} />
                    {selectedUserForOptions.status === 'online' ? 'Disponível' : 
                     selectedUserForOptions.status === 'absent' ? 'Ausente' : 
                     selectedUserForOptions.status === 'in-meeting' ? 'Em Reunião' : 'Offline'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
                    Sala Atual: <span className="font-bold text-gt-200">{selectedUserForOptions.status === 'offline' ? 'Fora do escritório' : (selectedUserForOptions.room || 'Hub')}</span>
                  </p>
                </div>

                {/* Action Options */}
                <div className="space-y-2.5 bg-transparent relative z-10">
                  {/* 1. Chat Direcionado */}
                  <button
                    onClick={() => {
                      if (user) {
                        const chatRoomId = `BrasilStartups_Hub_${[user.uid, selectedUserForOptions.userId].sort().join('_')}`;
                        setActiveChat({
                          roomId: chatRoomId,
                          partnerName: selectedUserForOptions.displayName,
                          partnerId: selectedUserForOptions.userId
                        });
                        setSelectedUserForOptions(null);
                      }
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gt-400 hover:bg-gt-500 text-white rounded-2xl transition-all font-bold text-xs uppercase tracking-wider shadow-lg shadow-gt-400/20 italic cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Chat Direcionado
                    </span>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-md uppercase tracking-tight">Privado</span>
                  </button>

                  {/* 2. Video Call (Meet) */}
                  <button
                    onClick={() => {
                      window.open(`https://meet.google.com/new`, '_blank');
                      setSelectedUserForOptions(null);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider cursor-pointer group"
                  >
                    <span className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-gt-300" />
                      Chamada no Meet
                    </span>
                    <span className="text-[8px] text-slate-400 font-normal">Link Único</span>
                  </button>

                  {/* 3. Ir até o Avatar (only if online) */}
                  {selectedUserForOptions.status !== 'offline' && selectedUserForOptions.userId !== user?.uid && (
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('PHASER_ACTION', {
                          detail: { type: 'TELEPORT_TO_USER', userId: selectedUserForOptions.userId }
                        }));
                        setSelectedUserForOptions(null);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 hover:text-white border border-indigo-500/20 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider cursor-pointer group"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Ir até o avatar
                      </span>
                      <span className="text-[8px] text-indigo-300">Teleporte</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* JITSI CONTAINER */}
        <div 
          id="jitsi-container" 
          className="absolute bottom-6 right-6 z-[100] shadow-2xl rounded-3xl overflow-hidden border-4 border-gt-400/30 hidden"
          style={{ width: '320px', height: '240px' }}
        />
      </main>
    </div>
  );
}

function MainContent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-[#1a1732]">
        <div className="w-16 h-16 border-4 border-gt-400/20 border-t-gt-400 rounded-full animate-spin" />
        <p className="text-gt-400 font-bold tracking-widest text-xs uppercase animate-pulse font-sans">Iniciando Hub...</p>
      </div>
    );
  }
  
  return user ? <Hub /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}


