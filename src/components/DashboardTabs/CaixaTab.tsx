import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeleteConfirmationModal } from '../DeleteConfirmationModal';
import { Transaction } from '../../types';
import { 
  Plus, DollarSign, ArrowUpRight, ArrowDownRight, Trash2, 
  Wallet, FileSpreadsheet, Calendar, CalendarRange, Landmark 
} from 'lucide-react';

export const CaixaTab: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useApp();

  // Form states
  const [description, setDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [type, setType] = useState<'receita' | 'despesa'>('receita');
  const [category, setCategory] = useState('Serviço');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // General flows summaries
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceitas - totalDespesas;

  // Category listing
  const categoriesList = ['Serviço', 'Venda', 'Estoque', 'Salários', 'Contas', 'Outros'];

  // Calculate volume per category for a handmade beautiful progress visualizer
  const getCategoryTotal = (catName: string) => {
    return transactions
      .filter(t => t.category === catName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    await addTransaction({
      type,
      description,
      amount: Number(amount),
      date,
      category
    });

    // Reset Form
    setDescription('');
    setAmount('');
  };

  return (
    <div id="caixa-tab" className="space-y-6 selection:bg-brand-moss/10">

      {/* Financial Upper Row Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total revenue */}
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-sans font-medium text-xs text-brand-clay-light uppercase tracking-wider block">Entradas (Receitas)</span>
          <span className="font-mono text-2xl font-bold text-green-700 block">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-brand-clay-light font-mono">Balanço total de serviços, comissões & vendas</p>
        </div>

        {/* Total expenses */}
        <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700">
            <ArrowDownRight className="w-5 h-5" />
          </div>
          <span className="font-sans font-medium text-xs text-brand-clay-light uppercase tracking-wider block">Saídas (Despesas)</span>
          <span className="font-mono text-2xl font-bold text-red-700 block">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-brand-clay-light font-mono">Reposição de estoque, salários & manutenção</p>
        </div>

        {/* Liquid total margin */}
        <div className="bg-brand-moss/10 border border-brand-moss/20 p-6 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-brand-moss/15 flex items-center justify-center text-brand-moss">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-sans font-medium text-xs text-brand-moss font-semibold uppercase tracking-wider block">Saldo Líquido</span>
          <span className={`font-mono text-2xl font-bold block ${netBalance >= 0 ? 'text-brand-moss' : 'text-red-700'}`}>
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-[10px] text-brand-moss font-mono">Lucro operacional disponível em tempo real</p>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT: Ledger table logs */}
        <div className="xl:col-span-8 bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-brand-beige pb-4">
            <div className="space-y-0.5">
              <h3 className="font-serif text-lg text-brand-clay font-medium">Histórico de Lançamentos</h3>
              <p className="text-xs text-brand-clay-light">Faturamento operacional de atendimentos e custos de manutenção.</p>
            </div>
            <FileSpreadsheet className="w-5 h-5 text-brand-moss shrink-0" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans border-collapse">
              <thead>
                <tr className="border-b border-brand-beige text-xs text-brand-clay-light font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-beige/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-brand-clay-light">
                      Nenhum lançamento registrado neste caixa local.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 100).map((tx) => (
                    <tr key={tx.id} className="hover:bg-brand-offwhite/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-brand-clay-light">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-sans font-medium text-brand-clay block leading-snug">{tx.description}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block py-0.5 px-2.5 rounded-md text-[10px] font-sans font-medium border ${
                          tx.type === 'receita' 
                            ? 'bg-green-50 text-green-800 border-green-200/50' 
                            : 'bg-red-50/50 text-red-800 border-red-200/50'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold ${tx.type === 'receita' ? 'text-green-700' : 'text-red-700'}`}>
                          {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirmId(tx.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Excluir movimentação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Adicionar movimentação manual Form & Progress categories */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Form manual */}
          <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-serif text-base text-brand-clay font-medium">Registrar Movimentação</h4>
            
            <form onSubmit={handleTxSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-brand-offwhite p-1 rounded-xl border border-brand-beige-dark/40">
                <button
                  type="button"
                  onClick={() => { setType('receita'); setCategory('Serviço'); }}
                  className={`py-1.5 px-3 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer ${
                    type === 'receita' ? 'bg-green-600 text-white shadow-sm' : 'text-brand-clay-light hover:text-brand-clay'
                  }`}
                >
                  Receita (+)
                </button>
                <button
                  type="button"
                  onClick={() => { setType('despesa'); setCategory('Contas'); }}
                  className={`py-1.5 px-3 text-xs font-sans font-medium rounded-lg transition-all cursor-pointer ${
                    type === 'despesa' ? 'bg-red-600 text-white shadow-sm' : 'text-brand-clay-light hover:text-brand-clay'
                  }`}
                >
                  Despesa (-)
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Café p/ Recepção, Reposição de tintura"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3.5 py-2.5 text-xs font-sans text-brand-clay focus:outline-none focus:border-brand-moss"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-sans text-brand-clay focus:outline-none focus:border-brand-moss cursor-pointer"
                  >
                    {type === 'receita' ? (
                      <>
                        <option value="Serviço">Serviço</option>
                        <option value="Venda">Venda</option>
                        <option value="Outros">Outras Receitas</option>
                      </>
                    ) : (
                      <>
                        <option value="Estoque">Estoque</option>
                        <option value="Salários">Salários</option>
                        <option value="Contas">Contas / Aluguel</option>
                        <option value="Outros">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value !== '' ? parseFloat(e.target.value) : '')}
                    className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-mono text-brand-clay focus:outline-none"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-sans font-semibold text-brand-clay uppercase tracking-wider block">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-offwhite border border-brand-beige-dark/50 rounded-xl px-3 py-2 text-xs font-mono text-brand-clay"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-moss hover:bg-brand-moss-hover border border-brand-moss-dark/20 text-brand-offwhite font-sans py-2.5 px-4 rounded-xl font-medium transition-colors cursor-pointer text-xs"
              >
                Lançar no Fluxo
              </button>
            </form>
          </div>

          {/* Categoric analysis bars */}
          <div className="bg-white border border-brand-beige p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-serif text-base text-brand-clay font-medium flex items-center gap-2">
              <Landmark className="w-5 h-5 text-brand-moss" />
              Análise por Categoria
            </h4>
            
            <div className="space-y-3.5 pr-1">
              {categoriesList.map(cat => {
                const total = getCategoryTotal(cat);
                const isExpense = cat === 'Estoque' || cat === 'Salários' || cat === 'Contas';

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sans font-medium text-brand-clay">{cat}</span>
                      <span className={`font-mono font-semibold ${isExpense ? 'text-red-700' : 'text-green-700'}`}>
                        R$ {total.toFixed(2)}
                      </span>
                    </div>
                    {/* Tiny visual progress bar */}
                    <div className="w-full bg-brand-offwhite rounded-full h-1.5 border border-brand-beige-dark/20">
                      <div 
                        className={`h-full rounded-full ${isExpense ? 'bg-red-400' : 'bg-brand-moss'}`}
                        style={{ width: `${Math.min(100, total > 0 ? (total / (netBalance || 1000)) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      <DeleteConfirmationModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteTransaction(deleteConfirmId);
          }
        }}
        title="Estornar Lançamento"
        message={`Deseja realmente apagar permanentemente esta movimentação de caixa ("${
          transactions.find(tx => tx.id === deleteConfirmId)?.description || 'esta movimentação'
        }")?`}
      />

    </div>
  );
};
