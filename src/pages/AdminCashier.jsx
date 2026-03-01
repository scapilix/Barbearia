import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Plus, X, ArrowUpRight, ArrowDownRight, DollarSign, Minus, CreditCard } from 'lucide-react';

const AdminCashier = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'entrada', amount: 0, description: '', payment_method: 'dinheiro', date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => { setLoading(true); try { const { data } = await supabase.from('cash_register').select('*').order('created_at', { ascending: false }); setEntries(data || []); } catch(e){} setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { e.preventDefault(); await supabase.from('cash_register').insert([formData]); setIsModalOpen(false); setFormData({ type: 'entrada', amount: 0, description: '', payment_method: 'dinheiro', date: new Date().toISOString().split('T')[0] }); fetchData(); };

  const totalIn = entries.filter(e => e.type === 'entrada').reduce((a,e) => a + Number(e.amount||0), 0);
  const totalOut = entries.filter(e => e.type === 'saida').reduce((a,e) => a + Number(e.amount||0), 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Caixa</h1><p className="text-muted text-sm mt-1">Controle de entradas e saídas</p></div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Registo</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><ArrowUpRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Entradas</p><p className="text-2xl font-bold text-emerald-600 mt-1">{totalIn.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-red-50 text-red-600 w-fit mb-2"><ArrowDownRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Saídas</p><p className="text-2xl font-bold text-red-600 mt-1">{totalOut.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><DollarSign size={18} /></div><p className="text-xs font-medium text-muted uppercase">Saldo</p><p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{balance.toFixed(2)}€</p></div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main"><th className="table-header text-left px-6 py-3">Data</th><th className="table-header text-left px-6 py-3">Tipo</th><th className="table-header text-left px-6 py-3">Descrição</th><th className="table-header text-left px-6 py-3">Pagamento</th><th className="table-header text-right px-6 py-3">Valor</th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="table-row">
                <td className="px-6 py-4 text-sm text-dark">{e.date}</td>
                <td className="px-6 py-4">{e.type === 'entrada' ? <span className="badge badge-success">Entrada</span> : <span className="badge badge-danger">Saída</span>}</td>
                <td className="px-6 py-4 text-sm text-dark">{e.description || '—'}</td>
                <td className="px-6 py-4 text-sm text-muted">{e.payment_method || '—'}</td>
                <td className={`px-6 py-4 text-right text-sm font-bold ${e.type === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>{e.type === 'entrada' ? '+' : '-'}{Number(e.amount||0).toFixed(2)}€</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum registo'}</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">Novo Registo</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Tipo</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="luxury-input"><option value="entrada">Entrada</option><option value="saida">Saída</option></select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Valor (€) *</label><input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Pagamento</label><select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="luxury-input"><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="mbway">MB Way</option></select></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Descrição</label><input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Data</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="luxury-input" /></div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminCashier;
