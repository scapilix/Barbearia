import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Stethoscope, Plus, X, Search, Eye, Edit, User } from 'lucide-react';

const AdminAnamnesis = () => {
  const [records, setRecords] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ client_id: '', client_name: '', allergies: '', medications: '', health_conditions: '', skin_type: '', Barber_conditions: '', preferences: '', notes: '' });

  const fetchData = async () => { setLoading(true); try { const [r, c] = await Promise.all([supabase.from('anamnesis').select('*').order('created_at', { ascending: false }), supabase.from('clients').select('id, name')]); setRecords(r.data || []); setClients(c.data || []); } catch(e){} setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => { e.preventDefault(); const client = clients.find(c => c.id === formData.client_id); const payload = {...formData, client_name: client?.name || formData.client_name}; if(selected) { await supabase.from('anamnesis').update(payload).eq('id', selected.id); } else { await supabase.from('anamnesis').insert([payload]); } setIsModalOpen(false); setSelected(null); fetchData(); };
  const openNew = () => { setSelected(null); setFormData({ client_id: '', client_name: '', allergies: '', medications: '', health_conditions: '', skin_type: '', Barber_conditions: '', preferences: '', notes: '' }); setIsModalOpen(true); };
  const openEdit = (r) => { setSelected(r); setFormData({ client_id: r.client_id||'', client_name: r.client_name||'', allergies: r.allergies||'', medications: r.medications||'', health_conditions: r.health_conditions||'', skin_type: r.skin_type||'', Barber_conditions: r.Barber_conditions||'', preferences: r.preferences||'', notes: r.notes||'' }); setIsModalOpen(true); };
  const openView = (r) => { setSelected(r); setIsViewOpen(true); };

  const filtered = records.filter(r => r.client_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Anamneses</h1><p className="text-muted text-sm mt-1">Fichas clínicas dos clientes</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Ficha</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg"><Search className="w-4 h-4 text-muted" /><input type="text" placeholder="Pesquisar por cliente..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" /></div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main"><th className="table-header text-left px-6 py-3">Cliente</th><th className="table-header text-left px-6 py-3">Alergias</th><th className="table-header text-left px-6 py-3">Tipo de Pele</th><th className="table-header text-left px-6 py-3">Data</th><th className="table-header text-right px-6 py-3">Ações</th></tr></thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="table-row">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{r.client_name?.charAt(0) || '?'}</div><span className="text-sm font-semibold text-dark">{r.client_name || '—'}</span></div></td>
                <td className="px-6 py-4 text-sm text-muted">{r.allergies || 'Nenhuma'}</td>
                <td className="px-6 py-4">{r.skin_type && <span className="badge badge-info">{r.skin_type}</span>}</td>
                <td className="px-6 py-4 text-sm text-muted">{new Date(r.created_at).toLocaleDateString('pt-PT')}</td>
                <td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => openView(r)} className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-primary"><Eye size={16} /></button><button onClick={() => openEdit(r)} className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={16} /></button></div></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma ficha'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {isViewOpen && selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsViewOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">Ficha — {selected.client_name}</h2><button onClick={() => setIsViewOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
              <div className="p-6 grid grid-cols-2 gap-6">
                {[['Alergias',selected.allergies],['Medicamentos',selected.medications],['Condições de Saúde',selected.health_conditions],['Tipo de Pele',selected.skin_type],['Condições Barba',selected.Barber_conditions],['Preferências',selected.preferences]].map(([l,v]) => (
                  <div key={l}><label className="text-xs font-medium text-muted uppercase">{l}</label><p className="text-sm font-medium text-dark mt-1">{v || '—'}</p></div>
                ))}
                <div className="col-span-2"><label className="text-xs font-medium text-muted uppercase">Observações</label><p className="text-sm font-medium text-dark mt-1">{selected.notes || '—'}</p></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Nova'} Ficha</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Cliente *</label><select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="luxury-input"><option value="">Selecionar...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Alergias</label><input value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Medicamentos</label><input value={formData.medications} onChange={e => setFormData({...formData, medications: e.target.value})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Condições de Saúde</label><input value={formData.health_conditions} onChange={e => setFormData({...formData, health_conditions: e.target.value})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Tipo de Pele</label><select value={formData.skin_type} onChange={e => setFormData({...formData, skin_type: e.target.value})} className="luxury-input"><option value="">Selecionar</option><option value="Normal">Normal</option><option value="Seca">Seca</option><option value="Oleosa">Oleosa</option><option value="Mista">Mista</option><option value="Sensível">Sensível</option></select></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Condições das Barba</label><input value={formData.Barber_conditions} onChange={e => setFormData({...formData, Barber_conditions: e.target.value})} className="luxury-input" placeholder="Ex: Barba fracas, micose, etc." /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Preferências</label><input value={formData.preferences} onChange={e => setFormData({...formData, preferences: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Notas</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-20 resize-none" /></div>
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
export default AdminAnamnesis;
