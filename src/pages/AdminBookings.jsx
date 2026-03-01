import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, CheckCircle, XCircle, X, Eye, Filter, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminBookings = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const { user } = useAuth();
  const isAdmin = user?.access_level === 'admin';
  const scrollRef = useRef(null);

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [formData, setFormData] = useState({
    client_id: '', service_id: '', team_member_id: '',
    booking_date: '', booking_time: '09:00', status: 'pendente', notes: ''
  });

  const [filterTeamMember, setFilterTeamMember] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time
  useEffect(() => {
    if (scrollRef.current) {
      const currentHour = new Date().getHours();
      const currentMin = new Date().getMinutes();
      const totalMinFromStart = (currentHour - 8) * 60 + currentMin;
      const slotHeight = 48; // each 15min slot ~48px
      const scrollTarget = Math.max(0, (totalMinFromStart / 15) * slotHeight - 150);
      scrollRef.current.scrollTop = scrollTarget;
    }
  }, [loading]);

  const weekDays = React.useMemo(() => {
    const d = new Date(currentDate);
    const monday = new Date(d);
    monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
    monday.setHours(0,0,0,0);
    
    const week = [];
    for(let i = 0; i < 6; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  }, [currentDate]);

  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const startDate = weekDays[0]?.toISOString().split('T')[0];
      const endDate = weekDays[weekDays.length - 1]?.toISOString().split('T')[0];

      let query = supabase
        .from('bookings')
        .select('*, clients(name), services(name, duration), team_members(name, color)')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_time', { ascending: true });

      if (!isAdmin && user?.id) {
        query = query.eq('team_member_id', user.id);
      }

      const { data } = await query;
      setBookings(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchDropdownData = async () => {
    const [c, s, t] = await Promise.all([
      supabase.from('clients').select('id, name').order('name'),
      supabase.from('services').select('id, name, duration, price'),
      supabase.from('team_members').select('id, name, role, color'),
    ]);
    setClients(c.data || []);
    setServices(s.data || []);
    setTeam(t.data || []);
  };

  useEffect(() => { fetchBookings(); }, [weekDays, user]);
  useEffect(() => { fetchDropdownData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedBooking) {
        await supabase.from('bookings').update(formData).eq('id', selectedBooking.id);
      } else {
        await supabase.from('bookings').insert([formData]);
      }
      setIsModalOpen(false);
      setSelectedBooking(null);
      setFormData({ client_id: '', service_id: '', team_member_id: '', booking_date: '', booking_time: '09:00', status: 'pendente', notes: '' });
      fetchBookings();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem a certeza que pretende apagar este agendamento?')) return;
    await supabase.from('bookings').delete().eq('id', id);
    fetchBookings();
  };

  const openNewBooking = (date, time) => {
    setSelectedBooking(null);
    setFormData({
      client_id: '', service_id: '', team_member_id: '',
      booking_date: date || '', booking_time: time || '09:00',
      status: 'pendente', notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditBooking = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      client_id: booking.client_id, service_id: booking.service_id,
      team_member_id: booking.team_member_id || '', booking_date: booking.booking_date,
      booking_time: booking.booking_time, status: booking.status, notes: booking.notes || ''
    });
    setIsModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'confirmado': return <CheckCircle size={12} className="text-emerald-500" />;
      case 'pendente': return <Clock size={12} className="text-amber-500" />;
      case 'cancelado': return <XCircle size={12} className="text-red-500" />;
      case 'concluido': return <CheckCircle size={12} className="text-blue-500" />;
      default: return null;
    }
  };

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const nowInHours = now.getHours() + now.getMinutes() / 60;

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs font-medium text-muted uppercase">Total</p>
          <p className="text-2xl font-bold text-dark mt-1">{bookings.length}</p>
          <p className="text-xs text-muted mt-0.5">esta semana</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-muted uppercase">Pendentes</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{bookings.filter(b => b.status === 'pendente').length}</p>
          <p className="text-xs text-muted mt-0.5">a confirmar</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-muted uppercase">Confirmados</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{bookings.filter(b => b.status === 'confirmado').length}</p>
          <p className="text-xs text-muted mt-0.5">prontos</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-medium text-muted uppercase">Concluídos</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{bookings.filter(b => b.status === 'concluido').length}</p>
          <p className="text-xs text-muted mt-0.5">finalizados</p>
        </div>
      </div>

      {/* Header with Navigation + Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-dark">
              {weekDays[0] && `${weekDays[0].getDate()} - ${weekDays[weekDays.length-1]?.getDate()} ${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`}
            </h1>
            <button onClick={goToToday} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
              Hoje
            </button>
          </div>
          <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-slate-100 text-muted transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterTeamMember}
            onChange={(e) => setFilterTeamMember(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border-main bg-white text-sm text-dark outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos os profissionais</option>
            {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button onClick={() => openNewBooking()} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>

      {isAdmin && team.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-border-main">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Profissionais:</span>
          {team.map(t => (
            <div key={t.id} className="flex items-center gap-1.5 text-sm font-medium text-dark">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#3B82F6' }}></div>
              {t.name.split(' ')[0]}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Professional columns header */}
        <div className="grid border-b border-border-main" style={{ gridTemplateColumns: '60px repeat(6, 1fr)' }}>
          <div className="p-3 border-r border-border-main"></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`p-3 text-center border-r border-border-main last:border-0 ${isToday(day) ? 'bg-primary/5' : ''}`}>
              <div className="text-xs font-medium text-muted uppercase">{dayNames[i]}</div>
              <div className={`text-lg font-bold mt-0.5 ${isToday(day) ? 'text-primary' : 'text-dark'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div ref={scrollRef} className="relative max-h-[calc(100vh-380px)] overflow-y-auto">
          {/* Current time indicator */}
          {nowInHours >= 8 && nowInHours <= 20 && (
            <div 
              className="absolute left-0 right-0 z-10 border-t-2 border-red-400 pointer-events-none"
              style={{ top: `${((nowInHours - 8) / 12) * 100}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-red-400 -mt-[5px] -ml-[1px]"></div>
            </div>
          )}

          {timeSlots.map((time) => {
            const isHour = time.endsWith(':00');
            return (
              <div 
                key={time} 
                className={`grid ${isHour ? 'border-b border-border-main' : 'border-b border-slate-50'}`}
                style={{ gridTemplateColumns: '60px repeat(6, 1fr)', minHeight: '28px' }}
              >
                <div className="px-2 py-1 text-right border-r border-border-main">
                  {isHour && <span className="text-[11px] text-muted font-medium">{time}</span>}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const dayBookings = bookings.filter(b => 
                    b.booking_date === dateStr && 
                    b.booking_time === time && 
                    (!filterTeamMember || b.team_member_id === filterTeamMember)
                  );

                  return (
                    <div
                      key={dayIndex}
                      className={`border-r border-border-main last:border-0 relative cursor-pointer hover:bg-blue-50/50 transition-colors ${isToday(day) ? 'bg-primary/[0.02]' : ''}`}
                      onClick={() => openNewBooking(dateStr, time)}
                    >
                      {dayBookings.map((booking) => {
                        const evtColor = booking.team_members?.color || '#3B82F6';
                        return (
                          <div
                            key={booking.id}
                            onClick={(e) => { e.stopPropagation(); openEditBooking(booking); }}
                            className={`absolute inset-x-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium border cursor-pointer z-10 transition-transform hover:scale-[1.02]`}
                            style={{ 
                              minHeight: '24px',
                              backgroundColor: `${evtColor}15`,
                              borderColor: `${evtColor}30`,
                              color: evtColor
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate font-semibold text-dark">{booking.clients?.name}</span>
                              {getStatusIcon(booking.status)}
                            </div>
                            <div className="truncate opacity-80" style={{ color: evtColor }}>{booking.services?.name}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content w-full max-w-lg mx-4"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleSave}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-main">
                  <h2 className="text-lg font-bold text-dark">
                    {selectedBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
                  </h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted">
                    <X size={18} />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                  {/* Client */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Cliente *</label>
                    <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="luxury-input">
                      <option value="">Selecionar cliente...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Serviço *</label>
                    <select required value={formData.service_id} onChange={e => setFormData({...formData, service_id: e.target.value})} className="luxury-input">
                      <option value="">Selecionar serviço...</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.duration}min ({s.price}€)</option>)}
                    </select>
                  </div>

                  {/* Professional */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Profissional</label>
                    <select value={formData.team_member_id} onChange={e => setFormData({...formData, team_member_id: e.target.value})} className="luxury-input">
                      <option value="">Selecionar profissional...</option>
                      {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Data *</label>
                      <input required type="date" value={formData.booking_date} onChange={e => setFormData({...formData, booking_date: e.target.value})} className="luxury-input" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">Hora *</label>
                      <input required type="time" value={formData.booking_time} onChange={e => setFormData({...formData, booking_time: e.target.value})} className="luxury-input" />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Estado</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="luxury-input">
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Observações</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="luxury-input h-24 resize-none" placeholder="Observações..."></textarea>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border-main bg-slate-50 rounded-b-2xl">
                  {selectedBooking && (
                    <button type="button" onClick={() => handleDelete(selectedBooking.id)} className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Apagar
                    </button>
                  )}
                  <div className="flex gap-3 ml-auto">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">{selectedBooking ? 'Guardar' : 'Criar Agendamento'}</button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBookings;
