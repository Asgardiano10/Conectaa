import React, { useState, useEffect, useMemo } from 'react';
import { User, Event } from '../types';
import { subscribeUsers } from '../api/users';
import { subscribeEvents } from '../api/events';
import { Filter, User as UserIcon, X } from 'lucide-react';

const CategoryBadge = ({ category }: { category: Event['category'] }) => {
  const styles = {
    visita: 'bg-green-500/20 text-green-400 border-green-500/30',
    reuniao: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cobranca: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    outro: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[category]}`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Event['status'] }) => {
  const styles = {
    realizado: 'bg-primary/20 text-primary border-primary/30',
    planejado: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function TeamPerformancePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState({
    agentId: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const unsubUsers = subscribeUsers(setUsers);
    const unsubEvents = subscribeEvents({ callback: setEvents });
    return () => {
      unsubUsers();
      unsubEvents();
    };
  }, []);

  const userMap = useMemo(() => {
    return new Map(users.map(user => [user.id, user]));
  }, [users]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const agentMatch = filters.agentId === 'all' || event.assigned_to === filters.agentId;
      const categoryMatch = filters.category === 'all' || event.category === filters.category;
      const startDateMatch = !startDate || eventDate >= startDate;
      const endDateMatch = !endDate || eventDate <= endDate;

      return agentMatch && categoryMatch && startDateMatch && endDateMatch;
    });
  }, [events, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      agentId: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Relatório de Atividades</h1>

      {/* Filters */}
      <div className="card p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Agente</label>
            <select name="agentId" value={filters.agentId} onChange={handleFilterChange} className="input">
              <option value="all">Todos os Agentes</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="input">
              <option value="all">Todas as Categorias</option>
              <option value="visita">Visita</option>
              <option value="reuniao">Reunião</option>
              <option value="cobranca">Cobrança</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Data Início</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Data Fim</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" />
          </div>
          <button onClick={clearFilters} className="btn-secondary h-10 flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Limpar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-secondary/50">
              <tr>
                <th scope="col" className="px-6 py-3">Agente</th>
                <th scope="col" className="px-6 py-3">Categoria</th>
                <th scope="col" className="px-6 py-3">Título</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(event => {
                const agent = userMap.get(event.assigned_to);
                return (
                  <tr key={event.id} className="border-b border-gray-700 hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {agent?.photo_url ? (
                            <img src={agent.photo_url} alt={agent.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span>{agent?.name || 'Desconhecido'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><CategoryBadge category={event.category} /></td>
                    <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                    <td className="px-6 py-4"><StatusBadge status={event.status} /></td>
                    <td className="px-6 py-4">{new Date(event.start_date).toLocaleDateString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            Nenhuma atividade encontrada com os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
}
