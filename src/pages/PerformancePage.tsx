import React, { useState, useEffect } from 'react';
import PerformanceCharts from '../components/PerformanceCharts';
import { subscribeUsers } from '../api/users';
import { subscribeEvents } from '../api/events';
import { User, Event } from '../types';

export default function PerformancePage() {
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

  return <PerformanceCharts events={events} users={users} />;
}
