import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/roles';

interface NavItem {
  label: string;
  to: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Court Booking', to: '/booking', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Groups & Teams', to: '/groups', roles: ['admin', 'coach', 'parent'] },
  { label: 'Training Planner', to: '/planner', roles: ['admin', 'coach'] },
  { label: 'Attendance', to: '/attendance', roles: ['admin', 'coach', 'parent'] },
  { label: 'Message Boards', to: '/messages', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Notifications', to: '/notifications', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Admin Console', to: '/admin', roles: ['admin'] },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'
  }`;

const Sidebar: React.FC = () => {
  const { profile } = useAuth();
  const role = profile?.role;

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Navigate</p>
      <nav className="mt-4 space-y-1">
        {navItems
          .filter((item) => (role ? item.roles.includes(role) : false))
          .map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses} end>
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
