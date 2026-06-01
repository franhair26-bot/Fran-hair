import React from 'react';
import { useApp } from '../context/AppContext';
import { Scissors, Shield, Sparkles, Feather, Leaf } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginWithGoogle, enterLocalMode, isFirebaseSetup } = useApp();

  return (
    <div id="landing-page" className="min-h-screen bg-brand-offwhite flex flex-col justify-between p-4 md:p-8 selection:bg-brand-moss/10">
      {/* Upper Accents */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <Feather className="text-brand-moss w-6 h-6 animate-pulse" />
          <span className="font-cursive text-3xl md:text-4xl text-brand-clay font-medium select-none">Fran Hair</span>
        </div>
        <div className="text-xs font-mono bg-brand-beige text-brand-clay-light px-3 py-1 rounded-full border border-brand-beige-dark/50">
          v1.2.0 • Offline-First
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto w-full my-auto py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Pitch Area */}
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-moss/10 text-brand-moss border border-brand-moss/20">
            <Leaf className="w-4 h-4" />
            <span className="text-xs font-sans font-medium uppercase tracking-wider">Beleza Orgânica & Natural</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-clay leading-tight">
            Gestão elegante e natural para o seu salão.
          </h1>
          <p className="font-sans text-brand-clay-light text-base md:text-lg max-w-lg leading-relaxed">
            O <strong className="text-brand-clay font-semibold">Fran Hair</strong> é um sistema projetado para operar sem interrupções. Atenda clientes, faça agendamentos, verifique o estoque e gerencie o fluxo de caixa com ou sem conexão de internet.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-beige">
            <div className="space-y-1">
              <span className="font-mono text-xs text-brand-moss font-semibold uppercase tracking-wider block">Estilo Rústico</span>
              <span className="text-xs text-brand-clay-light">Design acolhedor e tons terrosos relaxantes.</span>
            </div>
            <div className="space-y-1">
              <span className="font-mono text-xs text-brand-moss font-semibold uppercase tracking-wider block">Zero Atrito</span>
              <span className="text-xs text-brand-clay-light">Funciona instantaneamente no navegador local.</span>
            </div>
          </div>
        </div>

        {/* Auth Box */}
        <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-brand-beige shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-serif text-2xl text-brand-clay">Iniciar Painel</h2>
            <p className="text-xs text-brand-clay-light">Escolha como deseja acessar as ferramentas e bases de dados do Fran Hair.</p>
          </div>

          <div className="space-y-4">
            {/* Google Authentication */}
            <button
              id="google-login-btn"
              onClick={loginWithGoogle}
              className="w-full bg-brand-moss hover:bg-brand-moss-hover text-brand-offwhite hover:text-white font-sans py-3 px-4 rounded-xl font-medium transition-all duration-250 flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.252 0-5.89-2.585-5.89-5.772s2.638-5.77 5.89-5.77c1.47 0 2.805.517 3.84 1.488l2.42-2.348C16.92 4.09 14.73 3 12.24 3c-4.99 0-9 3.97-9 8.887a8.88 8.88 0 0 0 9 8.886c5.216 0 8.665-3.513 8.665-8.5 0-.585-.053-1.127-.156-1.616l-8.509.127z"/>
              </svg>
              Entrar com o Google
            </button>

            <div className="flex items-center justify-between text-xs text-brand-clay-light gap-2 font-mono">
              <span className="h-[1px] bg-brand-beige flex-grow"></span>
              <span>ou modo simulado</span>
              <span className="h-[1px] bg-brand-beige flex-grow"></span>
            </div>

            {/* Offline Test Walkthrough */}
            <button
              id="offline-test-btn"
              onClick={enterLocalMode}
              className="w-full bg-brand-beige hover:bg-brand-beige-dark/70 text-brand-clay font-sans py-3 px-4 rounded-xl font-medium transition-all duration-200 border border-brand-beige-dark/40 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99]"
            >
              <Shield className="w-5 h-5 text-brand-clay-light" />
              Acessar modo de teste local
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-beige">
            <div className="flex items-start gap-2.5 text-xs text-brand-clay-light leading-snug">
              <Sparkles className="w-4 h-4 text-brand-moss shrink-0 mt-0.5" />
              <span>
                <strong className="text-brand-clay font-semibold">Garantia Reativa:</strong> Suas alterações são gravadas instantaneamente no cache do navegador.
              </span>
            </div>
            {!isFirebaseSetup && (
              <p className="text-[10px] text-amber-700/80 bg-amber-50 p-2 rounded-lg border border-amber-200 font-mono">
                * Conectividade com Firestore pendente no console. Utilizando persistência puramente local!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="max-w-7xl mx-auto w-full text-center py-6 border-t border-brand-beige/50">
        <p className="font-sans text-xs text-brand-clay-light">
          Fran Hair Salão de Beleza © 2026. Feito com amor, argila e sálvia. Uso interno administrativo.
        </p>
      </div>
    </div>
  );
};
