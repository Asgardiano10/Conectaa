import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-secondary/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-orbitron font-bold text-sm">C+</span>
            </div>
            <h1 className="text-xl font-orbitron font-bold text-white">CONECTA+</h1>
          </div>
          {user?.role === 'SUPERVISOR' && (
            <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">
              SUPERVISOR
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              {user?.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="text-sm text-gray-300">{user?.name}</span>
          </div>
          
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-white hover:bg-secondary rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
