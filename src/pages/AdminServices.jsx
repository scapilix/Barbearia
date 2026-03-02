import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Scissors, Plus, X, Edit, Trash2, Clock, DollarSign, Search } from 'lucide-react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', duration: 30, price: 0, description: '' });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('category').order('name');
    setServices(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (selected) { await supabase.from('services').update(formData).eq('id', selected.id); }
    else { await supabase.from('services').insert([formData]); }
    setIsModalOpen(false); setSelected(null); fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Apagar este serviço?')) return;
    await supabase.from('services').delete().eq('id', id);
    fetchData();
  };

  const openNew = () => { setSelected(null); setFormData({ name: '', category: '', duration: 30, price: 0, description: '' }); setIsModalOpen(true); };
  const openEdit = (s) => { setSelected(s); setFormData({ name: s.name||'', category: s.category||'', duration: s.duration||30, price: s.price||0, description: s.description||'' }); setIsModalOpen(true); };

  const filtered = services.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Serviços</h1>
          <p className="text-muted text-sm mt-1">Gerir serviços oferecidos pelo salão</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Serviço</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Total Serviços</p><p className="text-2xl font-bold text-dark mt-1">{services.length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Categorias</p><p className="text-2xl font-bold text-dark mt-1">{categories.length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Preço Médio</p><p className="text-2xl font-bold text-dark mt-1">{services.length ? (services.reduce((a,s) => a + Number(s.price||0), 0) / services.length).toFixed(2) : '0.00'}€</p></div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" />
        <input type="text" placeholder="Pesquisar serviços..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="card p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><Scissors size={18} /></div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={14} /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-semibold text-dark text-sm">{s.name}</h3>
            {s.category && <span className="badge badge-info mt-1 inline-block">{s.category}</span>}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-main">
              <div className="flex items-center gap-1 text-xs text-muted"><Clock size={12} />{s.duration}min</div>
              <div className="flex items-center gap-1 text-sm font-bold text-primary"><DollarSign size={12} />{Number(s.price||0).toFixed(2)}€</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum serviço encontrado'}</div>}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main">
                  <h2 className="text-lg font-bold text-dark">{selected ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Categoria</label><input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="luxury-input" placeholder="Ex: Cabelo, Barba..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Duração (min)</label><input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Preço (€)</label><input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Descrição</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="luxury-input h-20 resize-none" /></div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">Guardar</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminServices;
