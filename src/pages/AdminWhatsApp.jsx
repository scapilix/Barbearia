import React, { useState } from 'react';
import { MessageSquare, Send, Users, Clock, Settings, Plus, Phone, CheckCircle } from 'lucide-react';

const AdminWhatsApp = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Lembrete de Agendamento', message: 'Olá {{nome}}! 👋 Lembrete: o seu agendamento no TO Barber é amanhã às {{hora}}. Confirma? Responda SIM ou NÃO.', type: 'lembrete' },
    { id: 2, name: 'Aniversário', message: 'Feliz Aniversário, {{nome}}! 🎂🎉 O TO Barber deseja um dia maravilhoso! Aproveite 15% de desconto no seu próximo serviço. 💅', type: 'marketing' },
    { id: 3, name: 'Boas-Vindas', message: 'Olá {{nome}}! Bem-vinda ao TO Barber! 💅✨ Estamos felizes em tê-la como cliente. Agende agora pelo nosso site!', type: 'onboarding' },
    { id: 4, name: 'Promoção Mensal', message: '✨ Promoção Especial! {{nome}}, este mês temos 20% OFF em todos os serviços de Barber Art. Agende já! 💅', type: 'marketing' },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '', type: 'lembrete' });

  const typeLabels = { lembrete: 'Lembrete', marketing: 'Marketing', onboarding: 'Onboarding' };
  const typeColors = { lembrete: 'badge-warning', marketing: 'bg-purple-50 text-purple-700', onboarding: 'badge-success' };

  const openNew = () => { setEditTemplate(null); setFormData({ name: '', message: '', type: 'lembrete' }); setIsModalOpen(true); };
  const openEdit = (t) => { setEditTemplate(t); setFormData({ name: t.name, message: t.message, type: t.type }); setIsModalOpen(true); };
  const handleSave = (e) => { e.preventDefault(); if(editTemplate) { setTemplates(templates.map(t => t.id === editTemplate.id ? {...t, ...formData} : t)); } else { setTemplates([...templates, { id: Date.now(), ...formData }]); } setIsModalOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-dark">WhatsApp Marketing</h1><p className="text-muted text-sm mt-1">Templates de mensagens e automações</p></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} /> Novo Template</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><Send size={18} /></div><p className="text-xs font-medium text-muted uppercase">Mensagens Enviadas</p><p className="text-2xl font-bold text-dark mt-1">0</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2"><Users size={18} /></div><p className="text-xs font-medium text-muted uppercase">Templates</p><p className="text-2xl font-bold text-dark mt-1">{templates.length}</p></div>
        <div className="stat-card"><div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><CheckCircle size={18} /></div><p className="text-xs font-medium text-muted uppercase">Taxa Abertura</p><p className="text-2xl font-bold text-dark mt-1">—</p></div>
      </div>

      {/* Templates */}
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => openEdit(t)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><MessageSquare size={16} /></div>
                <h3 className="font-semibold text-dark text-sm">{t.name}</h3>
              </div>
              <span className={`badge ${typeColors[t.type]||'badge-info'}`}>{typeLabels[t.type]||t.type}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-muted leading-relaxed">{t.message}</div>
            <div className="flex justify-end mt-3"><button className="text-xs text-primary font-medium hover:underline">Editar</button></div>
          </div>
        ))}
      </div>

      {/* WhatsApp Config */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Phone size={20} /></div><h3 className="text-lg font-semibold text-dark">Configuração WhatsApp</h3></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-dark mb-1.5 block">Número WhatsApp Business</label><input className="luxury-input" placeholder="+351 912 345 678" /></div>
          <div><label className="text-sm font-medium text-dark mb-1.5 block">API Key</label><input className="luxury-input" placeholder="Chave de API" type="password" /></div>
        </div>
        <p className="text-xs text-muted mt-3">Configure a integração com a API do WhatsApp Business para envio automático de mensagens.</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="flex items-center justify-between p-6 border-b border-border-main"><h2 className="text-lg font-bold text-dark">{editTemplate ? 'Editar' : 'Novo'} Template</h2><button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 text-muted">✕</button></div>
              <div className="p-6 space-y-4">
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Nome *</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="luxury-input" /></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Tipo</label><select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="luxury-input"><option value="lembrete">Lembrete</option><option value="marketing">Marketing</option><option value="onboarding">Onboarding</option></select></div>
                <div><label className="text-sm font-medium text-dark mb-1.5 block">Mensagem *</label><textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="luxury-input h-32 resize-none" placeholder="Use {{nome}} e {{hora}} como variáveis" /></div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border-main bg-slate-50 rounded-b-2xl"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Guardar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminWhatsApp;
