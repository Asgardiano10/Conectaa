import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById } from '../api/users';
import { getEvents } from '../api/events';
import { User, Event } from '../types';
import { User as UserIcon, Mail, Calendar, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CalendarView from '../components/CalendarView';

const StatCard = ({ icon, label, value, color }: { icon: React.ElementType, label: string, value: string | number, color: string }) => {
  const Icon = icon;
  return (
    <div className="card p-4 rounded-lg flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color: color }} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default function AgentPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('atividades');

  useEffect(() => {
    if (!agentId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const agentData = await getUserById(agentId);
        setAgent(agentData);
        if (agentData) {
          const eventData = await getEvents({ assigned_to: agentId });
          setEvents(eventData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do agente:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [agentId]);

  const performanceStats = useMemo(() => {
    const realized = events.filter(e => e.status === 'realizado');
    return {
      total: realized.length,
      visitas: realized.filter(e => e.category === 'visita').length,
      reunioes: realized.filter(e => e.category === 'reuniao').length,
      cobrancas: realized.filter(e => e.category === 'cobranca').length,
    };
  }, [events]);

  const categoryData = useMemo(() => {
    const categories = ['visita', 'reuniao', 'cobranca', 'outro'];
    const total = performanceStats.total;
    if (total === 0) return [];
    
    return categories.map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: events.filter(e => e.category === cat && e.status === 'realizado').length,
    }));
  }, [events, performanceStats.total]);

  const pieColors = ['#10B981', '#3B82F6', '#F59E0B', '#6B7280'];

  if (loading) {
    return <div className="text-center p-10">Carregando perfil do agente...</div>;
  }

  if (!agent) {
    return <div className="text-center p-10">Agente não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <div className="card p-6 rounded-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          {agent.photo_url ? (
            <img src={agent.photo_url} alt={agent.name} className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <UserIcon className="w-12 h-12 text-primary" />
          )}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 mt-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{agent.email}</span>
            </div>
            {agent.role === 'SUPERVISOR' && (
              <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">
                SUPERVISOR
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Atividades Realizadas" value={performanceStats.total} color="#00A3FF" />
        <StatCard icon={CheckCircle} label="Visitas" value={performanceStats.visitas} color="#10B981" />
        <StatCard icon={Users} label="Reuniões" value={performanceStats.reunioes} color="#3B82F6" />
        <StatCard icon={BarChart3} label="Cobranças" value={performanceStats.cobrancas} color="#F59E0B" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button onClick={() => setActiveTab('atividades')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'atividades' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Atividades</button>
        <button onClick={() => setActiveTab('performance')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'performance' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}>Performance</button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'atividades' && (
          <div className="card p-4 rounded-lg">
            <CalendarView filters={{ assignedTo: agentId }} />
          </div>
        )}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Atividades por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Add more charts here if needed */}
          </div>
        )}
      </div>
    </div>
  );
}
