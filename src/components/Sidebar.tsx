import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, Users, Scissors, DollarSign, Package, Bell, 
  LogOut, ShieldAlert, CheckCircle, Feather, Menu, X, Contact
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen 
}) => {
  const { logout, user, isLoggedIn } = useApp();

  const menuItems = [
    { id: 'agenda', name: 'Reservas & Agenda', icon: Calendar },
    { id: 'clientes', name: 'Histórico de Clientes', icon: Users },
    { id: 'servicos', name: 'Serviços & Preços', icon: Scissors },
    { id: 'profissionais', name: 'Equipe & Profissionais', icon: Contact },
    { id: 'caixa', name: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'estoque', name: 'Estoque Cosmético', icon: Package },
    { id: 'alertas', name: 'Alertas Antecipados', icon: Bell },
  ];

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    setIsOpen(false); // Close on mobile
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between py-8 px-4 bg-brand-beige">
      {/* Brand & Logo */}
      <div className="space-y-6">
        <div className="py-2">
          <h1 className="font-cursive font-logo text-5xl text-center text-brand-moss select-none leading-tight">Fran Hair</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-center mt-2 opacity-60 text-brand-clay font-sans font-bold">Estética & Cuidado</p>
        </div>
        
        {/* Navigation list */}
        <nav id="sidebar-nav" className="space-y-1 pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`sidebar-tab-${item.id}`}
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-sans font-semibold transition-all duration-200 cursor-pointer text-left ${
                  isActive 
                    ? 'bg-brand-moss text-brand-offwhite shadow-md' 
                    : 'text-brand-clay/80 hover:bg-brand-moss hover:text-brand-offwhite hover:opacity-100 transition-colors'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-brand-clay/70 group-hover:text-brand-offwhite'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Status / Logout Card */}
      <div className="pt-6 border-t border-brand-beige-dark/50">
        {isLoggedIn && user ? (
          <div className="p-3 bg-brand-offwhite/50 border border-brand-beige-dark/40 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="user avatar" 
                  className="w-10 h-10 rounded-full border border-brand-moss/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-moss/10 flex items-center justify-center text-brand-moss border border-brand-moss/15 font-serif font-bold text-sm">
                  {user.displayName ? user.displayName[0] : 'U'}
                </div>
              )}
              <div className="truncate min-w-0">
                <p className="text-xs font-serif font-semibold text-brand-clay truncate">
                  {user.displayName || 'Profissional'}
                </p>
                <p className="text-[10px] text-brand-clay-light truncate">{user.email}</p>
              </div>
            </div>
            <button
              id="logout-btn-sidebar"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-sans font-medium text-red-700 hover:bg-red-50/70 border border-red-200/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </button>
          </div>
        ) : (
          <div className="p-4 bg-brand-offwhite/50 rounded-xl border border-brand-beige-dark/50 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-clay font-semibold font-mono uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-moss" />
              Modo Offline
            </div>
            <p className="text-[10px] text-brand-clay-light leading-snug font-sans">
              Dados salvos localmente. Faça login para fazer backup em tempo real.
            </p>
            <button
              id="logout-btn-local"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-sans font-semibold text-brand-clay hover:bg-brand-beige/70 transition-colors border border-brand-beige-dark/50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair do Sandbox
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        id="desktop-sidebar"
        className="hidden md:block w-64 bg-brand-beige border-r border-brand-beige-dark flex-col select-none shrink-0"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-clay/40 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-64 z-50 bg-brand-beige border-r border-brand-beige-dark md:hidden flex flex-col"
          >
            {/* Mobile close button */}
            <div className="absolute top-4 right-4 z-10 w-8 h-8">
              <button 
                id="close-mobile-sidebar"
                onClick={() => setIsOpen(false)}
                className="p-1.5 bg-brand-offwhite rounded-md border border-brand-beige-dark/40 text-brand-clay cursor-pointer block h-full w-full flex items-center justify-center"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
