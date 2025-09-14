import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, BarChart3, Users, Target, Bell, User as UserIcon, ClipboardList } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  users: UserType[];
}

export default function Sidebar({ users }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar, path: '/' },
    { id: 'performance', label: 'Performance', icon: BarChart3, path: '/performance' },
    { id: 'team-performance', label: 'Relatórios', icon: ClipboardList, path: '/team-performance' },
    { id: 'team', label: 'Equipe', icon: Users, path: '/team' },
    { id: 'meta', label: 'Meta', icon: Target, path: '/meta' },
    { id: 'notifications', label: 'Avisos', icon: Bell, path: '/notifications' },
  ];

  const isAgentPage = location.pathname.startsWith('/agent/');
  const selectedAgentId = isAgentPage ? location.pathname.split('/')[2] : null;

  return (
    <aside className="w-64 bg-secondary/30 backdrop-blur-sm border-r border-gray-700/50 p-4 space-y-6 flex-shrink-0">
      {/* Menu Principal */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-4">MENU</h3>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`sidebar-item w-full ${isActive && !isAgentPage ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Lista de Agentes */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-4">AGENTES</h3>
        <div className="space-y-1">
          <NavLink
            to="/"
            className={`sidebar-item w-full ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Users className="w-5 h-5" />
            <span>Visão Geral</span>
          </NavLink>
          
          {users.map((agent) => (
            <NavLink
              key={agent.id}
              to={`/agent/${agent.id}`}
              className={`sidebar-item w-full ${selectedAgentId === agent.id ? 'active' : ''}`}
            >
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                {agent.photo_url ? (
                  <img src={agent.photo_url} alt={agent.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-3 h-3 text-primary" />
                )}
              </div>
              <div className="flex-1 text-left truncate">
                <div className="text-sm truncate">{agent.name}</div>
                {agent.role === 'SUPERVISOR' && (
                  <div className="text-xs text-accent">Supervisor</div>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
