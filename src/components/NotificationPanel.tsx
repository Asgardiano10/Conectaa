import React, { useEffect, useState } from "react";
import { subscribeNotifications, createNotification, deleteNotification } from "../api/notifications";
import { useAuth } from "../context/AuthContext";
import { Bell, Plus, Trash2, AlertCircle } from "lucide-react";
import { Notification } from "../types";

export default function NotificationPanel() {
  const [notes, setNotes] = useState<Notification[]>([]);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', body: '' });

  useEffect(() => {
    const unsub = subscribeNotifications(setNotes);
    return () => unsub();
  }, []);

  async function handleCreateNote() {
    if (user?.role !== "SUPERVISOR" || !formData.title || !formData.body) return;
    
    try {
      await createNotification({
        title: formData.title,
        body: formData.body,
        created_by: user.id
      });
      setFormData({ title: '', body: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
    }
  }

  async function handleRemoveNote(id: string) {
    if (user?.role !== "SUPERVISOR") return;
    
    if (confirm("Excluir notificação?")) {
      try {
        await deleteNotification(id);
      } catch (error) {
        console.error('Erro ao excluir notificação:', error);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Avisos da Equipe</h3>
        </div>
        
        {user?.role === 'SUPERVISOR' && (
          <button
            onClick={() => setShowForm(true)}
            className="btn flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Aviso
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card p-4 rounded-lg">
          <h4 className="font-medium mb-3">Criar Novo Aviso</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Título do aviso"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="input"
            />
            <textarea
              placeholder="Mensagem"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              className="input"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={handleCreateNote} className="btn">
                Publicar
              </button>
              <button 
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="card p-6 rounded-lg text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum aviso publicado</p>
          </div>
        ) : (
          notes.map(n => (
            <div key={n.id} className="card p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{n.title}</h4>
                {user?.role === 'SUPERVISOR' && (
                  <button
                    onClick={() => handleRemoveNote(n.id!)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300 mb-2">{n.body}</p>
              <div className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
