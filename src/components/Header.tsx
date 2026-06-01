import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, DollarSign, PackageOpen, CloudLightning, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setSidebarOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setSidebarOpen }) => {
  const { 
    transactions, 
    products, 
    isLoggedIn, 
    hasUnsyncedData, 
    syncLocalToCloud,
    isLoading 
  } = useApp();

  // Determine Tab Title
  const getTabTitle = () => {
    switch(activeTab) {
      case 'agenda': return 'Agenda & Reservas';
      case 'clientes': return 'Histórico de Clientes';
      case 'servicos': return 'Catálogo de Serviços';
      case 'profissionais': return 'Gestão de Profissionais';
      case 'caixa': return 'Fluxo de Caixa';
      case 'estoque': return 'Estoque e Suprimentos';
      case 'alertas': return 'Central de Alertas & Modelos';
      default: return 'Fran Hair';
    }
  };

  // Calculate Cash Flows Balance
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceitas - totalDespesas;

  // Calculate Out-of-Stock Supplies Count
  const criticalProductsCount = products.filter(p => p.quantity <= p.minQuantity).length;

  return (
    <header 
      id="app-header"
      className="bg-brand-offwhite/40 backdrop-blur-md border-b border-brand-beige-dark/60 h-20 px-4 md:px-8 flex items-center justify-between select-none shrink-0"
    >
      {/* Tab Title / Menu Trigger */}
      <div className="flex items-center gap-3">
        <button 
          id="toggle-mobile-sidebar"
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg bg-brand-offwhite border border-brand-beige-dark/50 text-brand-clay cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-serif text-xl md:text-2xl text-brand-clay font-bold tracking-tight">
          {getTabTitle()}
        </h2>
      </div>

      {/* Info Indicators Bar */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* Unsynced cloud warning / triggers */}
        {hasUnsyncedData && isLoggedIn && (
          <button
            id="cloud-sync-btn"
            onClick={syncLocalToCloud}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100/80 transition-colors rounded-xl text-xs font-sans font-medium cursor-pointer animate-pulse shrink-0"
            title="Clique para sincronizar suas alterações locais com a nuvem do Google Firestore."
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Push p/ Nuvem</span>
          </button>
        )}

        {/* Critical Stock Alert Notification indicator */}
        <div 
          id="header-stock-counter"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs shrink-0 ${
            criticalProductsCount > 0 
              ? 'bg-amber-100/70 text-amber-900 border-amber-300' 
              : 'bg-green-100/70 text-brand-moss border-green-300'
          }`}
          title={`${criticalProductsCount} produtos críticos abaixo do estoque mínimo`}
        >
          <PackageOpen className="w-3.5 h-3.5" />
          <span className="font-sans font-bold hidden sm:inline uppercase text-[10px]">Reposições:</span>
          <span className="font-mono font-bold">{criticalProductsCount}</span>
        </div>

        {/* Real-time cash balance highlight */}
        <div 
          id="header-cash-counter"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-brand-moss/20 text-xs text-brand-moss bg-brand-moss/5 shrink-0"
          title="Saldo total disponível em caixa"
        >
          <DollarSign className="w-3.5 h-3.5 text-brand-moss" />
          <span className="font-sans font-bold hidden md:inline uppercase text-[10px]">Caixa:</span>
          <span className="font-mono font-bold text-sm leading-none">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </header>
  );
};
