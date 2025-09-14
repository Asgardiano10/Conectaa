import React, { useEffect, useState } from "react";
import { subscribeGroupMeta, updateGroupMeta } from "../api/groupMeta";
import { useAuth } from "../context/AuthContext";
import { Target, TrendingUp, Edit3 } from "lucide-react";
import { GroupMeta as GroupMetaType } from "../types";

export default function GroupMeta() {
  const [meta, setMeta] = useState<GroupMetaType | null>(null);
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const unsub = subscribeGroupMeta(setMeta);
    return () => unsub();
  }, []);

  async function handleEdit() {
    if (!user || user.role !== "SUPERVISOR") return;
    setEditValue(meta?.numeric_value.toString() || '5000');
    setIsEditing(true);
  }

  async function handleSave() {
    if (!user || user.role !== "SUPERVISOR") return;
    
    try {
      await updateGroupMeta(Number(editValue), user.id);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
    }
  }

  if (!meta) {
    return (
      <div className="card p-6 rounded-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-600 rounded w-48"></div>
        </div>
      </div>
    );
  }

  const currentProgress = 3200;
  const progressPercentage = Math.min((currentProgress / meta.numeric_value) * 100, 100);

  return (
    <div className="card p-6 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-1">Meta Principal do Grupo</h3>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input w-32"
                  autoFocus
                />
                <button onClick={handleSave} className="btn text-sm px-2 py-1">
                  Salvar
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-sm px-2 py-1"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold font-orbitron text-white">
                  {meta.numeric_value.toLocaleString()}
                </h2>
                {user?.role === 'SUPERVISOR' && (
                  <button 
                    onClick={handleEdit}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {currentProgress.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary to-green-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <span>Progresso atual</span>
        <span>Faltam: {(meta.numeric_value - currentProgress).toLocaleString()}</span>
      </div>
    </div>
  );
}
