import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../../types/roles';

interface MobileNavProps {
  role?: UserRole;
}

const items = [
  { label: 'Home', to: '/', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Booking', to: '/booking', roles: ['admin', 'coach', 'player', 'parent'] },
  { label: 'Groups', to: '/groups', roles: ['admin', 'coach', 'parent'] },
  { label: 'Planner', to: '/planner', roles: ['admin', 'coach'] },
  { label: 'Admin', to: '/admin', roles: ['admin'] },
] as const;

const MobileNav: React.FC<MobileNavProps> = ({ role }) => (
  <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white py-3 text-xs font-semibold text-slate-500 lg:hidden">
    {items
      .filter((item) => (role ? item.roles.includes(role) : false))
      .map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'text-primary' : '')} end>
          {item.label}
        </NavLink>
      ))}
  </nav>
);

export default MobileNav;
