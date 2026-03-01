import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Target, Plus, X, TrendingUp, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';

const AdminGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ title: '', target_value: 0, current_value: 0, period: 'mensal', status: 'ativa' });

  const fetchData = async () => { setLoading(true); try { const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false }); setGoals(data || []); } catch(e){} setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { e.preventDefault(); if(selected) { await supabase.from('goals').update(formData).eq('id', selected.id); } else { await supabase.from('goals').insert([formData]); } setIsModalOpen(false); setSelected(null); fetchData(); };
  const handleDelete = async (id) => { if(!confirm('Apagar?')) return; await supabase.from('goals').delete().eq('id', id); fetchData(); };
  const openNew = () => { setSelected(null); setFormData({ title: '', target_value: 0, current_value: 0, period: 'mensal', status: 'ativa' }); setIsModalOpen(true); };
  const openEdit = (g) => { setSelected(g); setFormData({ title: g.title, target_value: g.target_value, current_value: g.current_value, period: g.period, status: g.status }); setIsModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Metas</h1><p className="text-muted text-sm mt-1">Siga o progresso do seu salão</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Meta</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(g => {
          const progress = g.target_value > 0 ? Math.min((Number(g.current_value) / Number(g.target_value)) * 100, 100) : 0;
          return (
            <div key={g.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${g.status === 'ativa' ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'}`}>{g.status === 'ativa' ? <Target size={18} /> : <CheckCircle size={18} />}</div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-dark mb-1">{g.title}</h3>
              <span className="badge badge-info mb-3 inline-block">{g.period}</span>
              <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="font-medium text-dark">{Number(g.current_value).toFixed(0)}€</span><span className="text-muted">{Number(g.target_value).toFixed(0)}€</span></div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} /></div>
              </div>
              <p className="text-xs text-muted mt-2">{progress.toFixed(0)}% concluído</p>
            </div>
          );
        })}
        {goals.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma meta criada'}</div>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Nova'} Meta</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Título *</label><input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="luxury-input" placeholder="Ex: Faturação Mensal" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Meta (€)</label><input type="number" value={formData.target_value} onChange={e => setFormData({...formData, target_value: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Atual (€)</label><input type="number" value={formData.current_value} onChange={e => setFormData({...formData, current_value: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Período</label><select value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="luxury-input"><option value="semanal">Semanal</option><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option></select></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Estado</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="luxury-input"><option value="ativa">Ativa</option><option value="concluida">Concluída</option></select></div>
                  </div>
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
export default AdminGoals;
