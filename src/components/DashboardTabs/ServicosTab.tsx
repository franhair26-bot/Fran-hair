import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Scissors, Clock, DollarSign, Plus, Trash2, Tag, CalendarRange } from 'lucide-react';

export const ServicosTab: React.FC = () => {
  const { services, addService, deleteService } = useApp();

  // Categories list
  const categories = ['Cabelo', 'Unhas', 'Estética', 'Maquiagem', 'Outros'];

  // Form states
  const [name, setName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [category, setCategory] = useState('Cabelo');
  const [durationMin, setDurationMin] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || isNaN(Number(durationMin)) || isNaN(Number(price))) {
      alert("Por favor, preencha todos os campos do serviço.");
      return;
    }

    await addService({
      name,
      category,
      durationMin: Number(durationMin),
      price: Number(price)
    });

    // Reset Form
    setName('');
    setCategory('Cabelo');
    setDurationMin('');
    setPrice('');
  };

  return (
    <div id="servicos-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 selection:bg-brand-moss/10">

      {/* LEFT: Services grid listing */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Dynamic categorization rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((catName) => {
            const listForCat = services.filter(s => s.category === catName);
            
            return (
              <div 
                key={catName}
                className="bg-white border border-brand-beige p-5 rounded-2xl shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-brand-beige pb-3">
                  <span className="font-serif font-bold text-base text-brand-clay flex items-center gap-1.5">
                    <Tag className="w-4.5 h-4.5 text-brand-moss" />
                    {catName}
                  </span>
                  <span className="font-mono text-xs bg-brand-moss/10 text-brand-moss-light px-2.5 py-0.5 rounded-full font-bold">
                    {listForCat.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {listForCat.length === 0 ? (
                    <p className="text-xs text-brand-clay-light italic text-center py-6">Nenhum serviço cadastrada nesta categoria.</p>
                  ) : (
                    listForCat.map((serv) => (
                      <div 
                        key={serv.id}
                        className="p-3 bg-brand-offwhite rounded-xl border border-brand-beige-dark/30 hover:border-brand-beige-dark flex items-center justify-between gap-2 group transition-all"
                      >
                        <div className="min-w-0">
                          <h5 className="font-sans font-semibold text-xs text-brand-clay truncate leading-tight">{serv.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[10px] text-brand-clay-light flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" />
                              {serv.durationMin}m
                            </span>
                            <span className="w-1 h-1 bg-brand-beige-dark rounded-full shrink-0"></span>
                            <span className="font-mono text-[10px] text-brand-moss font-bold shrink-0">
                              R$ {serv.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Trash */}
                        {deleteConfirmId === serv.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 shrink-0">
                            <button
                              onClick={() => {
                                deleteService(serv.id);
                                setDeleteConfirmId(null);
                              }}
                              className="p-1 px-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-sans font-bold cursor-pointer transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 px-1.5 bg-brand-beige hover:bg-brand-beige-dark/50 text-brand-clay rounded text-[9px] font-sans transition-colors cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(serv.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                            title="Excluir procedimento do catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Novo procedimento Form */}
      <div className="xl:col-span-4">
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-brand-clay font-medium">Novo Procedimento</h3>
            <p className="text-xs text-brand-clay-light">Adicione novos serviços ao catálogo para habilitar agendamentos e controle integrado de fluxo de caixa.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Nome do Procedimento</label>
              <input
                type="text"
                required
                placeholder="Ex. Escova Modeladora Especial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Categoria do Serviço</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Preço de Tabela</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-brand-clay-light" />
                  <input
                    type="number"
                    required
                    placeholder="Valor Cobrado"
                    value={price}
                    onChange={(e) => setPrice(e.target.value !== '' ? parseFloat(e.target.value) : '')}
                    className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-brand-clay focus:outline-none focus:border-brand-moss"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Duração Estimada (minutos)</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3 w-4 h-4 text-brand-clay-light" />
                <input
                  type="number"
                  required
                  placeholder="Minutos ex: 60"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value !== '' ? parseInt(e.target.value) : '')}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-mono text-brand-clay focus:outline-none focus:border-brand-moss"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-brand-moss hover:bg-brand-moss-hover border border-brand-moss-dark/20 text-brand-offwhite font-sans py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer mt-4 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              Adicionar Serviço
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
