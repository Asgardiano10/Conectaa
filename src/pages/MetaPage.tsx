import React from 'react';
import GroupMeta from '../components/GroupMeta';

export default function MetaPage() {
  return (
    <div className="space-y-6">
      <GroupMeta />
      <div className="card p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Histórico de Atualizações</h3>
        <p className="text-gray-400">O histórico de alterações na meta principal será exibido aqui em uma futura atualização.</p>
      </div>
    </div>
  );
}
