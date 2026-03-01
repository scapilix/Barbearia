import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Plus, X, Edit, Trash2, Search, AlertTriangle, Package, TrendingUp, TrendingDown, Image as ImageIcon, Upload } from 'lucide-react';

const AdminStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', brand: '', price: 0, cost_price: 0, stock_quantity: 0, min_stock: 5, image_url: '' });

  const fetchData = async () => { setLoading(true); const { data } = await supabase.from('products').select('*').order('name'); setProducts(data || []); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData(prev => ({ ...prev, image_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (selected) { await supabase.from('products').update(formData).eq('id', selected.id); }
    else { await supabase.from('products').insert([formData]); }
    setIsModalOpen(false); setSelected(null); fetchData();
  };

  const handleDelete = async (id) => { if (!confirm('Apagar?')) return; await supabase.from('products').delete().eq('id', id); fetchData(); };
  const openNew = () => { setSelected(null); setFormData({ name: '', category: '', brand: '', price: 0, cost_price: 0, stock_quantity: 0, min_stock: 5, image_url: '' }); setIsModalOpen(true); };
  const openEdit = (p) => { setSelected(p); setFormData({ name: p.name||'', category: p.category||'', brand: p.brand||'', price: p.price||0, cost_price: p.cost_price||0, stock_quantity: p.stock_quantity||0, min_stock: p.min_stock||5, image_url: p.image_url||'' }); setIsModalOpen(true); };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock || 5));
  const totalValue = products.reduce((a, p) => a + (Number(p.price||0) * Number(p.stock_quantity||0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Produtos</h1><p className="text-muted text-sm mt-1">Inventário do salão</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Produto</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Total Produtos</p><p className="text-2xl font-bold text-dark mt-1">{products.length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Stock Baixo</p><p className="text-2xl font-bold text-red-600 mt-1">{lowStock.length}</p></div>
        <div className="stat-card"><p className="text-xs font-medium text-muted uppercase">Valor em Stock</p><p className="text-2xl font-bold text-dark mt-1">{totalValue.toFixed(2)}€</p></div>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" />
        <input type="text" placeholder="Pesquisar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main">
            <th className="table-header text-left px-6 py-3">Produto</th>
            <th className="table-header text-left px-6 py-3">Categoria</th>
            <th className="table-header text-left px-6 py-3">Preço</th>
            <th className="table-header text-left px-6 py-3">Stock</th>
            <th className="table-header text-right px-6 py-3">Ações</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="table-row">
                <td className="px-6 py-4"><div className="flex items-center gap-3">{p.image_url ? <img src={p.image_url} alt={p.name} className="w-9 h-9 rounded-lg object-cover" /> : <div className="p-2 rounded-lg bg-primary/10 text-primary"><Package size={16} /></div>}<div><div className="text-sm font-semibold text-dark">{p.name}</div>{p.brand && <div className="text-xs text-muted">{p.brand}</div>}</div></div></td>
                <td className="px-6 py-4">{p.category && <span className="badge badge-info">{p.category}</span>}</td>
                <td className="px-6 py-4 text-sm font-semibold text-dark">{Number(p.price||0).toFixed(2)}€</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${(p.stock_quantity||0) <= (p.min_stock||5) ? 'text-red-600' : 'text-dark'}`}>{p.stock_quantity || 0}</span>
                    {(p.stock_quantity||0) <= (p.min_stock||5) && <AlertTriangle size={14} className="text-red-500" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="px-6 py-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum produto'}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Rankings */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 Best Sellers */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp size={18} /></div>
            <h3 className="font-semibold text-dark">Top 5 — Mais Vendidos</h3>
          </div>
          <div className="space-y-3">
            {[...products].sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg min-w-[28px]">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                  <div>
                    <div className="text-sm font-semibold text-dark">{p.name}</div>
                    <div className="text-xs text-muted">{p.brand || p.category || '—'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600">{p.total_sold || 0} un.</div>
                  <div className="text-[10px] font-semibold text-muted">{(Number(p.total_sold||0) * Number(p.price||0)).toFixed(2)}€</div>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
          </div>
        </div>

        {/* Top 5 Worst Sellers */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-red-50 text-red-600"><TrendingDown size={18} /></div>
            <h3 className="font-semibold text-dark">Top 5 — Menos Vendidos</h3>
          </div>
          <div className="space-y-3">
            {[...products].sort((a, b) => (a.total_sold || 0) - (b.total_sold || 0)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border-main last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-lg min-w-[28px]">{i + 1}.</span>
                  <div>
                    <div className="text-sm font-semibold text-dark">{p.name}</div>
                    <div className="text-xs text-muted">{p.brand || p.category || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-red-600">{p.total_sold || 0} un.</div>
                  {(p.stock_quantity || 0) <= (p.min_stock || 5) && <AlertTriangle size={14} className="text-amber-500" />}
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-muted text-center py-4">Sem dados</p>}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Novo'} Produto</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-border-main flex items-center justify-center">
                      {formData.image_url ? <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={24} />}
                      <label className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <Upload size={16} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="flex-1"><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input w-full" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Categoria</label><input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Marca</label><input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Preço Venda (€)</label><input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Preço Custo (€)</label><input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Quantidade</label><input type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Stock Mínimo</label><input type="number" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: Number(e.target.value)})} className="luxury-input" /></div>
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

export default AdminStore;
