import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, User, Clock, ChevronRight, Check, X, CheckCircle, Sparkles, Shield, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Scheduling = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProId, setAvailableProId] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceLinks, setServiceLinks] = useState([]);
  const [step, setStep] = useState(1); // Multi-step flow

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 20; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      if (i !== 20) slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const fetchTeamAndServices = async () => {
      try {
        const [teamRes, servicesRes] = await Promise.all([
          supabase.from('team_members').select('*').order('name'),
          supabase.from('services').select('*').order('name')
        ]);
        setTeam(teamRes.data || []);
        setServices(servicesRes.data || []);

        // Fetch service links separately (table may not exist)
        try {
          const { data: linksData } = await supabase.from('team_member_services').select('*');
          setServiceLinks(linksData || []);
        } catch { setServiceLinks([]); }
      } catch (err) {
        console.error('Error fetching data for scheduling:', err);
      }
    };
    fetchTeamAndServices();
  }, []);

  // Filter professionals by selected service (if links exist)
  const filteredTeam = selectedService && serviceLinks.length > 0
    ? team.filter(p => serviceLinks.some(l => l.team_member_id === p.id && l.service_id === selectedService))
    : team; // Show all if no links configured

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime) {
      setStatusMessage({ type: 'error', text: 'Selecione o serviço, data e hora.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: '', text: '' });
    setSuggestedSlots([]);

    try {
      const dateStr = bookingDate;
      
      let assignedProId = selectedProfessional;

      if (selectedProfessional) {
        const { data: dayBookings, error: dayErr } = await supabase
          .from('bookings')
          .select('booking_time')
          .eq('team_member_id', selectedProfessional)
          .eq('booking_date', dateStr)
          .neq('status', 'cancelado');
          
        if (dayErr) throw dayErr;
        
        const bookedTimes = dayBookings.map(b => b.booking_time);
        
        if (bookedTimes.includes(bookingTime)) {
          const suggestions = [];
          const [hh, mm] = bookingTime.split(':').map(Number);
          const totalMin = hh * 60 + mm;
          const offsets = [-60, -30, 30, 60];
          for (let offset of offsets) {
            const newMin = totalMin + offset;
            const newH = Math.floor(newMin / 60);
            const newM = newMin % 60;
            if (newH >= 9 && newH <= 20) {
              const slot = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
              if (!bookedTimes.includes(slot)) suggestions.push(slot);
            }
          }
          
          setSuggestedSlots(suggestions);
          setStatusMessage({ type: 'error', text: 'A profissional já tem marcação nesse horário.' });
          setIsSubmitting(false);
          return;
        }
      } else {
        const { data: dayBookings, error: dayErr } = await supabase
          .from('bookings')
          .select('team_member_id, booking_time')
          .eq('booking_date', dateStr)
          .neq('status', 'cancelado');
          
        if (dayErr) throw dayErr;

        const busyPros = dayBookings
          .filter(b => b.booking_time === bookingTime)
          .map(b => b.team_member_id);

        const freePro = team.find(p => !busyPros.includes(p.id));

        if (!freePro) {
          const suggestions = [];
          const [hh, mm] = bookingTime.split(':').map(Number);
          const totalMin = hh * 60 + mm;
          for (let offset of [-60, -30, 30, 60]) {
            const newMin = totalMin + offset;
            const newH = Math.floor(newMin / 60);
            const newM = newMin % 60;
            if (newH >= 9 && newH <= 20) {
              const slot = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
              const busyAt = dayBookings.filter(b => b.booking_time === slot).map(b => b.team_member_id);
              if (team.some(p => !busyAt.includes(p.id))) suggestions.push(slot);
            }
          }
          setSuggestedSlots(suggestions);
          setStatusMessage({ type: 'error', text: 'Sem profissionais disponíveis nesse horário.' });
          setIsSubmitting(false);
          return;
        }
        
        assignedProId = freePro.id;
      }

      setAvailableProId(assignedProId);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Error checking availability:', error);
      setStatusMessage({ type: 'error', text: 'Erro ao verificar disponibilidade.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
        setStatusMessage({ type: 'error', text: 'Preencha o seu nome e telemóvel.' });
        return;
    }
    
    setIsSubmitting(true);
    
    try {
      let clientId;
      const { data: existingClients } = await supabase
        .from('clients').select('id').eq('phone', clientPhone).limit(1);

      if (existingClients?.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient, error: newClientErr } = await supabase
          .from('clients')
          .insert([{ name: clientName, email: clientEmail, phone: clientPhone }])
          .select('id').single();
        if (newClientErr) throw newClientErr;
        clientId = newClient.id;
      }

      const { error: bookingErr } = await supabase
        .from('bookings')
        .insert([{
          client_id: clientId,
          service_id: selectedService,
          team_member_id: availableProId,
          booking_date: bookingDate,
          booking_time: bookingTime,
          status: 'pendente'
        }]);

      if (bookingErr) throw bookingErr;

      setStatusMessage({ type: 'success', text: 'Reserva efetuada com sucesso!' });
      
      setTimeout(() => {
          setIsModalOpen(false);
          setClientName(''); setClientPhone(''); setClientEmail('');
          setSelectedCategory(''); setSelectedService(''); setSelectedProfessional('');
          setBookingDate(''); setBookingTime('');
          setStatusMessage({ type: '', text: '' });
          setStep(1);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      setStatusMessage({ type: 'error', text: 'Erro ao processar a reserva.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceObj = services.find(s => s.id === selectedService);

  return (
    <section id="agendamento" className="py-28 relative overflow-hidden" style={{ backgroundColor: 'rgb(var(--bg-main))' }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: 'rgb(var(--primary))' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: 'rgb(var(--primary))' }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-bold tracking-[0.3em] text-xs uppercase mb-4 block">Agendamento Online</span>
          <h2 className="font-serif text-5xl mb-6" style={{ color: 'rgb(var(--text-main))' }}>
            Reserve o seu <i className="text-primary font-normal italic">Momento</i>
          </h2>
          <p className="max-w-lg mx-auto text-sm leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>
            Escolha o serviço, a profissional e o horário ideal. Processo simples, rápido e elegante.
          </p>
        </motion.div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[
            { n: 1, label: 'Área' },
            { n: 2, label: 'Serviço' },
            { n: 3, label: 'Profissional' },
            { n: 4, label: 'Data & Hora' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <button 
                onClick={() => s.n < step ? setStep(s.n) : null}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                  step === s.n 
                    ? 'bg-primary text-white shadow-lg' 
                    : step > s.n 
                      ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20' 
                      : 'border text-muted'
                }`}
                style={step < s.n ? { borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-muted))' } : {}}
              >
                {step > s.n ? <Check size={14} /> : <span>{s.n}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < 3 && <div className="w-8 h-[1px]" style={{ background: step > s.n ? 'rgb(var(--primary))' : 'rgb(var(--border-main))' }}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Status Messages */}
        {statusMessage.text && !isModalOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-8">
            <div className={`p-4 rounded-2xl text-sm font-semibold border ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {statusMessage.text}
              {suggestedSlots.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedSlots.map(slot => (
                    <button 
                      key={slot}
                      type="button"
                      onClick={() => { setBookingTime(slot); setSuggestedSlots([]); setStatusMessage({ type: '', text: '' }); }}
                      className="px-4 py-2 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors text-xs font-bold"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-3xl border shadow-xl overflow-hidden" style={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border-main))' }}>
            <form onSubmit={handleCheckAvailability}>
              <AnimatePresence mode="wait">
                {/* Step 1: Choose Category */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Sparkles size={18} /></div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-main))' }}>Qual área deseja?</h3>
                        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Selecione a categoria de serviço</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {[...new Set(services.map(s => s.category).filter(Boolean))].sort().map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => { setSelectedCategory(cat); setStep(2); }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group hover:shadow-md ${
                            selectedCategory === cat ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                          }`}
                          style={selectedCategory !== cat ? { borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' } : {}}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm capitalize" style={{ color: 'rgb(var(--text-main))' }}>{cat}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <ChevronRight size={16} className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Choose Service */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Sparkles size={18} /></div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-main))' }}>Qual serviço {selectedCategory ? `de ${selectedCategory.toLowerCase()}` : 'deseja'}?</h3>
                        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Selecione o tratamento pretendido</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {(selectedCategory ? services.filter(s => s.category === selectedCategory) : services).map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSelectedService(s.id); setStep(3); }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group hover:shadow-md ${
                            selectedService === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''
                          }`}
                          style={selectedService !== s.id ? { borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' } : {}}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm" style={{ color: 'rgb(var(--text-main))' }}>{s.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>{s.duration} min</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary text-lg">{Number(s.price).toFixed(0)}€</span>
                            <ChevronRight size={16} className="text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Choose Professional */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={18} /></div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-main))' }}>Com quem prefere?</h3>
                        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Escolha a sua profissional ou qualquer uma disponível</p>
                      </div>
                    </div>

                    {selectedServiceObj && (
                      <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl border" style={{ borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' }}>
                        <Check size={14} className="text-primary" />
                        <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text-main))' }}>{selectedServiceObj.name}</span>
                        <span className="text-xs ml-auto text-primary font-bold">{Number(selectedServiceObj.price).toFixed(0)}€</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => { setSelectedProfessional(''); setStep(4); }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${!selectedProfessional ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                        style={selectedProfessional ? { borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' } : {}}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Star size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'rgb(var(--text-main))' }}>Qualquer profissional</p>
                          <p className="text-[11px]" style={{ color: 'rgb(var(--text-muted))' }}>Primeira disponível</p>
                        </div>
                      </button>

                      {filteredTeam.map((pro) => (
                        <button
                          key={pro.id}
                          type="button"
                          onClick={() => { setSelectedProfessional(pro.id); setStep(4); }}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left relative ${selectedProfessional === pro.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                          style={selectedProfessional !== pro.id ? { borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' } : {}}
                        >
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-slate-100">
                            {pro.photo_url ? (
                              <img src={pro.photo_url} alt={pro.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                {pro.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate" style={{ color: 'rgb(var(--text-main))' }}>{pro.name}</p>
                            <p className="text-[11px] truncate" style={{ color: 'rgb(var(--text-muted))' }}>{pro.role}</p>
                          </div>
                          {selectedProfessional === pro.id && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                      {filteredTeam.length === 0 && (
                        <div className="col-span-2 text-center py-6 text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                          Nenhuma profissional disponível para este serviço
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Date & Time */}
                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><CalendarIcon size={18} /></div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-main))' }}>Quando pretende?</h3>
                        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Selecione a data e hora pretendida</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {selectedServiceObj && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          <Sparkles size={12} /> {selectedServiceObj.name}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <User size={12} /> {selectedProfessional ? team.find(t => t.id === selectedProfessional)?.name : 'Qualquer'}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'rgb(var(--text-main))' }}>Data</label>
                        <input 
                          required type="date" value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-xl px-4 py-4 text-sm outline-none transition-all border focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          style={{ backgroundColor: 'rgb(var(--bg-main))', borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-main))' }}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest mb-3 block" style={{ color: 'rgb(var(--text-main))' }}>Horário</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingTime(time)}
                              className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                                bookingTime === time 
                                  ? 'bg-primary text-white border-primary shadow-md' 
                                  : 'hover:border-primary/50'
                              }`}
                              style={bookingTime !== time ? { borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-main))', backgroundColor: 'rgb(var(--bg-main))' } : {}}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting || !bookingDate || !bookingTime}
                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                      >
                        {isSubmitting ? 'A Verificar...' : 'Verificar Disponibilidade'}
                        {!isSubmitting && <ChevronRight size={16} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { icon: <Shield size={14} />, text: 'Dados seguros' },
              { icon: <CheckCircle size={14} />, text: 'Confirmação imediata' },
              { icon: <Clock size={14} />, text: 'Cancelamento gratuito' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                <span className="text-primary">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
              style={{ backgroundColor: 'rgb(var(--bg-card))', borderColor: 'rgb(var(--border-main))' }}
            >
              <div className="p-8 border-b flex justify-between items-center" style={{ borderColor: 'rgb(var(--border-main))', backgroundColor: 'rgb(var(--bg-main))' }}>
                <div>
                   <h3 className="font-serif text-2xl" style={{ color: 'rgb(var(--text-main))' }}>Quase <i className="text-primary italic font-normal">Lá!</i></h3>
                   <p className="text-xs mt-1 uppercase tracking-widest font-bold text-primary">Horário Disponível ✓</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 border rounded-full hover:opacity-70 transition-colors" style={{ borderColor: 'rgb(var(--border-main))' }}>
                  <X className="w-5 h-5" style={{ color: 'rgb(var(--text-muted))' }} />
                </button>
              </div>

              <form onSubmit={handleConfirmBooking} className="p-8 space-y-5">
                {statusMessage.text && (
                  <div className={`p-4 rounded-xl text-sm font-semibold border ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    {statusMessage.text}
                  </div>
                )}
                
                {/* Booking Summary */}
                <div className="rounded-2xl p-4 border space-y-2" style={{ backgroundColor: 'rgb(var(--bg-main))', borderColor: 'rgb(var(--border-main))' }}>
                  <div className="flex justify-between text-sm"><span style={{ color: 'rgb(var(--text-muted))' }}>Serviço</span><span className="font-semibold" style={{ color: 'rgb(var(--text-main))' }}>{selectedServiceObj?.name}</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'rgb(var(--text-muted))' }}>Data</span><span className="font-semibold" style={{ color: 'rgb(var(--text-main))' }}>{bookingDate && new Date(bookingDate).toLocaleDateString('pt-PT')}</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: 'rgb(var(--text-muted))' }}>Hora</span><span className="font-semibold" style={{ color: 'rgb(var(--text-main))' }}>{bookingTime}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: 'rgb(var(--border-main))' }}><span className="font-bold" style={{ color: 'rgb(var(--text-main))' }}>Total</span><span className="font-bold text-primary text-lg">{selectedServiceObj ? Number(selectedServiceObj.price).toFixed(0) : 0}€</span></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary block mb-1.5">Nome Completo</label>
                    <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} 
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      style={{ backgroundColor: 'rgb(var(--bg-main))', borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-main))' }}
                      placeholder="O seu nome" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary block mb-1.5">Telemóvel</label>
                    <input required type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} 
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      style={{ backgroundColor: 'rgb(var(--bg-main))', borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-main))' }}
                      placeholder="+351 900 000 000" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary block mb-1.5">Email (Opcional)</label>
                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} 
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      style={{ backgroundColor: 'rgb(var(--bg-main))', borderColor: 'rgb(var(--border-main))', color: 'rgb(var(--text-main))' }}
                      placeholder="O seu melhor email" />
                  </div>
                </div>

                <div className="pt-4">
                  {statusMessage.type !== 'success' && (
                     <button 
                       type="submit" disabled={isSubmitting}
                       className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                     >
                       {isSubmitting ? 'A Confirmar...' : <><CheckCircle size={16} /> Confirmar Marcação</>}
                     </button>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Scheduling;
