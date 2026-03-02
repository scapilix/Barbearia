import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Plus, X, Search, DollarSign, User, CheckCircle, Clock, CreditCard } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ client_name: '', team_member_id: '', total_amount: 0, status: 'aberta', payment_method: 'dinheiro', notes: '' });
  const [team, setTeam] = useState([]);

  const fetchData = async () => { 
    setLoading(true); 
    try { 
      const [o, t] = await Promise.all([
        supabase.from('orders').select('*, team_members(name, commission_rate)').order('created_at', { ascending: false }),
        supabase.from('team_members').select('id, name, commission_rate')
      ]);
      setOrders(o.data || []); 
      setTeam(t.data || []);
    } catch(e){} 
    setLoading(false); 
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { 
    e.preventDefault(); 
    await supabase.from('orders').insert([formData]); 
    setIsModalOpen(false); 
    setFormData({ client_name: '', team_member_id: '', total_amount: 0, status: 'aberta', payment_method: 'dinheiro', notes: '' }); 
    fetchData(); 
  };

  const updateStatus = async (id, status) => { 
    // If we are closing the order, calculate and create commission
    if (status === 'fechada') {
      const order = orders.find(o => o.id === id);
      if (order && order.team_member_id) {
        // Find commission rate
        const member = team.find(t => t.id === order.team_member_id);
        const rate = member?.commission_rate || 0;
        const commissionAmount = Number(order.total_amount) * (rate / 100);
        const dateStr = new Date().toISOString().split('T')[0];

        // Ensure commission entry
        await supabase.from('commissions').insert([{
          team_member_id: order.team_member_id,
          member_name: member?.name,
          amount: commissionAmount,
          rate: rate,
          date: dateStr,
          status: 'pendente'
        }]);
      }
    }
    await supabase.from('orders').update({ status }).eq('id', id); 
    fetchData(); 
  };

  const filtered = orders.filter(o => o.client_name?.toLowerCase().includes(search.toLowerCase()));
  const statusLabels = { aberta: 'Aberta', fechada: 'Fechada', cancelada: 'Cancelada' };
  const statusColors = { aberta: 'badge-warning', fechada: 'badge-success', cancelada: 'badge-danger' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Comandas</h1><p className="text-muted text-sm mt-1">Vendas e serviços em aberto</p></div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Comanda</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Abertas</p><p className="text-2xl font-bold text-amber-600 mt-1">{orders.filter(o => o.status === 'aberta').length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Fechadas Hoje</p><p className="text-2xl font-bold text-emerald-600 mt-1">{orders.filter(o => o.status === 'fechada').length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Total Vendas</p><p className="text-2xl font-bold text-dark mt-1">{orders.filter(o => o.status === 'fechada').reduce((a,o) => a + Number(o.total_amount||0), 0).toFixed(2)}€</p></div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg"><Search className="w-4 h-4 text-muted" /><input type="text" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" /></div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(o => (
          <div key={o.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className={`badge ${statusColors[o.status]||'badge-info'}`}>{statusLabels[o.status]||o.status}</span>
              <span className="text-xs text-muted">{new Date(o.created_at).toLocaleTimeString('pt-PT', {hour:'2-digit',minute:'2-digit'})}</span>
            </div>
            <div className="flex items-center gap-2 mb-1"><User size={14} className="text-muted" /><span className="text-sm font-semibold text-dark">{o.client_name || 'Cliente'}</span></div>
            <div className="text-xs text-muted mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
              {o.team_members?.name ? `Atendido por: ${o.team_members.name}` : 'Sem profissional'}
            </div>
            <div className="text-2xl font-bold text-primary mb-3">{Number(o.total_amount||0).toFixed(2)}€</div>
            {o.notes && <p className="text-xs text-muted mb-3">{o.notes}</p>}
            <div className="flex gap-2">
              {o.status === 'aberta' && <><button onClick={() => updateStatus(o.id, 'fechada')} className="flex-1 btn-primary text-xs py-2">Fechar</button><button onClick={() => updateStatus(o.id, 'cancelada')} className="btn-secondary text-xs py-2">Cancelar</button></>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma comanda'}</div>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">Nova Comanda</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Cliente *</label><input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="luxury-input" /></div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Profissional (Barbeiro)</label>
                    <select value={formData.team_member_id} onChange={e => setFormData({...formData, team_member_id: e.target.value})} className="luxury-input">
                      <option value="">Selecionar barbeiro...</option>
                      {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Valor (€)</label><input type="number" step="0.01" value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Pagamento</label><select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="luxury-input"><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="mbway">MB Way</option></select></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Notas</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-20 resize-none" /></div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Criar</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AdminOrders;
