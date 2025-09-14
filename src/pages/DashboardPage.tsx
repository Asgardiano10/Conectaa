import React, { useState, useEffect } from 'react';
import CalendarView from '../components/CalendarView';
import GroupMeta from '../components/GroupMeta';
import { useLocation } from 'react-router-dom';

export default function DashboardPage() {
  const location = useLocation();
  const [filters, setFilters] = useState({ assignedTo: undefined });

  // A simple way to check if we are on the main dashboard vs an agent page
  const isGeneralDashboard = location.pathname === '/';

  return (
    <div className="space-y-6">
      {isGeneralDashboard && <GroupMeta />}
      <CalendarView filters={filters} />
    </div>
  );
}
