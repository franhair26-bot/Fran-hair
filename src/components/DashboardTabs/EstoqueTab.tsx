import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Package, RefreshCw, Plus, Trash2, ArrowUpRight, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export const EstoqueTab: React.FC = () => {
  const { products, addProduct, restockProduct, deleteProduct } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Shampoo');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minQuantity, setMinQuantity] = useState<number | ''>('');
  const [priceCost, setPriceCost] = useState<number | ''>('');
  const [priceSell, setPriceSell] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !brand || isNaN(Number(quantity)) || isNaN(Number(minQuantity)) || isNaN(Number(priceCost)) || isNaN(Number(priceSell))) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    await addProduct({
      name,
      brand,
      category,
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      priceCost: Number(priceCost),
      priceSell: Number(priceSell)
    });

    // Reset Form
    setName('');
    setBrand('');
    setQuantity('');
    setMinQuantity('');
    setPriceCost('');
    setPriceSell('');
  };

  return (
    <div id="estoque-tab" className="grid grid-cols-1 xl:grid-cols-12 gap-8 selection:bg-brand-moss/10">

      {/* LEFT: Complete supplies stock sheet list */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Warning panel if products are critical */}
        {products.filter(p => p.quantity <= p.minQuantity).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif text-sm font-semibold text-amber-900">Itens Críticos Detectados</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Você tem consumíveis de cosmética que alcançaram ou ultrapassaram o estoque de segurança mínimo. Use o botão de <strong>Reposição Rápida</strong> para reabastecer +5 unidades instantaneamente com cálculo e registro automático do caixa operacional.
              </p>
            </div>
          </div>
        )}

        {/* Inventory list layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="sm:col-span-2 bg-white/40 border border-dashed border-brand-beige-dark/50 rounded-2xl p-12 text-center text-brand-clay-light space-y-3">
              <Package className="w-12 h-12 mx-auto stroke-1" />
              <p className="font-serif text-lg">Prateleiras vazias por aqui.</p>
              <p className="text-xs max-w-sm mx-auto">Insira novos suprimentos ou linhas de revenda no cadastro lateral para ter o controle do inventário de cremes, shampoos e esmaltes.</p>
            </div>
          ) : (
            products.map((p) => {
              const isCritical = p.quantity <= p.minQuantity;
              
              return (
                <div 
                  key={p.id}
                  className={`bg-white border p-5 rounded-2xl shadow-sm space-y-4 hover:shadow transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                    isCritical ? 'border-amber-300 ring-2 ring-amber-50' : 'border-brand-beige'
                  }`}
                >
                  {/* Ping Orange Alert top right */}
                  {isCritical && (
                    <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                  )}

                  <div className="space-y-2">
                    <div className="min-w-0">
                      <span className="font-mono text-[9px] bg-brand-beige text-brand-clay-light py-0.5 px-2 rounded-full border border-brand-beige-dark/40 uppercase tracking-wider font-bold">
                        {p.category}
                      </span>
                      <h4 className="font-serif text-base text-brand-clay font-semibold mt-1.5 leading-tight truncate">{p.name}</h4>
                      <p className="text-[10px] text-brand-clay-light font-sans truncate">Família: {p.brand}</p>
                    </div>

                    {/* Stock status indicator */}
                    <div className="flex items-center justify-between p-2.5 bg-brand-offwhite rounded-xl border border-brand-beige-dark/30 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-brand-clay-light block uppercase">Estoque</span>
                        <strong className={`text-sm ${isCritical ? 'text-amber-700' : 'text-brand-clay'}`}>{p.quantity} unid.</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-brand-clay-light block uppercase">Gatilho Mín.</span>
                        <span className="font-semibold text-brand-clay">{p.minQuantity} unid.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-1">
                      <div>
                        <span className="text-brand-clay-light block">Custo de compra:</span>
                        <span className="text-brand-clay">R$ {p.priceCost.toFixed(2)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-brand-clay-light block">Preço de Revenda:</span>
                        <span className="text-brand-moss font-semibold">R$ {p.priceSell.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-brand-beige/50 flex items-center justify-between gap-2 shrink-0">
                    
                    {/* Quick restock button */}
                    <button
                      onClick={() => restockProduct(p.id, 5)}
                      className="px-3 py-1.5 bg-brand-moss hover:bg-brand-moss-hover text-white text-[11px] rounded-lg transition-colors cursor-pointer font-sans font-medium hover:shadow-xs flex items-center gap-1.5"
                      title="Adicionar +5 unidades e registrar despesa no fluxo de caixa automaticamente"
                    >
                      <RefreshCw className="w-3 h-3 text-white shrink-0" />
                      Repor +5
                    </button>

                    {/* Trash Delete */}
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <button
                          onClick={() => {
                            deleteProduct(p.id);
                            setDeleteConfirmId(null);
                          }}
                          className="p-1 px-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-sans font-bold cursor-pointer transition-colors"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 px-1.5 bg-brand-beige hover:bg-brand-beige-dark/50 text-brand-clay rounded text-[10px] font-sans transition-colors cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-1 px-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors text-xs inline-flex items-center gap-1"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Adicionar Consumível Form */}
      <div className="xl:col-span-4">
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-brand-clay font-medium">Cadastrar Suprimento</h3>
            <p className="text-xs text-brand-clay-light">Registre marcas, lotes e determine limites de alertas automotivos de falta de estoque.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Nome do Produto</label>
              <input
                type="text"
                required
                placeholder="Ex. Água de Sálvia Condicionadora"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Marca / Família</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. BioFlora"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2 text-sm font-sans text-brand-clay focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Categoria do Lote</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2.5 text-sm font-sans text-brand-clay focus:outline-none focus:border-brand-moss cursor-pointer"
                >
                  <option value="Shampoo">Shampoo</option>
                  <option value="Máscara">Máscara Capilar</option>
                  <option value="Finalizadores">Finalizadores</option>
                  <option value="Unhas">Cosméticos de Unhas</option>
                  <option value="Estética">Cremes Corporais</option>
                  <option value="Tônico">Tônicos / Óleos</option>
                  <option value="Acessórios">Acessórios / Descartáveis</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Estoque Inicial</label>
                <input
                  type="number"
                  required
                  placeholder="unid"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value !== '' ? parseInt(e.target.value) : '')}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-mono text-brand-clay focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Minimo Tolerável</label>
                <input
                  type="number"
                  required
                  placeholder="Se atingir, alerta"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value !== '' ? parseInt(e.target.value) : '')}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-mono text-brand-clay focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Custo Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Preço de Custo"
                  value={priceCost}
                  onChange={(e) => setPriceCost(e.target.value !== '' ? parseFloat(e.target.value) : '')}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-mono text-brand-clay focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Preço de Revenda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Preço Comercial"
                  value={priceSell}
                  onChange={(e) => setPriceSell(e.target.value !== '' ? parseFloat(e.target.value) : '')}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-sm font-mono text-brand-clay focus:outline-none"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-brand-moss hover:bg-brand-moss-hover border border-brand-moss-dark/20 text-brand-offwhite font-sans py-3 px-4 rounded-xl font-medium transition-colors cursor-pointer mt-4 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 text-white" />
              Adicionar Consumível
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
