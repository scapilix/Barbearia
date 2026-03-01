import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  Bell,
  Search,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white px-6 flex items-center justify-between border-b border-border-main shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-border-main w-full">
              <Search className="w-4 h-4 text-muted" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-transparent border-none outline-none text-sm w-full text-dark placeholder:text-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors">
              <HelpCircle size={18} />
            </button>
            <button className="p-2 rounded-lg text-muted hover:text-dark hover:bg-slate-50 transition-colors">
              <Settings size={18} />
            </button>

            <div className="h-6 w-px bg-border-main mx-1"></div>

            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 pl-2 rounded-xl transition-colors">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ backgroundColor: user?.color || '#7C3AED' }}
              >
                {getInitials(user?.name)}
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-dark leading-tight">{user?.name?.split(' ')[0] || 'Utilizador'}</div>
                <div className="text-[10px] text-muted capitalize">{user?.role || 'Membro'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
