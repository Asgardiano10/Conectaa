import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, LogIn, UserPlus } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'SUPERVISOR' | 'AGENT'>('AGENT');
  const { login, signup } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signup({ name, email, password, role });
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      setError(isSignUp ? 'Erro ao criar conta' : 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bgmain flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-orbitron font-bold text-2xl">C+</span>
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">CONECTA+</h1>
          <p className="text-gray-400">Sistema de Gestão de Performance</p>
        </div>

        <div className="card p-6 rounded-xl">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-l-lg ${!isSignUp ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-r-lg ${isSignUp ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Função</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'SUPERVISOR' | 'AGENT')}
                    className="input"
                  >
                    <option value="AGENT">Agente</option>
                    <option value="SUPERVISOR">Supervisor</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                </>
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-2">Contas Demo (após configurar Supabase):</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Crie contas usando o botão "Criar Conta"</div>
                <div>Primeiro usuário será automaticamente SUPERVISOR</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
