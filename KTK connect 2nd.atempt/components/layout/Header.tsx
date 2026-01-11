import React, { useState } from 'react';
import { useMembers } from '../../context/ClubContext';
import { AppView, UserRole } from '../../types';
import Icon from '../ui/Icon';
import NotificationDropdown from './NotificationDropdown';
import { CLUB_NAME } from '../../constants';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const NavLink: React.FC<{
  view: AppView;
  label: string;
  iconName: 'calendar' | 'users' | 'court' | 'sparkles' | 'clipboard-document-list';
  activeView: AppView;
  onClick: (view: AppView) => void;
  isMobile?: boolean;
}> = ({ view, label, iconName, activeView, onClick, isMobile = false }) => {
  const isActive = activeView === view;
  const classes = `
    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors
    ${isActive
      ? 'bg-primary-700 text-white'
      : 'text-white hover:bg-primary-500 hover:bg-opacity-75'
    }
    ${isMobile ? 'text-base' : ''}
  `;
  return (
    <a onClick={() => onClick(view)} className={classes}>
      <Icon name={iconName} className="h-5 w-5" />
      {label}
    </a>
  );
};


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const { currentUser } = useMembers();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminOrCoach = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Coach;

  const handleNavClick = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-primary-600 sticky top-0 z-40 shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
                <span className="text-white font-bold text-xl">{CLUB_NAME}</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink view="dashboard" label="Dashboard" iconName="calendar" activeView={activeView} onClick={handleNavClick} />
                {isAdminOrCoach && (
                  <NavLink view="planner" label="Planner" iconName="clipboard-document-list" activeView={activeView} onClick={handleNavClick} />
                )}
                <NavLink view="groups" label="Groups" iconName="users" activeView={activeView} onClick={handleNavClick} />
                <NavLink view="booking" label="Book Court" iconName="court" activeView={activeView} onClick={handleNavClick} />
                <NavLink view="coach" label="AI Coach" iconName="sparkles" activeView={activeView} onClick={handleNavClick} />
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <NotificationDropdown />
              <div className="flex items-center gap-2 text-white">
                <Avatar user={currentUser} size="md"/>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-primary-200">{currentUser.credits} Credits</span>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-primary-600 p-2 text-primary-200 hover:bg-primary-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <Icon name="close" className="h-6 w-6" />
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <NavLink view="dashboard" label="Dashboard" iconName="calendar" activeView={activeView} onClick={handleNavClick} isMobile />
             {isAdminOrCoach && (
                <NavLink view="planner" label="Planner" iconName="clipboard-document-list" activeView={activeView} onClick={handleNavClick} isMobile />
             )}
            <NavLink view="groups" label="Groups" iconName="users" activeView={activeView} onClick={handleNavClick} isMobile />
            <NavLink view="booking" label="Book Court" iconName="court" activeView={activeView} onClick={handleNavClick} isMobile />
            <NavLink view="coach" label="AI Coach" iconName="sparkles" activeView={activeView} onClick={handleNavClick} isMobile />
          </div>
          <div className="border-t border-primary-700 pt-4 pb-3">
            <div className="flex items-center px-5">
              <Avatar user={currentUser} size="md"/>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">{currentUser.name}</div>
                <div className="text-sm font-medium leading-none text-primary-300">{currentUser.credits} Credits</div>
              </div>
              <div className="ml-auto">
                <NotificationDropdown />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
