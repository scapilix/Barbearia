import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Plus, X, Search, Filter, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Pencil, Trash2 } from 'lucide-react';

const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ client_name: '', service_name: '', total_amount: 0, payment_method: 'dinheiro', status: 'pago', date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => { setLoading(true); const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false }); setInvoices(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { 
    e.preventDefault(); 
    if (editingId) {
      await supabase.from('invoices').update(formData).eq('id', editingId);
    } else {
      await supabase.from('invoices').insert([formData]); 
    }
    setIsModalOpen(false); 
    setEditingId(null);
    setFormData({ client_name: '', service_name: '', total_amount: 0, payment_method: 'dinheiro', status: 'pago', date: new Date().toISOString().split('T')[0] });
    fetchData(); 
  };

  const handleEdit = (inv) => {
    setFormData({
      client_name: inv.client_name || '',
      service_name: inv.service_name || '',
      total_amount: inv.total_amount || 0,
      payment_method: inv.payment_method || 'dinheiro',
      status: inv.status || 'pago',
      date: inv.date || (inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    });
    setEditingId(inv.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende apagar esta transação?')) return;
    await supabase.from('invoices').delete().eq('id', id);
    fetchData();
  };

  const totalRevenue = invoices.reduce((a, i) => a + Number(i.total_amount||0), 0);
  const thisMonth = invoices.filter(i => { const d = new Date(i.created_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
  const monthRevenue = thisMonth.reduce((a, i) => a + Number(i.total_amount||0), 0);

  const filtered = invoices.filter(i =>
    i.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  const methodLabel = { dinheiro: 'Dinheiro', cartao: 'Cartão', mbway: 'MB Way', transferencia: 'Transferência' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Transações</h1><p className="text-muted text-sm mt-1">Histórico financeiro</p></div>
        <button onClick={() => { setEditingId(null); setFormData({ client_name: '', service_name: '', total_amount: 0, payment_method: 'dinheiro', status: 'pago', date: new Date().toISOString().split('T')[0] }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Transação</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Receita Total</p>
          <p className="text-2xl font-bold text-dark mt-1">{totalRevenue.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Calendar size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Este Mês</p>
          <p className="text-2xl font-bold text-dark mt-1">{monthRevenue.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-primary/10 text-primary"><ArrowUpRight size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Nº Transações</p>
          <p className="text-2xl font-bold text-dark mt-1">{invoices.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
          <Search className="w-4 h-4 text-muted" />
          <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main">
            <th className="table-header text-left px-6 py-3">Data</th>
            <th className="table-header text-left px-6 py-3">Cliente</th>
            <th className="table-header text-left px-6 py-3">Serviço</th>
            <th className="table-header text-left px-6 py-3">Pagamento</th>
            <th className="table-header text-left px-6 py-3">Estado</th>
            <th className="table-header text-right px-6 py-3">Valor</th>
            <th className="table-header text-right px-6 py-3">Ações</th>
          </tr></thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="table-row">
                <td className="px-6 py-4 text-sm text-dark">{inv.date || new Date(inv.created_at).toLocaleDateString('pt-PT')}</td>
                <td className="px-6 py-4 text-sm font-medium text-dark">{inv.client_name || '—'}</td>
                <td className="px-6 py-4 text-sm text-muted">{inv.service_name || '—'}</td>
                <td className="px-6 py-4">{inv.payment_method && <span className="badge badge-info">{methodLabel[inv.payment_method] || inv.payment_method}</span>}</td>
                <td className="px-6 py-4"><span className={`badge ${inv.status === 'pago' ? 'badge-success' : inv.status === 'pendente' ? 'badge-warning' : 'badge-danger'}`}>{inv.status}</span></td>
                <td className="px-6 py-4 text-right text-sm font-bold text-dark">{Number(inv.total_amount||0).toFixed(2)}€</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(inv)} className="p-2 rounded-lg hover:bg-blue-50 text-muted hover:text-blue-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma transação'}</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{editingId ? 'Editar Transação' : 'Nova Transação'}</h2><button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Cliente</label><input value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Serviço</label><input value={formData.service_name} onChange={e => setFormData({...formData, service_name: e.target.value})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Valor (€) *</label><input required type="number" step="0.01" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Data</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Pagamento</label>
                      <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="luxury-input">
                        <option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="mbway">MB Way</option><option value="transferencia">Transferência</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Estado</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="luxury-input">
                        <option value="pago">Pago</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl"><button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInvoices;
