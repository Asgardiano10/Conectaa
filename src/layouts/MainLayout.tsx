import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { subscribeUsers } from '../api/users';
import { User } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubUsers = subscribeUsers(setUsers);
    return () => unsubUsers();
  }, []);

  return (
    <div className="min-h-screen bg-bgmain text-white">
      <Navbar />
      <div className="flex" style={{ height: 'calc(100vh - 68px)' }}>
        <Sidebar users={users} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
