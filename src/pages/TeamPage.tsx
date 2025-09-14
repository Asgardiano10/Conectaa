import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subscribeUsers } from '../api/users';
import { subscribeEvents } from '../api/events';
import { User, Event } from '../types';

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const unsubUsers = subscribeUsers(setUsers);
    const unsubEvents = subscribeEvents({ callback: setEvents });

    return () => {
      unsubUsers();
      unsubEvents();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(member => (
        <Link to={`/agent/${member.id}`} key={member.id} className="card p-4 rounded-lg hover:border-primary transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              {member.photo_url ? (
                <img src={member.photo_url} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-primary font-semibold text-xl">
                  {member.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-400">{member.email}</p>
              {member.role === 'SUPERVISOR' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-accent/20 text-accent text-xs rounded">
                  Supervisor
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Atividades realizadas: {events.filter(e => e.assigned_to === member.id && e.status === 'realizado').length}
          </div>
        </Link>
      ))}
    </div>
  );
}
