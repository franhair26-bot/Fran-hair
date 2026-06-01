import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, NotificationSetting } from '../../types';
import { 
  Bell, Edit, Save, Send, CheckCircle2, MessageSquare, 
  Mail, Phone, Clock, FileText, Sparkles, Copy, Check 
} from 'lucide-react';

export const AlertasTab: React.FC = () => {
  const { appointments, notificationSettings, updateNotificationSetting, editAppointment } = useApp();

  // Local state for editing templates
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateText, setTemplateText] = useState('');
  const [timeBeforeHours, setTimeBeforeHours] = useState<number>(24);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter future appointments that are NOT notified yet
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingReminders = appointments.filter(a => {
    // Show confirmed or pending status appointments that haven't been notified yet
    return (a.status === 'confirmado' || a.status === 'pendente') && !a.notified;
  });

  // Handle template edit activation
  const handleEditTemplate = (ns: NotificationSetting) => {
    setEditingTemplateId(ns.id);
    setTemplateText(ns.template);
    setTimeBeforeHours(ns.timeBeforeHours);
  };

  // Handle template save
  const handleSaveTemplate = async (id: string) => {
    const originalSetting = notificationSettings.find(n => n.id === id);
    if (!originalSetting) return;

    await updateNotificationSetting(id, templateText, originalSetting.isActive, timeBeforeHours);
    setEditingTemplateId(null);
  };

  // Toggle template active status
  const handleToggleActiveSetting = async (ns: NotificationSetting) => {
    await updateNotificationSetting(ns.id, ns.template, !ns.isActive, ns.timeBeforeHours);
  };

  // Compile individual client notification template values
  const compileTemplate = (template: string, app: Appointment) => {
    return template
      .replace(/{cliente}/g, app.clientName)
      .replace(/{servico}/g, app.serviceName)
      .replace(/{data}/g, app.date)
      .replace(/{hora}/g, app.time)
      .replace(/{profissional}/g, app.professional);
  };

  // Action copy to clipboard and mark as Notified
  const handleCopyAndMarkNotified = (app: Appointment, template: string) => {
    const compiled = compileTemplate(template, app);
    
    // Copy to clipboard
    navigator.clipboard.writeText(compiled);
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2500);

    // Automatically set notified: true after copying to help flow speed!
    const updated: Appointment = {
      ...app,
      notified: true
    };
    editAppointment(updated);
  };

  // Manually toggle check verified
  const handleManualMarkNotified = (app: Appointment) => {
    const updated: Appointment = {
      ...app,
      notified: true
    };
    editAppointment(updated);
  };

  return (
    <div id="alertas-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 selection:bg-brand-moss/10">

      {/* LEFT: Notification list (Message Dispatch Queue) */}
      <div className="xl:col-span-8 space-y-6">
        
        <div className="bg-white p-4 md:p-6 border border-brand-beige rounded-2xl shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-brand-clay font-medium">Fila de Disparo de Lembretes</h3>
            <p className="text-xs text-brand-clay-light">Clientes com reservas confirmadas ou pendentes que precisam ser relembrados. Clique para copiar e disparar o texto.</p>
          </div>

          <div className="space-y-4">
            {pendingReminders.length === 0 ? (
              <div className="bg-brand-offwhite/5 border border-dashed border-brand-beige-dark/50 rounded-xl p-12 text-center text-brand-clay-light space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto text-brand-moss stroke-1" />
                <p className="font-serif text-lg">Pronto! Fila de disparos vazia.</p>
                <p className="text-xs max-w-sm mx-auto">Todos os clientes com agendamentos cadastrados já foram notificados sobre suas reservas.</p>
              </div>
            ) : (
              pendingReminders.map((app) => {
                // Find appropriate active template
                const activeSetting = notificationSettings.find(n => n.isActive) || notificationSettings[0];
                const textToCopy = compileTemplate(activeSetting?.template || '', app);

                return (
                  <div 
                    key={app.id}
                    className="p-4 bg-brand-offwhite rounded-xl border border-brand-beige hover:border-brand-beige-dark transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-serif font-semibold text-brand-clay">{app.clientName}</strong>
                        <span className="font-mono text-[10px] text-brand-clay-light">({app.clientPhone})</span>
                        <span className="text-[10px] bg-brand-moss/10 text-brand-moss py-0.5 px-2 rounded-full border border-brand-moss/15 font-bold uppercase shrink-0">
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-brand-clay-light font-sans">
                        <span className="flex items-center gap-1.5 truncate">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-moss" />
                          Procedimento: {app.serviceName}
                        </span>
                        <span className="flex items-center gap-1.5 truncate font-mono">
                          <Clock className="w-3.5 h-3.5 text-brand-moss" />
                          Dia {app.date} às {app.time} ({app.professional})
                        </span>
                      </div>

                      {/* Display compiled message preview */}
                      <div className="p-2.5 bg-white border border-brand-beige-dark/30 rounded-lg text-[11px] text-brand-clay select-all font-sans italic relative pr-8">
                        <span className="text-[9px] font-mono uppercase bg-brand-beige py-0.5 px-1.5 rounded text-brand-clay-light not-italic font-bold absolute right-1.5 top-1.5">Preview {activeSetting?.channel}</span>
                        "{textToCopy}"
                      </div>
                    </div>

                    {/* Copy templates trigger action buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      
                      <button
                        onClick={() => handleCopyAndMarkNotified(app, activeSetting?.template || '')}
                        className="px-3.5 py-2 bg-brand-moss hover:bg-brand-moss-hover text-white text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                        title="Copiar texto compilado para a área de transferência e marcar cliente como Notificado automaticamente"
                      >
                        {copiedId === app.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-white" />
                            <span>Copiar & Notificar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleManualMarkNotified(app)}
                        className="p-2 bg-brand-beige hover:bg-brand-beige-dark/60 text-brand-clay border border-brand-beige-dark/30 hover:border-brand-clay text-xs rounded-xl transition-all cursor-pointer"
                        title="Marcar como Notificado diretamente"
                      >
                        Pular
                      </button>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Rules model & Template Editor Panel */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="font-serif text-base text-brand-clay font-medium">Modelos e Canais</h4>
            <p className="text-xs text-brand-clay-light">Configure os layouts do disparo de lembretes automáticos preenchendo as tags do Fran Hair.</p>
          </div>

          <div className="space-y-4">
            {notificationSettings.map((ns) => {
              const EditIcon = ns.channel === 'WhatsApp' ? MessageSquare : ns.channel === 'SMS' ? Phone : Mail;
              const isEditing = editingTemplateId === ns.id;

              return (
                <div 
                  key={ns.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ns.isActive 
                      ? 'bg-brand-moss/5 border-brand-moss' 
                      : 'bg-brand-offwhite border-brand-beige'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-2.5">
                    <span className="text-xs font-serif font-bold text-brand-clay flex items-center gap-1.5">
                      <EditIcon className="w-4 h-4 text-brand-moss" />
                      {ns.channel}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={ns.isActive}
                          onChange={() => handleToggleActiveSetting(ns)}
                          className="sr-only peer" 
                        />
                        <div className="w-7 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand-moss"></div>
                      </label>
                      <span className="text-[10px] font-mono text-brand-clay-light">
                        {ns.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2.5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-clay-light">
                          <span>Antecedência (Horas):</span>
                          <input 
                            type="number"
                            value={timeBeforeHours}
                            onChange={(e) => setTimeBeforeHours(parseInt(e.target.value) || 24)}
                            className="w-14 bg-white border border-brand-beige rounded px-1.5 py-0.5 text-center font-mono text-brand-clay"
                          />
                        </div>
                        <textarea
                          rows={4}
                          value={templateText}
                          onChange={(e) => setTemplateText(e.target.value)}
                          className="w-full bg-white border border-brand-beige-dark/50 rounded-lg p-2 text-xs font-sans text-brand-clay focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveTemplate(ns.id)}
                          className="w-full bg-brand-moss hover:bg-brand-moss-hover text-white py-1.5 px-3 rounded-lg text-xs font-sans font-medium flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Salvar Modelo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-brand-clay leading-relaxed italic whitespace-pre-line">
                          "{ns.template}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-brand-clay-light pt-2">
                          <span>Disparo: {ns.timeBeforeHours}h antes</span>
                          <button
                            onClick={() => handleEditTemplate(ns)}
                            className="text-brand-moss hover:bg-brand-moss/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                          >
                            Modificar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt formatting guide legends */}
          <div className="bg-brand-offwhite p-3.5 rounded-xl border border-brand-beige-dark/30 space-y-1.5 text-xs text-brand-clay-light leading-relaxed">
            <span className="font-serif font-bold text-brand-clay block text-[11px] uppercase tracking-wider">Tags Suportadas:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li><code className="bg-white border rounded px-1 text-brand-moss font-mono font-bold">{`{cliente}`}</code> : Nome do cliente</li>
              <li><code className="bg-white border rounded px-1 text-brand-moss font-mono font-bold">{`{data}`}</code> : Data da reserva</li>
              <li><code className="bg-white border rounded px-1 text-brand-moss font-mono font-bold">{`{hora}`}</code> : Horário do serviço</li>
              <li><code className="bg-white border rounded px-1 text-brand-moss font-mono font-bold">{`{servico}`}</code> : Nome do procedimento</li>
              <li><code className="bg-white border rounded px-1 text-brand-moss font-mono font-bold">{`{profissional}`}</code> : Nome da atendente</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
