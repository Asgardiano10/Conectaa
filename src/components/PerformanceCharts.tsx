import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, Target } from "lucide-react";
import { Event, User } from "../types";

interface PerformanceChartsProps {
  events: Event[];
  users: User[];
}

export default function PerformanceCharts({ events, users }: PerformanceChartsProps) {
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthEvents = events.filter(e => {
        const eventDate = new Date(e.start_date);
        return eventDate.getFullYear() === currentYear && eventDate.getMonth() === index;
      });
      
      return {
        month,
        visitas: monthEvents.filter(e => e.category === 'visita' && e.status === 'realizado').length,
        reunioes: monthEvents.filter(e => e.category === 'reuniao' && e.status === 'realizado').length,
        cobrancas: monthEvents.filter(e => e.category === 'cobranca' && e.status === 'realizado').length,
        total: monthEvents.filter(e => e.status === 'realizado').length
      };
    });
  }, [events]);

  const agentPerformance = useMemo(() => {
    return users.map(user => {
      const userEvents = events.filter(e => e.assigned_to === user.id && e.status === 'realizado');
      return {
        name: user.name,
        visitas: userEvents.filter(e => e.category === 'visita').length,
        reunioes: userEvents.filter(e => e.category === 'reuniao').length,
        cobrancas: userEvents.filter(e => e.category === 'cobranca').length,
        total: userEvents.length
      };
    }).sort((a, b) => b.total - a.total);
  }, [events, users]);

  const categoryData = useMemo(() => {
    const realizedEvents = events.filter(e => e.status === 'realizado');
    const categories = ['visita', 'reuniao', 'cobranca', 'outro'];
    
    return categories.map(category => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      value: realizedEvents.filter(e => e.category === category).length,
      percentage: realizedEvents.length > 0 ? ((realizedEvents.filter(e => e.category === category).length / realizedEvents.length) * 100).toFixed(1) : '0'
    }));
  }, [events]);

  const pieColors = ['#00A3FF', '#10B981', '#F59E0B', '#6B7280'];

  const totalStats = useMemo(() => {
    const totalEvents = events.filter(e => e.status === 'realizado').length;
    const thisMonth = new Date().getMonth();
    const thisMonthEvents = events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate.getMonth() === thisMonth && e.status === 'realizado';
    }).length;
    
    const lastMonthEvents = events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate.getMonth() === (thisMonth - 1 + 12) % 12 && e.status === 'realizado';
    }).length;
    
    const growth = lastMonthEvents > 0 ? ((thisMonthEvents - lastMonthEvents) / lastMonthEvents * 100).toFixed(1) : '0';
    
    return {
      total: totalEvents,
      thisMonth: thisMonthEvents,
      growth: parseFloat(growth)
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Atividades</p>
              <p className="text-2xl font-bold">{totalStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Este Mês</p>
              <p className="text-2xl font-bold">{totalStats.thisMonth}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Agentes Ativos</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${totalStats.growth >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg flex items-center justify-center`}>
              <Target className={`w-5 h-5 ${totalStats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Crescimento</p>
              <p className={`text-2xl font-bold ${totalStats.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalStats.growth >= 0 ? '+' : ''}{totalStats.growth}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#00A3FF" strokeWidth={2} />
              <Line type="monotone" dataKey="visitas" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="reunioes" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance por Agente */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Performance por Agente</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformance.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="total" fill="#00A3FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Categoria */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Distribuição por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ranking dos Agentes */}
        <div className="card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ranking dos Agentes</h3>
          <div className="space-y-3">
            {agentPerformance.slice(0, 8).map((agent, index) => (
              <div key={agent.name} className="flex items-center justify-between p-3 bg-bgmain/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-400 text-black' : 
                      index === 2 ? 'bg-amber-600 text-white' : 
                      'bg-primary/20 text-primary'}`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{agent.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{agent.total}</div>
                  <div className="text-xs text-gray-400">atividades</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
