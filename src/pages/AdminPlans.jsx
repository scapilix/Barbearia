import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Package, Plus, X, Edit, Trash2, Search, Star, Clock } from 'lucide-react';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, sessions: 1, validity_days: 30, services_included: '' });

  const fetchData = async () => { setLoading(true); const { data } = await supabase.from('plans').select('*').order('name'); setPlans(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (selected) { await supabase.from('plans').update(formData).eq('id', selected.id); }
    else { await supabase.from('plans').insert([formData]); }
    setIsModalOpen(false); setSelected(null); fetchData();
  };

  const handleDelete = async (id) => { if (!confirm('Apagar?')) return; await supabase.from('plans').delete().eq('id', id); fetchData(); };
  const openNew = () => { setSelected(null); setFormData({ name: '', description: '', price: 0, sessions: 1, validity_days: 30, services_included: '' }); setIsModalOpen(true); };
  const openEdit = (p) => { setSelected(p); setFormData({ name: p.name||'', description: p.description||'', price: p.price||0, sessions: p.sessions||1, validity_days: p.validity_days||30, services_included: p.services_included||'' }); setIsModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Pacotes</h1><p className="text-muted text-sm mt-1">Pacotes de serviços predefinidos</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Pacote</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p.id} className="card p-6 hover:shadow-md transition-all relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Package size={20} /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-dark mb-1">{p.name}</h3>
            {p.description && <p className="text-sm text-muted mb-4">{p.description}</p>}
            <div className="text-3xl font-bold text-primary mb-4">{Number(p.price||0).toFixed(2)}€</div>
            <div className="space-y-2 border-t border-border-main pt-4">
              <div className="flex items-center gap-2 text-sm text-muted"><Star size={14} className="text-primary" />{p.sessions || 1} sessões</div>
              <div className="flex items-center gap-2 text-sm text-muted"><Clock size={14} className="text-primary" />Validade: {p.validity_days || 30} dias</div>
              {p.services_included && <div className="text-xs text-muted mt-2">Inclui: {p.services_included}</div>}
            </div>
          </div>
        ))}
        {plans.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum pacote criado'}</div>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Novo'} Pacote</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Descrição</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="luxury-input h-20 resize-none" /></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Preço (€)</label><input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Sessões</label><input type="number" value={formData.sessions} onChange={e => setFormData({...formData, sessions: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Validade (dias)</label><input type="number" value={formData.validity_days} onChange={e => setFormData({...formData, validity_days: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Serviços Incluídos</label><input value={formData.services_included} onChange={e => setFormData({...formData, services_included: e.target.value})} className="luxury-input" placeholder="Ex: Manicure, Pedicure..." /></div>
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

export default AdminPlans;
