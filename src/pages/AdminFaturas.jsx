import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Plus, X, Search, Trash2, ArrowDownRight, ArrowUpRight, Calendar, Paperclip, Download, Pencil } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminFaturas = () => {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('todas'); // 'todas', 'venda', 'compra'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'venda', description: '', entity_name: '', nif: '', amount: 0,
    date: new Date().toISOString().split('T')[0], status: 'pago',
    payment_method: 'dinheiro', notes: '', attachment_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('faturas').select('*').order('date', { ascending: false });
    setFaturas(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `fatura_${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from('expenses').upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage.from('expenses').getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, attachment_url: urlData.publicUrl }));
      } else {
        const reader = new FileReader();
        reader.onload = () => { setFormData(prev => ({ ...prev, attachment_url: reader.result })); };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => { setFormData(prev => ({ ...prev, attachment_url: reader.result })); };
      reader.readAsDataURL(e.target.files[0]);
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('faturas').update(formData).eq('id', editingId);
    } else {
      await supabase.from('faturas').insert([formData]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ type: 'venda', description: '', entity_name: '', nif: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'pago', payment_method: 'dinheiro', notes: '', attachment_url: '' });
    fetchData();
  };

  const handleEdit = (f) => {
    setFormData({
      type: f.type || 'venda',
      description: f.description || '',
      entity_name: f.entity_name || '',
      nif: f.nif || '',
      amount: f.amount || 0,
      date: f.date || new Date().toISOString().split('T')[0],
      status: f.status || 'pago',
      payment_method: f.payment_method || 'dinheiro',
      notes: f.notes || '',
      attachment_url: f.attachment_url || ''
    });
    setEditingId(f.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende apagar esta fatura?')) return;
    await supabase.from('faturas').delete().eq('id', id);
    fetchData();
  };

  const viewAttachment = (url) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const win = window.open();
        win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      alert('Não foi possível abrir o anexo.');
    }
  };

  const filteredFaturas = faturas.filter(f => {
    const matchType = filterType === 'todas' || f.type === filterType;
    const matchSearch = (f.description?.toLowerCase().includes(search.toLowerCase()) || f.entity_name?.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const totais = useMemo(() => {
    let vendas = 0, compras = 0;
    faturas.forEach(f => {
      if (f.type === 'venda') vendas += Number(f.amount || 0);
      else if (f.type === 'compra') compras += Number(f.amount || 0);
    });
    return { vendas, compras, saldo: vendas - compras };
  }, [faturas]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayFaturas = faturas.filter(f => f.date === date);
      const vendas = dayFaturas.filter(f => f.type === 'venda').reduce((sum, f) => sum + Number(f.amount || 0), 0);
      const compras = dayFaturas.filter(f => f.type === 'compra').reduce((sum, f) => sum + Number(f.amount || 0), 0);
      return { 
        name: new Date(date).toLocaleDateString('pt-PT', { weekday: 'short' }), 
        vendas, compras 
      };
    });
  }, [faturas]);

  return (
    <div className="space-y-6 animate-fade-in relative z-10 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">Faturas</h1>
          <p className="text-muted text-sm mt-1">Gestão de faturas de compra e venda</p>
        </div>
        <button onClick={() => { setEditingId(null); setFormData({ type: 'venda', description: '', entity_name: '', nif: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'pago', payment_method: 'dinheiro', notes: '', attachment_url: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"><Plus size={16} /> Nova Fatura</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><ArrowUpRight size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Total Vendas</p>
          <p className="text-2xl font-bold text-dark mt-1">{totais.vendas.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-red-50 text-red-600"><ArrowDownRight size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Total Compras</p>
          <p className="text-2xl font-bold text-dark mt-1">{totais.compras.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2"><div className="p-2 rounded-lg bg-primary/10 text-primary"><FileText size={18} /></div></div>
          <p className="text-xs font-medium text-muted uppercase">Nº Documentos</p>
          <p className="text-2xl font-bold text-dark mt-1">{faturas.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-dark mb-6">Evolução de 7 Dias</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dx={-10} tickFormatter={(val) => `€${val}`} />
              <Tooltip cursor={{ stroke: '#B48228', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" name="Vendas" dataKey="vendas" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" name="Compras" dataKey="compras" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 flex w-full items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg focus-within:ring-2 ring-primary/20 transition-all">
          <Search className="w-4 h-4 text-muted flex-shrink-0" />
          <input type="text" placeholder="Pesquisar por descrição ou entidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
        </div>
        <div className="flex bg-white rounded-lg border border-border-main p-1 w-full sm:w-auto">
          {['todas', 'venda', 'compra'].map(type => (
            <button key={type} onClick={() => setFilterType(type)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === type ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-dark hover:bg-slate-50'}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-border-main">
                <th className="table-header text-left px-6 py-4">Data</th>
                <th className="table-header text-left px-6 py-4">Tipo</th>
                <th className="table-header text-left px-6 py-4">Entidade</th>
                <th className="table-header text-left px-6 py-4">Descrição</th>
                <th className="table-header text-right px-6 py-4">Valor</th>
                <th className="table-header text-center px-6 py-4">Anexo</th>
                <th className="table-header text-right px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaturas.map(f => (
                <tr key={f.id} className="table-row group">
                  <td className="px-6 py-4 text-sm font-medium text-dark">{f.date ? new Date(f.date.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-PT') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${f.type === 'venda' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {f.type === 'venda' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {f.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-dark">{f.entity_name || '—'}</p>
                    {f.nif && <p className="text-xs text-muted">NIF: {f.nif}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted max-w-[200px] truncate">{f.description}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${f.type === 'venda' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {f.type === 'venda' ? '+' : '-'}{Number(f.amount || 0).toFixed(2)}€
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {f.attachment_url ? (
                      <button onClick={() => viewAttachment(f.attachment_url)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-block" title="Ver anexo">
                        <Paperclip size={16} />
                      </button>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(f)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Apagar"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredFaturas.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted">
                      <FileText className="w-12 h-12 mb-3 text-slate-300" />
                      <p>{loading ? 'A carregar faturas...' : 'Nenhuma fatura encontrada com estes filtros.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-content w-full max-w-lg mx-4">
              <div className="flex items-center justify-between p-6 border-b border-border-main">
                <h2 className="text-xl font-bold text-dark flex items-center gap-2"><FileText className="text-primary" />{editingId ? 'Editar Fatura' : 'Nova Fatura'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted hover:text-dark hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Tipo de Fatura</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="luxury-input w-full">
                      <option value="venda">Venda (Receita)</option>
                      <option value="compra">Compra (Despesa)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Data</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="luxury-input w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Descrição / Produto</label>
                  <input type="text" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Ex: Fatura de material, Consultoria..." className="luxury-input w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">{formData.type === 'venda' ? 'Cliente' : 'Fornecedor'}</label>
                    <input type="text" value={formData.entity_name} onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })} placeholder="Nome..." className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">NIF (Opcional)</label>
                    <input type="text" value={formData.nif} onChange={(e) => setFormData({ ...formData, nif: e.target.value })} placeholder="Ex: 512345678" className="luxury-input w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Valor Total (€)</label>
                    <input type="number" step="0.01" min="0" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="luxury-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Pagamento</label>
                    <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="luxury-input w-full">
                      <option value="dinheiro">Dinheiro</option>
                      <option value="mbway">MB Way</option>
                      <option value="transferencia">Transferência</option>
                      <option value="cartao">Cartão</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark uppercase tracking-wider mb-2">Anexar Documento (PDF/Imagem)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <div className={`px-4 py-3 border-2 border-dashed ${formData.attachment_url ? 'border-primary bg-primary/5 text-primary' : 'border-border-main hover:border-primary/50 text-muted'} rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 group`}>
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Paperclip size={18} className={formData.attachment_url ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
                            <span className="text-sm font-medium">{formData.attachment_url ? 'Documento Anexado (Clique para alterar)' : 'Selecione um ficheiro...'}</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                    </label>
                    {formData.attachment_url && (
                      <button type="button" onClick={() => viewAttachment(formData.attachment_url)} className="p-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors" title="Visualizar Anexo">
                        <Download size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-border-main mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-sm font-bold text-dark hover:bg-slate-100 transition-colors">Cancelar</button>
                  <button type="submit" disabled={uploading} className="btn-primary px-8 py-2.5">Guardar Fatura</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFaturas;
