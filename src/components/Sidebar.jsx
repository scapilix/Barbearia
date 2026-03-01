import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, Scissors, Package, 
  Wallet, FileText, Target, BarChart3, Stethoscope, 
  ShoppingBag, Gift, MessageSquare, Share2, Settings, 
  LogOut, Plus, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarSection = ({ title, items }) => (
  <div className="mb-5">
    <h3 className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
      {title}
    </h3>
    <div className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) => `
            sidebar-link
            ${isActive ? 'sidebar-link-active' : 'text-white/60 hover:text-white hover:bg-white/10'}
          `}
        >
          {React.cloneElement(item.icon, { size: 17, strokeWidth: 1.8 })}
          <span className="font-medium">{item.name}</span>
        </NavLink>
      ))}
    </div>
  </div>
);

const Sidebar = () => {
  const sections = [
    {
      title: 'Principal',
      items: [
        { name: 'Painel', icon: <LayoutDashboard />, path: '/admin' },
        { name: 'Agenda', icon: <Calendar />, path: '/admin/bookings' },
        { name: 'Comandas', icon: <FileText />, path: '/admin/orders' },
        { name: 'Pacotes', icon: <Package />, path: '/admin/plans' },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { name: 'Transações', icon: <Wallet />, path: '/admin/invoices' },
        { name: 'Comissões', icon: <Gift />, path: '/admin/commissions' },
        { name: 'Caixa', icon: <ShoppingBag />, path: '/admin/cashier' },
        { name: 'Despesas', icon: <Wallet />, path: '/admin/expenses' },
        { name: 'Faturas', icon: <FileText />, path: '/admin/faturas' },
      ]
    },
    {
      title: 'Controle',
      items: [
        { name: 'Metas', icon: <Target />, path: '/admin/goals' },
        { name: 'Relatórios', icon: <BarChart3 />, path: '/admin/reports' },
        { name: 'Anamneses', icon: <Stethoscope />, path: '/admin/anamnesis' },
      ]
    },
    {
      title: 'Registos',
      items: [
        { name: 'Clientes', icon: <Users />, path: '/admin/clients' },
        { name: 'Serviços', icon: <Scissors />, path: '/admin/services' },
        { name: 'Produtos', icon: <ShoppingBag />, path: '/admin/store' },
        { name: 'Profissionais', icon: <Users />, path: '/admin/team' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Agendamento Online', icon: <Share2 />, path: '/admin/online-booking' },
        { name: 'WhatsApp', icon: <MessageSquare />, path: '/admin/whatsapp' },
      ]
    }
  ];

  const { user, logout } = useAuth();
  const isAdmin = user?.access_level === 'admin';

  // Filter sections for employees
  const visibleSections = isAdmin ? sections : [
    {
      title: 'Principal',
      items: [
        { name: 'Painel', icon: <LayoutDashboard />, path: '/admin' },
        { name: 'Agenda', icon: <Calendar />, path: '/admin/bookings' },
      ]
    },
    {
      title: 'Registos',
      items: [
        { name: 'Clientes', icon: <Users />, path: '/admin/clients' },
      ]
    },
    {
      title: 'Financeiro',
      items: [
        { name: 'Minhas Comissões', icon: <Gift />, path: '/admin/commissions' },
      ]
    }
  ];

  return (
    <aside className="w-56 bg-[#1A1A1E] flex flex-col h-screen sticky top-0 z-50">
      {/* Brand */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <Scissors className="text-white" size={14} />
          </div>
          <h1 className="text-base font-bold text-white tracking-tight">
            TO<span className="text-primary font-normal">Beauty</span>
          </h1>
        </div>
        
        {/* User Profile / Portal */}
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5 mb-2">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={user.name} className="w-11 h-11 rounded-full object-cover border-2 flex-shrink-0" style={{ borderColor: user.color || '#3B82F6' }} />
          ) : (
            <div className="w-11 h-11 rounded-full flex flex-shrink-0 items-center justify-center text-lg font-bold text-white shadow-inner" style={{ backgroundColor: user?.color || '#3B82F6' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.name?.split(' ')[0] || 'Utilizador'}</p>
            <p className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5 truncate">{isAdmin ? 'Admin' : 'Profissional'}</p>
          </div>
        </div>
      </div>

      {/* New Button */}
      <div className="px-3 mb-3">
        <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
          <Plus size={15} strokeWidth={2.5} />
          Novo
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {visibleSections.map((s) => (
          <SidebarSection key={s.title} title={s.title} items={s.items} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        {isAdmin && (
          <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
            <Settings size={16} />
            <span className="text-sm">Definições</span>
          </NavLink>
        )}
        <button onClick={logout} className="sidebar-link text-white/50 hover:text-red-300 hover:bg-red-500/10 w-full mt-1">
          <LogOut size={16} />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
