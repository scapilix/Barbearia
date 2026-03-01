import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Edit, Trash2, Search, Phone, Mail, Briefcase, Camera, Calendar, Clock, ArrowLeft, Euro, TrendingUp } from 'lucide-react';

const AdminTeam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', phone: '', email: '', commission_rate: 0, access_level: 'employee', pin_code: '', color: '#3B82F6' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Detail view
  const [detailMember, setDetailMember] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('team_members').select('*').order('name');
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (memberId) => {
    if (!photoFile) return null;
    setUploading(true);
    try {
      const ext = photoFile.name.split('.').pop();
      const fileName = `${memberId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(fileName, photoFile, { upsert: true, contentType: photoFile.type });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Fallback: convert to base64 data URL and store directly
        return photoPreview;
      }

      const { data: urlData } = supabase.storage.from('team-photos').getPublicUrl(fileName);
      return urlData?.publicUrl || photoPreview;
    } catch (err) {
      console.error('Upload failed, using data URL:', err);
      return photoPreview;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let photoUrl = selected?.photo_url || '';

      if (selected) {
        if (photoFile) photoUrl = await uploadPhoto(selected.id) || photoUrl;
        await supabase.from('team_members').update({ ...formData, photo_url: photoUrl }).eq('id', selected.id);
      } else {
        const { data: newMember } = await supabase.from('team_members').insert([{ ...formData }]).select('id').single();
        if (newMember && photoFile) {
          photoUrl = await uploadPhoto(newMember.id) || photoUrl;
          if (photoUrl) await supabase.from('team_members').update({ photo_url: photoUrl }).eq('id', newMember.id);
        }
      }

      setIsModalOpen(false);
      setSelected(null);
      setPhotoFile(null);
      setPhotoPreview('');
      fetchData();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apagar este profissional?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    if (detailMember?.id === id) setDetailMember(null);
    fetchData();
  };

  const openNew = () => {
    setSelected(null);
    setFormData({ name: '', role: '', phone: '', email: '', commission_rate: 0, access_level: 'employee', pin_code: '', color: '#3B82F6' });
    setPhotoFile(null);
    setPhotoPreview('');
    setIsModalOpen(true);
  };

  const openEdit = (m, e) => {
    e.stopPropagation();
    setSelected(m);
    setFormData({ name: m.name || '', role: m.role || '', phone: m.phone || '', email: m.email || '', commission_rate: m.commission_rate || 0, access_level: m.access_level || 'employee', pin_code: m.pin_code || '', color: m.color || '#3B82F6' });
    setPhotoFile(null);
    setPhotoPreview(m.photo_url || '');
    setIsModalOpen(true);
  };

  const openDetail = async (m) => {
    setDetailMember(m);
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, services(name, price), clients(name, phone)')
        .eq('team_member_id', m.id)
        .order('booking_date', { ascending: false })
        .limit(50);
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    }
    setLoadingHistory(false);
  };

  const filtered = members.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.services?.price) || 0), 0);
  const completedBookings = bookings.filter(b => b.status === 'concluido' || b.status === 'finalizado');
  const pendingBookings = bookings.filter(b => b.status === 'pendente' || b.status === 'confirmado');

  const statusColors = {
    pendente: 'bg-amber-100 text-amber-700',
    confirmado: 'bg-blue-100 text-blue-700',
    concluido: 'bg-emerald-100 text-emerald-700',
    finalizado: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  // Detail View
  if (detailMember) {
    return (
      <div className="space-y-6">
        <button onClick={() => setDetailMember(null)} className="flex items-center gap-2 text-sm text-muted hover:text-dark transition-colors">
          <ArrowLeft size={16} /> Voltar à equipa
        </button>

        {/* Profile Header */}
        <div className="card p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/20 flex-shrink-0">
              {detailMember.photo_url ? (
                <img src={detailMember.photo_url} alt={detailMember.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                  {detailMember.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark">{detailMember.name}</h2>
              <span className="badge badge-info mt-1">{detailMember.role || 'Profissional'}</span>
              <div className="flex gap-4 mt-3 text-sm text-muted">
                {detailMember.phone && <span className="flex items-center gap-1"><Phone size={13} />{detailMember.phone}</span>}
                {detailMember.email && <span className="flex items-center gap-1"><Mail size={13} />{detailMember.email}</span>}
                <span className="flex items-center gap-1"><Briefcase size={13} />Comissão: {detailMember.commission_rate || 0}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e) => openEdit(detailMember, e)} className="btn-secondary text-sm flex items-center gap-1"><Edit size={14} /> Editar</button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{bookings.length}</p>
            <p className="text-xs text-muted mt-1">Total Atendimentos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{completedBookings.length}</p>
            <p className="text-xs text-muted mt-1">Concluídos</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{pendingBookings.length}</p>
            <p className="text-xs text-muted mt-1">Pendentes</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-primary flex items-center justify-center gap-1"><Euro size={22} />{totalRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted mt-1">Valor Total</p>
          </div>
        </div>

        {/* Commission Summary */}
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><TrendingUp size={18} /></div>
            <div>
              <p className="font-semibold text-dark text-sm">Comissão Estimada</p>
              <p className="text-xs text-muted">{detailMember.commission_rate || 0}% de {totalRevenue.toFixed(0)}€</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">{(totalRevenue * (detailMember.commission_rate || 0) / 100).toFixed(0)}€</p>
        </div>

        {/* Booking History */}
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-border-main">
            <h3 className="font-bold text-dark flex items-center gap-2"><Calendar size={16} /> Histórico de Atendimentos</h3>
          </div>

          {loadingHistory ? (
            <div className="p-12 text-center text-muted">A carregar...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-muted">Sem atendimentos registados</div>
          ) : (
            <div className="divide-y divide-border-main max-h-[500px] overflow-y-auto">
              {bookings.map(b => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-muted">{b.booking_date ? new Date(b.booking_date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : '-'}</p>
                      <p className="text-xs font-bold text-dark flex items-center gap-0.5 justify-center"><Clock size={10} />{b.booking_time || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-dark">{b.services?.name || b.service || 'Serviço'}</p>
                      <p className="text-xs text-muted">{b.clients?.name || b.client_name || 'Cliente'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>
                      {b.status || 'pendente'}
                    </span>
                    <p className="text-sm font-bold text-primary min-w-[50px] text-right">{Number(b.services?.price || 0).toFixed(0)}€</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">Profissionais</h1><p className="text-muted text-sm mt-1">Equipa do salão</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Profissional</button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-border-main px-4 py-2.5 rounded-lg">
        <Search className="w-4 h-4 text-muted" />
        <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div key={m.id} onClick={() => openDetail(m)} className="card p-5 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="w-14 h-14 rounded-xl object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">{m.name?.charAt(0)}</div>
                )}
                <div>
                  <h3 className="font-semibold text-dark group-hover:text-primary transition-colors">{m.name}</h3>
                  <span className="badge badge-info">{m.role || 'Profissional'}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => openEdit(m, e)} className="p-1.5 rounded hover:bg-slate-100 text-muted hover:text-blue-600"><Edit size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted">
              {m.phone && <div className="flex items-center gap-2"><Phone size={13} />{m.phone}</div>}
              {m.email && <div className="flex items-center gap-2"><Mail size={13} />{m.email}</div>}
              <div className="flex items-center gap-2"><Briefcase size={13} />Comissão: {m.commission_rate || 0}%</div>
            </div>
            <p className="text-[11px] text-primary font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Clique para ver histórico →</p>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 card p-12 text-center text-muted">{loading ? 'A carregar...' : 'Nenhum profissional'}</div>}
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="flex items-center justify-between p-6 border-b border-border-main">
                  <h2 className="text-lg font-bold text-dark">{selected ? 'Editar' : 'Novo'} Profissional</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Photo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative group/photo cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-border-main hover:border-primary transition-colors">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-muted">
                            <Camera size={24} />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <Camera size={18} className="text-white" />
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark">Foto do Profissional</p>
                      <p className="text-xs text-muted mt-0.5">Clique para escolher uma foto</p>
                    </div>
                  </div>

                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="luxury-input" /></div>
                  <div><label className="text-sm font-medium text-dark mb-1.5 block">Função</label><input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="luxury-input" placeholder="Ex: Barbeiro, Mestre Barbeiro..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Telefone</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="luxury-input" /></div>
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="luxury-input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Nível de Acesso *</label>
                      <select required value={formData.access_level} onChange={e => setFormData({ ...formData, access_level: e.target.value })} className="luxury-input">
                        <option value="employee">Profissional (Restrito)</option>
                        <option value="admin">Administrador (Acesso Total)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">PIN de Login *</label>
                      <input required type="password" value={formData.pin_code} onChange={e => setFormData({ ...formData, pin_code: e.target.value })} className="luxury-input" placeholder="Ex: 1234" maxLength={6} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-dark mb-1.5 block">Taxa de Comissão (%)</label><input type="number" value={formData.commission_rate} onChange={e => setFormData({ ...formData, commission_rate: Number(e.target.value) })} className="luxury-input" /></div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Cor na Agenda *</label>
                      <div className="flex items-center gap-3">
                        <input required type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="h-10 w-14 rounded-lg cursor-pointer border border-border-main p-1 bg-white" />
                        <span className="text-sm text-muted font-medium uppercase">{formData.color}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                  <button type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                    {uploading ? 'A guardar...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTeam;
