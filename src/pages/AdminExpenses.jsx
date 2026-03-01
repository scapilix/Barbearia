import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Plus, X, Search, Trash2, ArrowDownRight, Calendar, Tag, Paperclip, Download, FileText, Pencil } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    description: '', category: 'fornecedor', amount: 0,
    date: new Date().toISOString().split('T')[0], notes: '',
    paid_to: '', attachment_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    setExpenses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `expense_${Date.now()}.${ext}`;

      // Try Supabase Storage first
      const { error } = await supabase.storage
        .from('expenses')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage.from('expenses').getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, attachment_url: urlData.publicUrl }));
      } else {
        // Fallback: convert to data URL (works without storage bucket)
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, attachment_url: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Final fallback: data URL
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, attachment_url: reader.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId) {
      await supabase.from('expenses').update(formData).eq('id', editingId);
    } else {
      await supabase.from('expenses').insert([formData]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ description: '', category: 'fornecedor', amount: 0, date: new Date().toISOString().split('T')[0], notes: '', paid_to: '', attachment_url: '' });
    fetchData();
  };

  const handleEdit = (exp) => {
    setFormData({
      description: exp.description || '',
      category: exp.category || 'fornecedor',
      amount: exp.amount || 0,
      date: exp.date || new Date().toISOString().split('T')[0],
      notes: exp.notes || '',
      paid_to: exp.paid_to || '',
      attachment_url: exp.attachment_url || ''
    });
    setEditingId(exp.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende apagar esta despesa?')) return;
    await supabase.from('expenses').delete().eq('id', id);
    fetchData();
  };

  const viewAttachment = (url) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        window.open(url, '_blank');
      }
    } catch {
      alert("Não foi possível pré-visualizar o anexo.");
    }
  };

  const chartData = useMemo(() => {
    const grouped = [...expenses].reduce((acc, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + Number(curr.amount || 0);
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([date, value]) => ({ date: date.substring(5).replace('-', '/'), value }))
      .sort((a,b) => a.date.localeCompare(b.date));
  }, [expenses]);

  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const thisMonth = expenses.filter(e => { const d = new Date(e.date); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); });
  const monthExpenses = thisMonth.reduce((a, e) => a + Number(e.amount || 0), 0);
  const filtered = expenses.filter(e =>
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.paid_to?.toLowerCase().includes(search.toLowerCase())
  );

  const categoryLabels = { fornecedor: 'Fornecedor', renda: 'Renda', utility: 'Utilidades', salario: 'Salário', marketing: 'Marketing', outros: 'Outros' };
  const categoryColors = { fornecedor: 'badge-info', renda: 'badge-warning', utility: 'badge-success', salario: 'badge-danger', marketing: 'bg-purple-50 text-purple-700', outros: 'bg-slate-100 text-slate-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Despesas</h1><p className="text-muted text-sm mt-1">Controlo de gastos do salão</p></div>
        <button onClick={() => { setEditingId(null); setFormData({ description: '', category: 'fornecedor', amount: 0, date: new Date().toISOString().split('T')[0], notes: '', paid_to: '', attachment_url: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={16} /> Nova Despesa</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-red-50 text-red-600 w-fit mb-2"><ArrowDownRight size={18} /></div><p className="text-xs font-medium text-muted uppercase">Total Despesas</p><p className="text-2xl font-bold text-dark mt-1">{totalExpenses.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-amber-50 text-amber-600 w-fit mb-2"><Calendar size={18} /></div><p className="text-xs font-medium text-muted uppercase">Este Mês</p><p className="text-2xl font-bold text-dark mt-1">{monthExpenses.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2"><Tag size={18} /></div><p className="text-xs font-medium text-muted uppercase">Nº Despesas</p><p className="text-2xl font-bold text-dark mt-1">{expenses.length}</p></div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dark mb-6">Evolução de Gastos</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val}€`} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value}€`, 'Gasto']}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, fill: '#ef4444'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" /><input type="text" placeholder="Pesquisar despesas ou fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main">
            <th className="table-header text-left px-6 py-3">Data</th>
            <th className="table-header text-left px-6 py-3">Descrição</th>
            <th className="table-header text-left px-6 py-3">Pago a</th>
            <th className="table-header text-left px-6 py-3">Categoria</th>
            <th className="table-header text-center px-6 py-3">Anexo</th>
            <th className="table-header text-right px-6 py-3">Valor</th>
            <th className="table-header text-right px-6 py-3">Ações</th>
          </tr></thead>
          <tbody>
            {filtered.map(exp => (
              <tr key={exp.id} className="table-row">
                <td className="px-6 py-4 text-sm text-dark">{exp.date}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-dark">{exp.description}</div>
                  {exp.notes && <div className="text-xs text-muted">{exp.notes}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-dark">{exp.paid_to || '—'}</td>
                <td className="px-6 py-4"><span className={`badge ${categoryColors[exp.category] || 'bg-slate-100 text-slate-700'}`}>{categoryLabels[exp.category] || exp.category}</span></td>
                <td className="px-6 py-4 text-center">
                  {exp.attachment_url ? (
                    <button type="button" onClick={() => viewAttachment(exp.attachment_url)}
                       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold cursor-pointer">
                      <Download size={14} /> Ver
                    </button>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-red-600">-{Number(exp.amount || 0).toFixed(2)}€</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(exp)} className="p-2 rounded-lg hover:bg-blue-50 text-muted hover:text-blue-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(exp.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhuma despesa'}</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h2><button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Descrição *</label><input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Pago a</label><input value={formData.paid_to} onChange={e => setFormData({...formData, paid_to: e.target.value})} placeholder="Nome do fornecedor ou pessoa" className="luxury-input" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Categoria</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="luxury-input">
                        <option value="fornecedor">Fornecedor</option><option value="renda">Renda</option><option value="utility">Utilidades</option><option value="salario">Salário</option><option value="marketing">Marketing</option><option value="outros">Outros</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Valor (€) *</label><input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Data</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Notas</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-20 resize-none" /></div>

                  {/* File Attachment */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Anexo (PDF, Imagem)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border-main hover:border-primary hover:bg-primary/5 cursor-pointer transition-all text-sm text-muted">
                        <Paperclip size={16} />
                        <span>{uploading ? 'A carregar...' : formData.attachment_url ? 'Ficheiro anexado ✓' : 'Escolher ficheiro'}</span>
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                      </label>
                      {formData.attachment_url && (
                        <div className="flex items-center gap-3">
                          <a href={formData.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                            <FileText size={14} /> Pré-visualizar
                          </a>
                          <button type="button" onClick={() => setFormData({ ...formData, attachment_url: '' })} className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline">
                            <X size={14} /> Remover
                          </button>
                        </div>
                      )}
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

export default AdminExpenses;
