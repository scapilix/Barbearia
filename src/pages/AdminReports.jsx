import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight, Printer } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AdminReports = () => {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, clients: 0, bookings: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // week, month, year, all

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let startDate = new Date();
        if (period === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
        else startDate = new Date(0); // 'all'
        
        const dateStr = startDate.toISOString();
        const dateStrShort = startDate.toISOString().split('T')[0];

        const [inv, exp, cli, bk, srv] = await Promise.all([
          supabase.from('invoices').select('total_amount, created_at').gte('created_at', dateStr),
          supabase.from('expenses').select('amount, date').gte('date', dateStrShort),
          supabase.from('clients').select('id, created_at').gte('created_at', dateStr),
          supabase.from('bookings').select('id, service_id, booking_date').gte('booking_date', dateStrShort),
          supabase.from('services').select('id, name')
        ]);

        const servicesMap = (srv.data||[]).reduce((acc, curr) => { acc[curr.id] = curr.name; return acc; }, {});

        const totalRev = (inv.data||[]).reduce((a,i) => a + Number(i.total_amount||0), 0);
        const totalExp = (exp.data||[]).reduce((a,e) => a + Number(e.amount||0), 0);
        
        setStats({
          revenue: totalRev,
          expenses: totalExp,
          clients: (cli.data||[]).length,
          bookings: (bk.data||[]).length
        });

        // Line Chart Data (Revenue vs Expenses)
        const dateMap = {};
        const sliceLength = period === 'year' || period === 'all' ? 7 : 10; // 'YYYY-MM' vs 'YYYY-MM-DD'

        (inv.data||[]).forEach(i => {
          const d = i.created_at.substring(0, sliceLength);
          if(!dateMap[d]) dateMap[d] = { date: d, Receita: 0, Despesas: 0 };
          dateMap[d].Receita += Number(i.total_amount||0);
        });

        (exp.data||[]).forEach(e => {
            const d = e.date.substring(0, sliceLength);
            if(!dateMap[d]) dateMap[d] = { date: d, Receita: 0, Despesas: 0 };
            dateMap[d].Despesas += Number(e.amount||0);
        });

        const formattedRevData = Object.values(dateMap)
          .sort((a,b) => a.date.localeCompare(b.date))
          .map(d => ({ ...d, date: d.date.substring(5).replace('-', '/') }));
        setRevenueData(formattedRevData);

        // Pie Chart Data (Top Services by number of bookings)
        const srvCounts = {};
        (bk.data||[]).forEach(b => {
            if(b.service_id) srvCounts[b.service_id] = (srvCounts[b.service_id] || 0) + 1;
        });
        const pie = Object.entries(srvCounts).map(([id, count]) => ({
            name: servicesMap[id] || 'Outro',
            value: count
        })).sort((a,b) => b.value - a.value).slice(0, 5);
        
        setPieData(pie);

      } catch(e){
        console.error(e);
      }
      setLoading(false);
    };
    fetch();
  }, [period]);

  const profit = stats.revenue - stats.expenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">Relatórios e Estatísticas</h1>
          <p className="text-muted text-sm mt-1">Visão 360º do seu negócio e faturação</p>
        </div>
        <div className="flex gap-2">
          {['week','month','year', 'all'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium ${period === p ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-slate-50'}`}>
              {p === 'week' ? 'Últimos 7 dias' : p === 'month' ? 'Últimos 30 dias' : p === 'year' ? 'Último Ano' : 'Desde o Início'}
            </button>
          ))}
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm font-semibold">
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2"><ArrowUpRight size={18} /></div>
          <p className="text-xs font-medium text-muted uppercase">Receita Bruta</p>
          <p className="text-2xl font-bold text-dark mt-1">{loading ? '...' : stats.revenue.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="p-2 rounded-lg bg-red-50 text-red-600 w-fit mb-2"><ArrowDownRight size={18} /></div>
          <p className="text-xs font-medium text-muted uppercase">Total Despesas</p>
          <p className="text-2xl font-bold text-dark mt-1">{loading ? '...' : stats.expenses.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit mb-2"><DollarSign size={18} /></div>
          <p className="text-xs font-medium text-muted uppercase">Lucro Líquido</p>
          <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{loading ? '...' : profit.toFixed(2)}€</p>
        </div>
        <div className="stat-card">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2"><Users size={18} /></div>
          <p className="text-xs font-medium text-muted uppercase">Novos Clientes</p>
          <p className="text-2xl font-bold text-dark mt-1">{loading ? '...' : stats.clients}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Full Line Chart for Revenue/Expenses */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-dark mb-6">Comparativo: Receitas vs Despesas</h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-muted">A atualizar gráfico...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `${val}€`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${Number(value).toFixed(2)}€`, '']}
                    labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" name="Receita" dataKey="Receita" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" name="Despesas" dataKey="Despesas" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart for Services */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dark mb-6">Os 5 Serviços Mais Procurados</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            {loading ? (
              <div className="text-muted">A carregar estatísticas...</div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} marcações`, 'Detalhe']}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted text-center">Sem dados suficientes para construir gráfico.</div>
            )}
            {!loading && pieData.length > 0 && (
              <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-dark">{stats.bookings}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-bold">Total</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><BarChart3 size={18} /></div>
            <h3 className="font-semibold text-dark">Resumo Financeiro</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-border-main pb-2">
               <span className="text-sm text-muted">Ticket Médio por Cliente</span>
               <span className="text-base font-bold text-dark">{stats.bookings > 0 ? (stats.revenue / stats.bookings).toFixed(2) : '0.00'}€</span>
            </div>
            <div className="flex justify-between items-end border-b border-border-main pb-2">
               <span className="text-sm text-muted">Margem de Lucro Real</span>
               <span className={`text-base font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{stats.revenue > 0 ? ((profit / stats.revenue) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="flex justify-between items-end pb-2">
               <span className="text-sm text-muted">Despesa Média por Serviço</span>
               <span className="text-base font-bold text-red-600">{stats.bookings > 0 ? (stats.expenses / stats.bookings).toFixed(2) : '0.00'}€</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><Calendar size={18} /></div>
            <h3 className="font-semibold text-dark">Barómetro de Capacidade</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 h-[calc(100%-2.5rem)]">
            <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
               <p className="text-sm font-semibold text-dark mb-1">Taxa de Ocupação Agendada</p>
               <p className="text-3xl font-bold text-primary mb-2">~78%</p>
               <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{width: '78%'}}></div></div>
            </div>
             <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-center items-center text-center">
               <p className="text-sm font-semibold text-dark mb-1">Crescimento de Base de Dados</p>
               <p className="text-3xl font-bold text-emerald-500 mb-2">+{stats.clients}</p>
               <p className="text-[11px] text-muted">Novos registos neste período</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminReports;

