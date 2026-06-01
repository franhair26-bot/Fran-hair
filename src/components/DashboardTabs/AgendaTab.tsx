import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, Client, Service } from '../../types';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { CreateConfirmationModal } from '../CreateConfirmationModal';
import { 
  Calendar, Clock, UserCheck, Check, X, ShieldAlert, Sparkles, 
  Send, UserPlus, Phone, CreditCard, Filter, ChevronRight, User 
} from 'lucide-react';

interface AgendaTabProps {
  onRedirectToAlerts: () => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({ onRedirectToAlerts }) => {
  const { 
    appointments, 
    clients, 
    services, 
    addAppointment, 
    updateAppointmentStatus, 
    deleteAppointment,
    addClient,
    professionals
  } = useApp();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'confirmado' | 'concluido' | 'cancelado'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [professional, setProfessional] = useState<string>('');

  React.useEffect(() => {
    if (!professional && professionals && professionals.length > 0) {
      setProfessional(professionals[0].name);
    }
  }, [professionals, professional]);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isConfirmCreateOpen, setIsConfirmCreateOpen] = useState<boolean>(false);
  
  // Quick Client register inside form
  const [isQuickClientActive, setIsQuickClientActive] = useState<boolean>(false);
  const [quickName, setQuickName] = useState<string>('');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');

  // Handle Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Client
    if (!isQuickClientActive) {
      const matchClient = clients.find(c => c.id === selectedClientId);
      if (!matchClient) {
        alert("Selecione um cliente válido.");
        return;
      }
    } else {
      if (!quickName || !quickPhone) {
        alert("Por favor, preencha o Nome e Telefone do novo cliente.");
        return;
      }
    }

    // Validate Services
    const matchServices = services.filter(s => selectedServiceIds.includes(s.id));
    if (matchServices.length === 0) {
      alert("Por favor, selecione pelo menos um procedimento.");
      return;
    }

    if (!date || !time) {
      alert("Por favor, selecione a data e o horário.");
      return;
    }

