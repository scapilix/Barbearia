import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Users, Search, Plus, X, Phone, Mail, Calendar, 
  ChevronRight, Filter, MoreVertical, Edit, Trash2, Eye,
  DollarSign, TrendingUp
} from 'lucide-react';

const AdminClientes = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', birthday: '', notes: '',
    address: '', referral_source: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    const { data } = await supabase.from('clients').select('*').order('name');
    setClients(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await supabase.from('clients').update(formData).eq('id', selectedClient.id);
      } else {
        await supabase.from('clients').insert([formData]);
      }
      setIsModalOpen(false);
      setSelectedClient(null);
      setFormData({ name: '', email: '', phone: '', birthday: '', notes: '', address: '', referral_source: '' });
      fetchClients();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja apagar este cliente?')) return;
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  };

  const openNew = () => {
    setSelectedClient(null);
    setFormData({ name: '', email: '', phone: '', birthday: '', notes: '', address: '', referral_source: '' });
    setIsModalOpen(true);
  };

  const openEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '', email: client.email || '', phone: client.phone || '',
      birthday: client.birthday || '', notes: client.notes || '',
      address: client.address || '', referral_source: client.referral_source || ''
    });
    setIsModalOpen(true);
  };

  const openView = (client) => {
    setSelectedClient(client);
    setActiveTab('info');
    setIsViewOpen(true);
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const stats = [
    { label: 'Total Clientes', value: clients.length, color: 'bg-primary/10 text-primary' },
    { label: 'Novos Este Mês', value: clients.filter(c => { const d = new Date(c.created_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Com Aniversário Hoje', value: clients.filter(c => { if (!c.birthday) return false; const b = new Date(c.birthday); const n = new Date(); return b.getDate() === n.getDate() && b.getMonth() === n.getMonth(); }).length, color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Clientes</h1>
          <p className="text-muted text-sm mt-1">Gestão completa da sua base de clientes</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-dark mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
          <Search className="w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter size={14} /> Filtrar
        </button>
      </div>

      {/* Client Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-border-main">
              <th className="table-header text-left px-6 py-3">Nome</th>
              <th className="table-header text-left px-6 py-3">Contacto</th>
              <th className="table-header text-left px-6 py-3">Aniversário</th>
              <th className="table-header text-left px-6 py-3">Total Gasto</th>
              <th className="table-header text-left px-6 py-3">Visitas</th>
              <th className="table-header text-right px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="table-row">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {client.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-dark">{client.name}</div>
                      <div className="text-xs text-muted">{client.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark">{client.phone || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark">{client.birthday || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-dark">{Number(client.total_spent || 0).toFixed(2)}€</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark">{client.visit_count || 0}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openView(client)} className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-primary transition-colors" title="Ver">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => openEdit(client)} className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-blue-600 transition-colors" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition-colors" title="Apagar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-muted">
                  {loading ? 'A carregar...' : 'Nenhum cliente encontrado'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Client Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 by Spending */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={18} /></div>
            <h3 className="font-semibold text-dark">Top 5 — Maior Faturação</h3>
          </div>
          <div className="space-y-3">
            {[...clients].sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0)).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg min-w-[28px]">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <div>
                    <div className="text-sm font-semibold text-dark">{c.name}</div>
                    <div className="text-xs text-muted">{c.phone || c.email || '—'}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-emerald-600">{Number(c.total_spent || 0).toFixed(0)}€</div>
              </div>
            ))}
            {clients.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
          </div>
        </div>

        {/* Top 5 by Visits */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><TrendingUp size={18} /></div>
            <h3 className="font-semibold text-dark">Top 5 — Mais Agendamentos</h3>
          </div>
          <div className="space-y-3">
            {[...clients].sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0)).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg min-w-[28px]">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <div>
                    <div className="text-sm font-semibold text-dark">{c.name}</div>
                    <div className="text-xs text-muted">Última visita: {c.last_visit ? new Date(c.last_visit).toLocaleDateString('pt-PT') : '—'}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-primary">{c.visit_count || 0} visitas</div>
              </div>
            ))}
            {clients.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main">
                  <h2 className="text-lg font-bold text-dark">{selectedClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input" placeholder="Nome completo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="luxury-input" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Telefone</label>
                      <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="luxury-input" placeholder="+351 912 345 678" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Aniversário</label>
                      <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="luxury-input" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Indicação</label>
                      <input value={formData.referral_source} onChange={e => setFormData({...formData, referral_source: e.target.value})} className="luxury-input" placeholder="Como nos conheceu?" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Morada</label>
                    <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="luxury-input" placeholder="Morada completa" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Observações</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-20 resize-none" placeholder="Notas sobre o cliente..." />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" className="btn-primary">{selectedClient ? 'Guardar' : 'Criar Cliente'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {isViewOpen && selectedClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsViewOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-border-main">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                      {selectedClient.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-dark">{selectedClient.name}</h2>
                      <p className="text-sm text-muted">Cliente desde {new Date(selectedClient.created_at).getFullYear()}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-6">
                  {['info', 'historico', 'anamnese', 'financeiro'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-muted hover:bg-slate-100'}`}>
                      {tab === 'info' ? 'Informações' : tab === 'historico' ? 'Histórico' : tab === 'anamnese' ? 'Franciscomnese' : 'Financeiro'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 min-h-[300px]">
                {activeTab === 'info' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Email</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.email || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Telefone</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.phone || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Aniversário</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.birthday || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Indicação</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.referral_source || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Morada</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.address || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted uppercase tracking-wider">Observações</label>
                      <p className="text-sm font-medium text-dark mt-1">{selectedClient.notes || '—'}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'historico' && (
                  <div className="text-center py-12 text-muted">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Histórico de serviços</p>
                    <p className="text-sm mt-1">O histórico será carregado aqui</p>
                  </div>
                )}
                {activeTab === 'anamnese' && (
                  <div className="text-center py-12 text-muted">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Ficha de Franciscomnese</p>
                    <p className="text-sm mt-1">Dados clínicos e preferências do cliente</p>
                  </div>
                )}
                {activeTab === 'financeiro' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="stat-card">
                        <p className="text-xs font-medium text-muted uppercase">Total Gasto</p>
                        <p className="text-2xl font-bold text-dark mt-1">{Number(selectedClient.total_spent || 0).toFixed(2)}€</p>
                      </div>
                      <div className="stat-card">
                        <p className="text-xs font-medium text-muted uppercase">Nº Visitas</p>
                        <p className="text-2xl font-bold text-dark mt-1">{selectedClient.visit_count || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminClientes;
