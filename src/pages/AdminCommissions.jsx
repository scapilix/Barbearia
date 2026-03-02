import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, CheckCircle, X, Calendar, Clock, Euro, TrendingUp, ArrowLeft, Filter, Search, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDatePicker from '../components/CustomDatePicker';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Erro Crítico na Página</h2>
          <pre className="p-4 bg-white/50 rounded overflow-auto text-sm border border-red-200">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminCommissionsContent = () => {
  const [commissions, setCommissions] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
  });
  const [search, setSearch] = useState('');

  // Popup state
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberBookings, setMemberBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.access_level === 'admin';

  const fetchData = async () => {
    setLoading(true);
    try {
      const commQuery = supabase.from('commissions').select('*').order('date', { ascending: false });
      const teamQuery = supabase.from('team_members').select('id, name, commission_rate, photo_url');

      if (!isAdmin && user?.id) {
        commQuery.eq('team_member_id', user.id);
        teamQuery.eq('id', user.id);
      }

      const [c, t] = await Promise.all([commQuery, teamQuery]);
      const fetchedCommissions = c.data || [];
      setCommissions(fetchedCommissions);
      setTeam(t.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, startDate, endDate]);

  const markPaid = async (id) => {
    await supabase.from('commissions').update({ status: 'pago' }).eq('id', id);
    fetchData();
  };

  const safeFormatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(String(dateStr).substring(0, 10) + 'T12:00:00');
      if (isNaN(d.getTime())) {
        const d2 = new Date(dateStr);
        if (isNaN(d2.getTime())) return String(dateStr).split('T')[0];
        return d2.toLocaleDateString('pt-PT');
      }
      return d.toLocaleDateString('pt-PT');
    } catch (e) {
      return String(dateStr);
    }
  };

  const filteredCommissions = commissions.filter(c => {
    const matchStatus = filter === 'all' || c.status === filter;
    const dateMatch = (!startDate || c.date >= startDate) && (!endDate || c.date <= endDate);
    const searchMatch = !search || c.member_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && dateMatch && searchMatch;
  });

  const totalPending = filteredCommissions.filter(c => c.status === 'pendente').reduce((a, c) => a + Number(c.amount || 0), 0);
  const totalPaid = filteredCommissions.filter(c => c.status === 'pago').reduce((a, c) => a + Number(c.amount || 0), 0);

  // Open member detail popup
  const openMemberDetail = async (member) => {
    setSelectedMember(member);
    setLoadingBookings(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, services(name, price), clients(name)')
        .eq('team_member_id', member.id)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: false });
      setMemberBookings(data || []);
    } catch (e) {
      console.error(e);
      setMemberBookings([]);
    }
    setLoadingBookings(false);
  };

  const memberRevenue = memberBookings.reduce((s, b) => s + Number(b.services?.price || 0), 0);
  const memberCommission = memberRevenue * ((selectedMember?.commission_rate || 0) / 100);

  const statusColors = {
    pendente: 'bg-amber-100 text-amber-700',
    confirmado: 'bg-blue-100 text-blue-700',
    concluido: 'bg-emerald-100 text-emerald-700',
    finalizado: 'bg-emerald-100 text-emerald-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div><h1 className="text-2xl font-bold text-dark">Comissões</h1><p className="text-muted text-sm mt-1">Gestão de comissões da equipa</p></div>
      </div>
      {/* Enhanced Filters Box (Matches Orders & Bookings) */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-border-main p-3 rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 bg-slate-50 rounded-md">
          <Search className="w-4 h-4 text-muted" />
          <input type="text" placeholder="Pesquisar profissional..." value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-44">
              <CustomDatePicker 
                  value={startDate} 
                  onChange={setStartDate} 
                  placeholder="Data inicial" 
              />
            </div>
            <div className="w-44">
              <CustomDatePicker 
                  value={endDate} 
                  onChange={setEndDate} 
                  placeholder="Data final" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-amber-50 text-amber-600 w-fit mb-2"><DollarSign size={18} /></div><p className="text-xs font-medium text-muted uppercase">Pendentes</p><p className="text-2xl font-bold text-amber-600 mt-1">{totalPending.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><CheckCircle size={18} /></div><p className="text-xs font-medium text-muted uppercase">Pagas</p><p className="text-2xl font-bold text-emerald-600 mt-1">{totalPaid.toFixed(2)}€</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><Users size={18} /></div><p className="text-xs font-medium text-muted uppercase">Profissionais</p><p className="text-2xl font-bold text-dark mt-1">{team.length}</p></div>
      </div>

      {/* Team Cards - Clickable */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dark mb-4">{isAdmin ? 'Taxas de Comissão por Profissional' : 'O Meu Resumo Diário/Mensal'}</h3>
        <div className="space-y-3">
          {team.map(m => {
            const memberTotal = filteredCommissions.filter(c => c.team_member_id === m.id || c.member_name === m.name).reduce((a, c) => a + Number(c.amount || 0), 0);
            const memberCount = filteredCommissions.filter(c => c.team_member_id === m.id || c.member_name === m.name).length;
            return (
              <div key={m.id} onClick={() => openMemberDetail(m)} className="flex items-center justify-between py-3 border-b border-border-main last:border-0 cursor-pointer hover:bg-slate-50/50 rounded-lg px-3 transition-colors group">
                <div className="flex items-center gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{m.name?.charAt(0)}</div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-dark group-hover:text-primary transition-colors">{m.name}</div>
                    <div className="text-xs text-muted">{memberCount} comissões no período</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{m.commission_rate || 0}%</div>
                  <div className="text-xs text-muted">Total: {memberTotal.toFixed(2)}€</div>
                </div>
              </div>
            );
          })}
          {team.length === 0 && <p className="text-sm text-muted text-center py-4">Nenhum profissional registado</p>}
        </div>
      </div>

      {/* Commission History Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
          <h3 className="font-semibold text-dark">Histórico de Comissões</h3>
          <div className="flex gap-2">
            {['all', 'pendente', 'pago'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50'}`}>
                {f === 'all' ? 'Todas' : f === 'pendente' ? 'Pendentes' : 'Pagas'}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead><tr className="bg-slate-50 border-b border-border-main"><th className="table-header text-left px-6 py-3">Profissional</th><th className="table-header text-left px-6 py-3">Data</th><th className="table-header text-left px-6 py-3">Taxa</th><th className="table-header text-left px-6 py-3">Estado</th><th className="table-header text-right px-6 py-3">Valor</th></tr></thead>
          <tbody>
            {filteredCommissions.map(c => (
              <tr key={c.id} className="table-row">
                <td className="px-6 py-4 text-sm font-medium text-dark">{c.member_name || '—'}</td>
                <td className="px-6 py-4 text-sm text-muted">{safeFormatDate(c.date)}</td>
                <td className="px-6 py-4 text-sm text-muted">{c.rate}%</td>
                <td className="px-6 py-4">
                  {c.status === 'pendente' ? <button onClick={(e) => { e.stopPropagation(); markPaid(c.id); }} className="badge badge-warning cursor-pointer hover:bg-amber-100">Pendente → Pagar</button> : <span className="badge badge-success">Pago</span>}
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-dark">{Number(c.amount || 0).toFixed(2)}€</td>
              </tr>
            ))}
            {filteredCommissions.length === 0 && (
                <tr>
                    <td colSpan="5" className="p-0">
                        <div className="p-16 flex flex-col items-center justify-center text-center bg-white/50 border-dashed border-2 m-4 rounded-xl">
                            <FileText size={48} className="text-slate-200 mb-4" />
                            <h3 className="text-slate-800 font-bold text-lg mb-2">Nenhuma Comissão</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Não foi encontrada nenhuma comissão para o profissional ou datas selecionadas.</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Detail Popup */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={() => setSelectedMember(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="modal-content w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-main flex-shrink-0">
                <div className="flex items-center gap-4">
                  {selectedMember.photo_url ? (
                    <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-14 h-14 rounded-xl object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">{selectedMember.name?.charAt(0)}</div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-dark">{selectedMember.name}</h2>
                    <p className="text-xs text-muted">Comissão: {selectedMember.commission_rate || 0}%</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 rounded-lg hover:bg-slate-100 text-muted"><X size={18} /></button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 p-6 border-b border-border-main flex-shrink-0">
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-2xl font-bold text-primary">{memberBookings.length}</p>
                  <p className="text-[11px] text-muted">Atendimentos</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-2xl font-bold text-dark flex items-center justify-center gap-0.5"><Euro size={16} />{memberRevenue.toFixed(0)}</p>
                  <p className="text-[11px] text-muted">Receita Gerada</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-0.5"><Euro size={16} />{memberCommission.toFixed(0)}</p>
                  <p className="text-[11px] text-muted">Comissão ({selectedMember.commission_rate}%)</p>
                </div>
              </div>

              {/* Bookings List */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-3 border-b border-border-main bg-slate-50">
                  <h3 className="text-sm font-bold text-dark flex items-center gap-2"><Calendar size={14} /> Histórico de Atendimentos</h3>
                </div>
                {loadingBookings ? (
                  <div className="p-12 text-center text-muted">A carregar...</div>
                ) : memberBookings.length === 0 ? (
                  <div className="p-12 text-center text-muted flex flex-col items-center">
                      <FileText size={40} className="text-slate-300 mb-3" />
                      <p>Sem atendimentos neste período</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-main">
                    {memberBookings.map(b => (
                      <div key={b.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[50px]">
                            <p className="text-[11px] text-muted">{safeFormatDate(b.booking_date)}</p>
                            <p className="text-[11px] font-bold text-dark flex items-center gap-0.5 justify-center"><Clock size={10} />{b.booking_time}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-dark">{b.services?.name || 'Serviço'}</p>
                            <p className="text-xs text-muted">{b.clients?.name || 'Cliente'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>{b.status}</span>
                          <p className="text-sm font-bold text-primary min-w-[45px] text-right">{Number(b.services?.price || 0).toFixed(0)}€</p>
                        </div>
                      </div>
                    ))}
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

const AdminCommissions = () => (
  <ErrorBoundary>
    <AdminCommissionsContent />
  </ErrorBoundary>
);

export default AdminCommissions;
