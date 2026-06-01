import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { Users, Search, UserPlus, FileText, Trash2, Edit2, Phone, Mail, FileCheck } from 'lucide-react';

export const ClientesTab: React.FC = () => {
  const { clients, addClient, editClient, deleteClient } = useApp();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Filtering list
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submit trigger
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Por favor, preencha o Nome e Telefone.");
      return;
    }

    if (editingId) {
      // Editing
      const matchClient = clients.find(c => c.id === editingId);
      if (matchClient) {
        await editClient({
          ...matchClient,
          name,
          phone,
          email,
          notes
        });
      }
      setEditingId(null);
    } else {
      // Creating
      await addClient({
        name,
        phone,
        email,
        notes
      });
    }

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  // Select client to edit
  const handleEditClick = (c: Client) => {
    setEditingId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email);
    setNotes(c.notes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div id="clientes-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 selection:bg-brand-moss/10">

      {/* LEFT: Clients ledger search list */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Search header bar */}
        <div className="bg-white p-4 rounded-xl border border-brand-beige flex items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-clay-light" />
            <input
              type="text"
              placeholder="Pesquise por nome, telefone ou email de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss transition-colors"
            />
          </div>
        </div>

        {/* Clients cards grid */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white/40 border border-dashed border-brand-beige-dark/50 rounded-2xl p-12 text-center text-brand-clay-light space-y-3">
              <Users className="w-12 h-12 mx-auto stroke-1" />
              <p className="font-serif text-lg">Nenhum cliente cadastrado.</p>
              <p className="text-xs max-w-sm mx-auto">Adicione novos perfis no formulário ao lado para gerenciar observações de alergias e históricos de tratamentos capilares.</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div 
                key={client.id}
                className="bg-white border border-brand-beige rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-250 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Profile detail */}
                <div className="space-y-3 max-w-lg min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-moss/10 text-brand-moss border border-brand-moss/15 flex items-center justify-center font-serif font-bold text-base shrink-0">
                      {client.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-brand-clay font-semibold leading-tight">{client.name}</h4>
                      <p className="text-[10px] font-mono text-brand-clay-light">Cadastrado em: {client.createdAt}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-brand-clay font-sans">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-brand-moss shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-brand-moss shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>

                  {/* Observações de ficha técnica */}
                  {client.notes && (
                    <div className="p-3 bg-brand-offwhite rounded-xl border border-brand-beige-dark/40 text-xs text-brand-clay-light space-y-1">
                      <div className="flex items-center gap-1 font-sans font-semibold text-[10px] text-brand-clay uppercase tracking-wider">
                        <FileCheck className="w-3.5 h-3.5 text-brand-moss" />
                        Ficha Técnica & Alergias
                      </div>
                      <p className="leading-relaxed whitespace-pre-line">{client.notes}</p>
                    </div>
                  )}
                </div>

                {/* Edit & delete actions */}
                <div className="flex items-center gap-2 border-t md:border-t-0 border-brand-beige pt-3 md:pt-0 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => handleEditClick(client)}
                    className="p-2 bg-brand-beige/50 hover:bg-brand-beige-dark border border-brand-beige-dark/30 hover:border-brand-beige-dark text-brand-clay rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium font-sans"
                    title="Editar informações do cliente"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  {deleteConfirmId === client.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1.5 rounded-xl border border-red-200">
                      <button
                        onClick={() => {
                          deleteClient(client.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-sans font-bold cursor-pointer transition-colors"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-brand-beige hover:bg-brand-beige-dark/50 text-brand-clay rounded-lg text-xs font-sans transition-colors cursor-pointer"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(client.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium font-sans"
                      title="Excluir cadastro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Excluir</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Nova / Editar Cliente Form */}
      <div className="xl:col-span-4">
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-brand-clay font-medium">
              {editingId ? 'Editar Cliente' : 'Novo Perfil de Cliente'}
            </h3>
            <p className="text-xs text-brand-clay-light">
              {editingId ? 'Modifique os dados cadastrais e as observações de alergias/preferências.' : 'Crie um prontuário para organizar preferência de esmaltes, tinturas e restrições de cosméticos.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Ex. Ana Carolina Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Telefone de Contato</label>
              <input
                type="text"
                required
                placeholder="Ex. (11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">E-mail</label>
              <input
                type="email"
                placeholder="Ex. cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block font-serif">Ficha Técnica / Alergias / Observações</label>
              <textarea
                rows={4}
                placeholder="Indique alergias a formol/amônia, preferência por esmaltes nude, unhas em gel, marcas favoritas de finalizadores, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss resize-none leading-relaxed"
              />
            </div>

            {/* Form actions */}
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-brand-offwhite hover:bg-brand-beige text-brand-clay font-sans py-3 rounded-xl font-medium transition-colors cursor-pointer border border-brand-beige-dark/50"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-grow bg-brand-moss hover:bg-brand-moss-hover border border-brand-moss-dark/20 text-brand-offwhite font-sans py-3 rounded-xl font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-white" />
                {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};
