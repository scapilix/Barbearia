import React, { useState } from 'react';
import { Share2, Globe, Copy, ExternalLink, Clock, CheckCircle, Settings } from 'lucide-react';

const AdminOnlineBooking = () => {
  const [config, setConfig] = useState({
    enabled: true,
    auto_confirm: false,
    max_days_advance: 30,
    slot_duration: 15,
    require_phone: true,
    show_prices: true,
    cancellation_hours: 24,
    booking_url: window.location.origin,
  });

  const handleChange = (key, value) => setConfig({ ...config, [key]: value });
  const copyLink = () => { navigator.clipboard.writeText(config.booking_url); alert('Link copiado!'); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-dark">Agendamento Online</h1><p className="text-muted text-sm mt-1">Configure o agendamento público do seu salão</p></div>

      <div className="grid grid-cols-2 gap-6">
        {/* Link Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-primary/10 text-primary"><Globe size={20} /></div><h3 className="text-lg font-semibold text-dark">Link de Agendamento</h3></div>
          <div className="flex items-center gap-2 bg-slate-50 border border-border-main rounded-lg p-3">
            <input readOnly value={config.booking_url} className="bg-transparent text-sm text-dark flex-1 outline-none" />
            <button onClick={copyLink} className="p-2 rounded-lg hover:bg-slate-200 text-muted hover:text-primary transition-colors"><Copy size={16} /></button>
            <a href={config.booking_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-slate-200 text-muted hover:text-primary transition-colors"><ExternalLink size={16} /></a>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted">{config.enabled ? 'Agendamento online ativo' : 'Agendamento desativado'}</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle size={20} /></div><h3 className="text-lg font-semibold text-dark">Estado</h3></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border-main"><span className="text-sm text-muted">Status</span><span className={`badge ${config.enabled ? 'badge-success' : 'badge-danger'}`}>{config.enabled ? 'Ativo' : 'Inativo'}</span></div>
            <div className="flex justify-between items-center py-2 border-b border-border-main"><span className="text-sm text-muted">Confirmação</span><span className="text-sm font-medium text-dark">{config.auto_confirm ? 'Automática' : 'Manual'}</span></div>
            <div className="flex justify-between items-center py-2"><span className="text-sm text-muted">Antecedência</span><span className="text-sm font-medium text-dark">{config.max_days_advance} dias</span></div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-lg bg-primary/10 text-primary"><Settings size={20} /></div><h3 className="text-lg font-semibold text-dark">Configurações</h3></div>
        <div className="space-y-5">
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium text-dark">Agendamento Online</p><p className="text-xs text-muted">Permitir clientes agendar online</p></div>
            <input type="checkbox" checked={config.enabled} onChange={e => handleChange('enabled', e.target.checked)} className="w-10 h-5 rounded-full appearance-none bg-slate-200 checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium text-dark">Confirmação Automática</p><p className="text-xs text-muted">Confirmar agendamentos automaticamente</p></div>
            <input type="checkbox" checked={config.auto_confirm} onChange={e => handleChange('auto_confirm', e.target.checked)} className="w-10 h-5 rounded-full appearance-none bg-slate-200 checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium text-dark">Exigir Telefone</p><p className="text-xs text-muted">Obrigar número de telefone</p></div>
            <input type="checkbox" checked={config.require_phone} onChange={e => handleChange('require_phone', e.target.checked)} className="w-10 h-5 rounded-full appearance-none bg-slate-200 checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div><p className="text-sm font-medium text-dark">Mostrar Preços</p><p className="text-xs text-muted">Exibir preços dos serviços</p></div>
            <input type="checkbox" checked={config.show_prices} onChange={e => handleChange('show_prices', e.target.checked)} className="w-10 h-5 rounded-full appearance-none bg-slate-200 checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-5" />
          </label>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div><label className="text-sm font-medium text-dark mb-1.5 block">Duração Slot (min)</label><input type="number" value={config.slot_duration} onChange={e => handleChange('slot_duration', Number(e.target.value))} className="luxury-input" /></div>
            <div><label className="text-sm font-medium text-dark mb-1.5 block">Máx. Dias</label><input type="number" value={config.max_days_advance} onChange={e => handleChange('max_days_advance', Number(e.target.value))} className="luxury-input" /></div>
            <div><label className="text-sm font-medium text-dark mb-1.5 block">Cancelamento (horas)</label><input type="number" value={config.cancellation_hours} onChange={e => handleChange('cancellation_hours', Number(e.target.value))} className="luxury-input" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminOnlineBooking;