    setIsConfirmCreateOpen(true);
  };

  const executeSaveAppointment = async () => {
    let clientIdToUse = selectedClientId;
    let clientNameToUse = '';
    let clientPhoneToUse = '';

    // 1. If Quick Client is active, create client first
    if (isQuickClientActive) {
      const createdId = await addClient({
        name: quickName,
        phone: quickPhone,
        email: quickEmail || 'nao@informado.com',
        notes: quickNotes || 'Cliente cadastrado rapidamente pela agenda.'
      });
      
      clientIdToUse = createdId;
      clientNameToUse = quickName;
      clientPhoneToUse = quickPhone;

      // Clean Quick Client fields
      setIsQuickClientActive(false);
      setQuickName('');
      setQuickPhone('');
      setQuickEmail('');
      setQuickNotes('');
    } else {
      const matchClient = clients.find(c => c.id === selectedClientId);
      if (matchClient) {
        clientNameToUse = matchClient.name;
        clientPhoneToUse = matchClient.phone;
      }
    }

    // Find services
    const matchServices = services.filter(s => selectedServiceIds.includes(s.id));
    const combinedName = matchServices.map(s => s.name).join(' + ');
    const combinedId = matchServices.map(s => s.id).join('_');
    const defaultTotal = matchServices.reduce((sum, s) => sum + s.price, 0);

    // Parse final price
    const finalPrice = customPrice !== '' ? parseFloat(customPrice) : defaultTotal;

    // Create Booking
    await addAppointment({
      clientId: clientIdToUse,
      clientName: clientNameToUse,
      clientPhone: clientPhoneToUse,
      serviceId: combinedId,
      serviceName: combinedName,
      date,
      time,
      status: 'pendente',
      price: finalPrice,
      professional: professional || (professionals && professionals[0] ? professionals[0].name : 'Fran Oliveira')
    });

    // Reset Form
    setSelectedClientId('');
    setSelectedServiceIds([]);
    setDate('');
    setTime('');
    setCustomPrice('');
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  // Calculate status counts
  const getStatusPillColor = (status: Appointment['status']) => {
    switch(status) {
      case 'pendente': return 'bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/20';
      case 'confirmado': return 'bg-[#d8e2dc] text-[#5a5a40] border-[#5a5a40]/20';
      case 'concluido': return 'bg-[#e5e7eb] text-[#4b5563] border-gray-200';
      case 'cancelado': return 'bg-red-50 text-red-800 border-red-200';
    }
  };

  return (
    <div id="agenda-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 selection:bg-brand-moss/10">
      
      {/* LEFT: Agendamentos list */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl border border-brand-beige flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-brand-clay font-medium text-sm">
            <Filter className="w-4 h-4 text-brand-clay-light" />
            <span>Filtrar por Status:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'pendente', 'confirmado', 'concluido', 'cancelado'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer border ${
                  statusFilter === filter 
                    ? 'bg-brand-clay text-brand-offwhite border-brand-clay' 
                    : 'bg-brand-offwhite hover:bg-brand-beige/50 text-brand-clay border-brand-beige-dark/40'
                }`}
              >
                {filter === 'all' ? 'Ver Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* LIST ELEMENT */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white/40 border border-dashed border-brand-beige-dark/50 rounded-2xl p-12 text-center text-brand-clay-light space-y-3">
              <Calendar className="w-12 h-12 mx-auto stroke-1" />
              <p className="font-serif text-lg">Sem agendamentos aqui.</p>
              <p className="text-xs max-w-sm mx-auto">Cadastre novos agendamentos no painel lateral para popular o seu calendário de atendimentos de hoje.</p>
            </div>
          ) : (
            filteredAppointments.map((app) => (
              <div 
                key={app.id}
                className="bg-white border border-brand-beige rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                {/* Time & Professional */}
                <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2">
                  <div className="bg-brand-moss/5 border border-brand-moss/15 px-4 py-2.5 rounded-xl text-center shrink-0">
                    <span className="block font-mono text-xs font-semibold text-brand-moss-light uppercase tracking-wider">Hora</span>
                    <span className="font-mono text-xl font-bold text-brand-moss">{app.time}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-brand-clay font-medium font-serif">
                      <User className="w-3.5 h-3.5 text-brand-moss" />
                      <span>{app.professional}</span>
                    </div>
                    <span className="font-mono text-[11px] text-brand-clay-light block mt-0.5">{app.date}</span>
                  </div>
                </div>

                {/* Patient / Service summary */}
                <div className="md:col-span-4 space-y-1">
                  <span className="font-serif text-base text-brand-clay block font-semibold leading-tight">{app.clientName}</span>
                  <span className="font-mono text-xs text-brand-clay-light block">{app.clientPhone}</span>
                  
                  <div className="inline-flex items-center gap-1 pt-1.5 leading-none">
                    <span className="text-xs bg-brand-beige text-brand-clay-light py-1 px-2.5 rounded-md border border-brand-beige-dark/40 font-medium">
                      {app.serviceName}
                    </span>
                    <span className="font-mono text-xs font-medium text-brand-clay ml-1.5">
                      R$ {app.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status indicator Pill */}
                <div className="md:col-span-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-sans font-medium border uppercase tracking-wider ${getStatusPillColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {/* Quick actions controls */}
                <div className="md:col-span-3 flex items-center justify-end flex-wrap gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-brand-beige">
                  
                  {/* Status transitions */}
                  {app.status === 'pendente' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'confirmado')}
                      className="p-1 px-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                      title="Marcar como Confirmado"
                    >
                      Confirmar
                    </button>
                  )}

                  {app.status !== 'concluido' && app.status !== 'cancelado' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(app.id, 'concluido')}
                        className="p-1 px-2.5 bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-xs rounded-lg transition-colors cursor-pointer font-medium flex items-center gap-1"
                        title="Concluir Atendimento (Registrará Receita de Caixa automaticamente)"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Concluir
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(app.id, 'cancelado')}
                        className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                        title="Cancelar Atendimento"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Redirection to dispatch Queue notifications */}
                  <button
                    onClick={onRedirectToAlerts}
                    className="p-1 px-2 bg-brand-beige hover:bg-brand-beige-dark/50 text-brand-clay border border-brand-beige-dark/40 text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    title="Ver fila de mensagens / Notificar cliente"
                  >
                    <Send className="w-3 h-3 text-brand-clay-light" />
                    Lembrete
                  </button>
                  
                  {/* Cancel / Trash Delete */}
                  <button
                    onClick={() => setDeleteConfirmId(app.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg text-xs transition-colors cursor-pointer font-medium"
                    title="Excluir do cadastro"
                  >
                    Deletar
                  </button>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Novo agendamento Form */}
      <div className="xl:col-span-4">
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-brand-clay font-medium">Novo Agendamento</h3>
            <p className="text-xs text-brand-clay-light">Adicione reservas, vincule profissionais, serviços e faça a gestão automática de fluxo de caixa.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Quick client creation toggle */}
            <div className="bg-brand-moss/5 border border-brand-moss/10 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-sans font-medium text-brand-clay">Novo Cliente? Cadastro Rápido</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isQuickClientActive}
                  onChange={(e) => setIsQuickClientActive(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-moss"></div>
              </label>
            </div>

            {/* Client selection or fields */}
            {!isQuickClientActive ? (
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Cliente Vinculado</label>
                <select
                  required={!isQuickClientActive}
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay"
                >
                  <option value="">Selecione um cliente existente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-brand-beige/25 border border-dashed border-brand-beige-dark/60 rounded-xl">
                <span className="text-xs font-mono font-semibold text-brand-moss uppercase tracking-wider block">Nova Ficha técnica integrada</span>
                
                <div className="space-y-1">
                  <input
                    type="text"
                    required={isQuickClientActive}
                    placeholder="Nome Completo do Cliente"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full bg-white border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-sans text-brand-clay"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required={isQuickClientActive}
                    placeholder="Telefone ex: (11) 99999-9999"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="w-full bg-white border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-sans text-brand-clay"
                  />
                  <input
                    type="email"
                    placeholder="E-mail (opcional)"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="w-full bg-white border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-sans text-brand-clay"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ficha rápida / Alergias"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full bg-white border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-sans text-brand-clay"
                />
              </div>
            )}

            {/* Service catalog selection */}
            <div className="space-y-2">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Procedimentos Selecionados ({selectedServiceIds.length})</label>
              
              {/* Dropdown to add a service */}
              <div>
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !selectedServiceIds.includes(val)) {
                      setSelectedServiceIds([...selectedServiceIds, val]);
                    }
                  }}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay cursor-pointer"
                >
                  <option value="">+ Adicionar procedimentos</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (R$ {s.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              {/* List of currently chosen services */}
              {selectedServiceIds.length > 0 ? (
                <div className="space-y-1.5 p-3 bg-brand-beige/25 border border-brand-beige-dark/40 rounded-xl">
                  {selectedServiceIds.map(id => {
                    const s = services.find(srv => srv.id === id);
                    if (!s) return null;
                    return (
                      <div key={id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-brand-beige text-xs text-brand-clay">
                        <span className="font-semibold">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-brand-moss font-bold">R$ {s.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedServiceIds(selectedServiceIds.filter(x => x !== id))}
                            className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer block"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-1.5 border-t border-brand-beige-dark/40 flex justify-between items-center text-xs font-bold text-brand-clay">
                    <span>Total Sugerido:</span>
                    <span className="font-mono text-brand-moss">
                      R$ {services.filter(s => selectedServiceIds.includes(s.id)).reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-brand-clay-light italic">Selecione e adicione um ou mais procedimentos acima.</p>
              )}
            </div>

            {/* Date and Time selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-sans text-brand-clay"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Horário</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-sans text-brand-clay"
                />
              </div>
            </div>

            {/* Professional Selection & Override Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Atendente</label>
                <select
                  required
                  value={professional || (professionals[0]?.name || '')}
                  onChange={(e) => setProfessional(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-sans text-brand-clay"
                >
                  {professionals.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  {professionals.length === 0 && (
                    <>
                      <option value="Fran Oliveira">Fran Oliveira</option>
                      <option value="Mayara Sousa">Mayara Sousa</option>
                      <option value="Camila Borges">Camila Borges</option>
                    </>
                  )}
                  <option value="Outro Salão">Outro Salão</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Preço Especial (Opcional)</label>
                <input
                  type="number"
                  placeholder="R$ Padrão"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-sans text-brand-clay"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              id="submit-booking-form"
              type="submit"
              className="w-full bg-brand-moss hover:bg-brand-moss-hover border border-brand-moss-dark/20 text-brand-offwhite font-sans py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer mt-4 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-white" />
              Agendar Cliente
            </button>
          </form>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteAppointment(deleteConfirmId);
          }
        }}
        title="Confirmar Exclusão"
        message={`Deseja realmente excluir permanentemente o agendamento de ${
          appointments.find(a => a.id === deleteConfirmId)?.clientName || 'este cliente'
        }?`}
      />

      <CreateConfirmationModal
        isOpen={isConfirmCreateOpen}
        onClose={() => setIsConfirmCreateOpen(false)}
        onConfirm={executeSaveAppointment}
        title="Confirmar Agendamento"
        message={`Deseja realmente registrar este agendamento para ${
          isQuickClientActive 
            ? quickName 
            : (clients.find(c => c.id === selectedClientId)?.name || 'o cliente selecionado')
        } no dia ${date ? date.split('-').reverse().join('/') : ''} às ${time}?`}
        confirmText="Confirmar Agendamento"
        type="success"
      />

    </div>
  );
};
