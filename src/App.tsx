/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Tabs Components
import { AgendaTab } from './components/DashboardTabs/AgendaTab';
import { ClientesTab } from './components/DashboardTabs/ClientesTab';
import { ServicosTab } from './components/DashboardTabs/ServicosTab';
import { CaixaTab } from './components/DashboardTabs/CaixaTab';
import { EstoqueTab } from './components/DashboardTabs/EstoqueTab';
import { AlertasTab } from './components/DashboardTabs/AlertasTab';

// Main Inner Dashboard Layout Component
const DashboardContent: React.FC = () => {
  const { isLoggedIn, isOfflineMode, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState<string>('agenda');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // If loading, show elegant natural sandloader spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex flex-col justify-center items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-brand-beige border-t-brand-moss rounded-full animate-spin"></div>
        </div>
        <p className="font-serif text-sm font-semibold text-brand-clay tracking-wide animate-pulse">Carregando painel Fran Hair...</p>
      </div>
    );
  }

  // Auth gate checks: If not authenticated and did not click Sandbox Mode, redirect
  if (!isLoggedIn && !isOfflineMode) {
    return <LandingPage />;
  }

  // Function to render active workspace panel
  const renderTabContent = () => {
    switch (activeTab) {
      case 'agenda':
        return <AgendaTab onRedirectToAlerts={() => setActiveTab('alertas')} />;
      case 'clientes':
        return <ClientesTab />;
      case 'servicos':
        return <ServicosTab />;
      case 'caixa':
        return <CaixaTab />;
      case 'estoque':
        return <EstoqueTab />;
      case 'alertas':
        return <AlertasTab />;
      default:
        return <AgendaTab onRedirectToAlerts={() => setActiveTab('alertas')} />;
    }
  };

  return (
    <div className="h-screen bg-brand-offwhite flex overflow-hidden">
      
      {/* Sidebar selection panels */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main active sub-workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header bar items and reactive elements */}
        <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable sub-panel section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {renderTabContent()}
        </main>

      </div>
    </div>
  );
};

// Main App Wrap Provider
export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
