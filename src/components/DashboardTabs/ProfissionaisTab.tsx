import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { CreateConfirmationModal } from '../CreateConfirmationModal';
import { 
  Contact, Phone, Mail, Plus, Trash2, Award, 
  Calendar, DollarSign, Sparkles, UserPlus 
} from 'lucide-react';

const COLORS = [
  { hex: '#4d6b53', name: 'Verde Musgo' },
  { hex: '#c2a990', name: 'Bege Natural' },
  { hex: '#946c56', name: 'Argila' },
  { hex: '#d97706', name: 'Âmbar Escuro' },
  { hex: '#be185d', name: 'Rosa Chic' },
  { hex: '#0f766e', name: 'Azul Petróleo' },
  { hex: '#4b5563', name: 'Grafite' }
];

export const ProfissionaisTab: React.FC = () => {
  const { professionals, appointments, addProfessional, deleteProfessional } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4d6b53');

  // Modals state
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedProfId, setSelectedProfId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !role.trim() || !phone.trim() || !email.trim()) {
      return;
    }

    setIsConfirmCreateOpen(true);
  };

  const executeSaveProfessional = async () => {
    await addProfessional({
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
      color: selectedColor
    });

    // Reset Form
    setName('');
    setRole('');
    setPhone('');
    setEmail('');
    setSelectedColor('#4d6b53');
  };

  const handleDeleteClick = (id: string) => {
    setSelectedProfId(id);
    setIsConfirmDeleteOpen(true);
  };

  const executeDeleteProfessional = async () => {
    if (selectedProfId) {
      await deleteProfessional(selectedProfId);
      setSelectedProfId(null);
    }
  };

  // Calculations for statistics
  const getProfessionalStats = (profName: string) => {
    const profApps = appointments.filter(
      app => app.professional.toLowerCase().trim() === profName.toLowerCase().trim()
    );
    
    const count = profApps.length;
    
    const revenue = profApps
      .filter(app => app.status === 'concluido')
      .reduce((sum, app) => sum + app.price, 0);

    return { count, revenue };
  };

  const targetDeleteName = professionals.find(p => p.id === selectedProfId)?.name || '';

  return (
    <div className="space-y-6">
      
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Container */}
        <div className="lg:col-span-1 bg-white border border-brand-beige-dark/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-brand-beige/50">
            <div className="p-2 bg-brand-moss/10 rounded-xl text-brand-moss">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-clay">Novo Profissional</h3>
              <p className="text-xs text-brand-clay-light">Adicione colaboradores da sua equipe</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-clay font-sans uppercase tracking-wider">
                Nome Completo
              </label>
              <div className="relative">
                <input
                  id="prof-input-name"
                  type="text"
                  required
                  placeholder="Ex: Vitória Lima"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-offwhite/40 border border-brand-beige-dark/50 rounded-xl px-3 py-2.5 text-sm font-sans placeholder-brand-clay font-medium text-brand-clay focus:outline-none focus:ring-1 focus:ring-brand-moss/40 focus:border-brand-moss/80 transition-all"
                />
              </div>
            </div>

            {/* Role Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-clay font-sans uppercase tracking-wider">
                Especialidade / Cargo
              </label>
              <input
                id="prof-input-role"
                type="text"
                required
                placeholder="Ex: Designer de Sobrancelha"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-brand-offwhite/40 border border-brand-beige-dark/50 rounded-xl px-3 py-2.5 text-sm font-sans placeholder-brand-clay font-medium text-brand-clay focus:outline-none focus:ring-1 focus:ring-brand-moss/40 focus:border-brand-moss/80 transition-all"
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-clay font-sans uppercase tracking-wider">
                Telefone de Contato
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-clay-light">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  id="prof-input-phone"
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-brand-offwhite/40 border border-brand-beige-dark/50 rounded-xl pl-10 pr-3 py-2.5 text-sm font-sans placeholder-brand-clay font-medium text-brand-clay focus:outline-none focus:ring-1 focus:ring-brand-moss/40 focus:border-brand-moss/80 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-clay font-sans uppercase tracking-wider">
                Endereço de E-mail
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-clay-light">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="prof-input-email"
                  type="email"
                  required
                  placeholder="vitoria@fran-hair.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-offwhite/40 border border-brand-beige-dark/50 rounded-xl pl-10 pr-3 py-2.5 text-sm font-sans placeholder-brand-clay font-medium text-brand-clay focus:outline-none focus:ring-1 focus:ring-brand-moss/40 focus:border-brand-moss/80 transition-all"
                />
              </div>
            </div>

            {/* Color Palette Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-clay font-sans uppercase tracking-wider">
                Cor Identificadora
              </label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col.hex)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center`}
                    style={{ 
                      backgroundColor: col.hex,
                      borderColor: selectedColor === col.hex ? 'rgba(0,0,0,0.4)' : 'transparent',
                      transform: selectedColor === col.hex ? 'scale(1.15)' : 'scale(1)'
                    }}
                    title={col.name}
                  >
                    {selectedColor === col.hex && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-brand-clay-light font-sans mt-1">
                Esta cor será exibida na agenda para identificar facilmente este profissional.
              </p>
            </div>

            {/* Submit Button */}
            <button
              id="prof-submit-btn"
              type="submit"
              className="w-full mt-2 bg-brand-moss hover:bg-brand-moss-hover text-brand-offwhite shadow-md hover:shadow-lg transition-all duration-200 py-3 rounded-xl font-sans font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Profissional
            </button>

          </form>
        </div>

        {/* Professional Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-brand-clay">Membros Ativos ({professionals.length})</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((prof) => {
              const { count, revenue } = getProfessionalStats(prof.name);
              const initials = prof.name ? prof.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'P';
              const themeColor = prof.color || '#4d6b53';

              return (
                <div 
                  id={`professional-card-${prof.id}`}
                  key={prof.id}
                  className="bg-white border border-brand-beige-dark/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between group overflow-hidden"
                >
                  {/* Decorative side accent line in chosen color */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: themeColor }}
                  />

                  <div>
                    {/* Upper Card Row */}
                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm tracking-wide shadow-inner shrink-0"
                          style={{ backgroundColor: themeColor }}
                        >
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-brand-clay leading-snug">
                            {prof.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-xs text-brand-clay-light font-sans font-medium mt-0.5">
                            <Award className="w-3.5 h-3.5 text-brand-moss shrink-0" />
                            {prof.role}
                          </span>
                        </div>
                      </div>

                      {/* Delete professional action button */}
                      <button
                        id={`btn-delete-prof-${prof.id}`}
                        onClick={() => handleDeleteClick(prof.id)}
                        className="p-1.5 hover:bg-red-50 text-brand-clay-light hover:text-red-600 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                        title="Remover profissional do salão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Contacts info details section */}
                    <div className="pl-2 mt-5 space-y-1.5 border-t border-brand-beige/30 pt-3">
                      <div className="flex items-center gap-2 text-xs text-brand-clay-light">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-sans font-medium leading-none">{prof.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand-clay-light truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-sans font-medium leading-none select-all truncate">{prof.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* High-fidelity Statistics row */}
                  <div className="pl-2 mt-5 bg-brand-offwhite/50 border border-brand-beige-dark/40 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-center">
                    <div className="border-r border-brand-beige-dark/40">
                      <p className="text-[9px] uppercase tracking-wider text-brand-clay-light font-sans font-bold flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-moss" />
                        Sessões
                      </p>
                      <p className="font-mono text-sm font-bold text-brand-clay mt-0.5">{count}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-brand-clay-light font-sans font-bold flex items-center justify-center gap-1">
                        <DollarSign className="w-3 h-3 text-brand-moss" />
                        Realizado
                      </p>
                      <p className="font-mono text-sm font-bold text-emerald-800 mt-0.5">
                        R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {professionals.length === 0 && (
            <div className="bg-white border border-brand-beige border-dashed rounded-2xl p-8 text-center space-y-2">
              <Contact className="w-8 h-8 text-brand-beige-dark/50 mx-auto" />
              <p className="font-serif font-bold text-brand-clay text-sm">Nenhum profissional cadastrado</p>
              <p className="text-xs text-brand-clay-light">Insira os dados de sua equipe no formulário ao lado para começar.</p>
            </div>
          )}
        </div>

      </div>

      {/* Confirmation & deletion Modals */}
      <DeleteConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={executeDeleteProfessional}
        title="Confirmar Desligamento"
        message={`Deseja realmente remover o profissional "${targetDeleteName}" da equipe do salão? Os agendamentos já registrados vinculados a este profissional permanecerão arquivados.`}
      />

      <CreateConfirmationModal
        isOpen={isConfirmCreateOpen}
        onClose={() => setIsConfirmCreateOpen(false)}
        onConfirm={executeSaveProfessional}
        title="Confirmar Cadastro de Equipe"
        message={`Deseja realmente adicionar o profissional "${name}" atuando como "${role}" no seu painel?`}
        confirmText="Adicionar Profissional"
        type="success"
      />

    </div>
  );
};
