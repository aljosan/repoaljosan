import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from '../navigation/MobileNav';
import { useAuth } from '../../hooks/useAuth';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 pb-16 lg:pb-0">
      <Topbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="flex-1 space-y-6">{children}</main>
      </div>
      <MobileNav role={profile?.role} />
    </div>
  );
};

export default AppShell;
