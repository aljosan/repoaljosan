import React, { useState, useEffect, useRef } from 'react';
import { View, Notification, Member } from '../types';
import { ICONS } from '../constants';
import NotificationsBell from './NotificationsBell';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: () => void;
  currentUser: Member;
  adminId: string;
  onLogout: () => void;
}

const DropdownMenuItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        isActive
          ? 'font-semibold bg-club-primary/10 text-club-primary'
          : 'font-medium text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, notifications, onMarkNotificationsAsRead, currentUser, adminId, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleMenuClick = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };
  
  const isAdmin = currentUser.id === adminId;

  const menuItems = [
    // Club Life
    { view: View.DASHBOARD, label: 'Dashboard', icon: ICONS.CALENDAR },
    { view: View.ANNOUNCEMENTS, label: 'Announcements', icon: ICONS.ANNOUNCEMENTS },
    { view: View.COMMUNITY, label: 'Community', icon: ICONS.COMMUNITY },
    { view: View.GROUPS, label: 'Groups', icon: ICONS.GROUPS },
    // Playing Tennis
    { view: View.BOOKING, label: 'Book Court', icon: ICONS.COURT },
    { view: View.FIND_PARTNER, label: 'Find Partner', icon: ICONS.FIND_PARTNER },
    { view: View.LADDER, label: 'Ladder', icon: ICONS.TROPHY },
    // Improvement
    { view: View.LESSONS, label: 'Lessons', icon: ICONS.LESSONS },
    { view: View.AI_COACH, label: 'AI Coach', icon: ICONS.SPARKLES },
    { view: View.LEARNING_CENTER, label: 'Learning Center', icon: ICONS.BOOK },
    // Resources & Admin
    { view: View.MY_ACCOUNT, label: 'My Account', icon: ICONS.WALLET },
    { view: View.PRIVACY_POLICY, label: 'Privacy Policy', icon: ICONS.SHIELD_CHECK },
    { view: View.MEMBERS, label: 'Members', icon: ICONS.MEMBERS },
    { view: View.SURVEYS, label: 'Surveys', icon: ICONS.SURVEYS },
  ];
  
  if (isAdmin) {
    menuItems.push({ view: View.SETTINGS, label: 'Admin Settings', icon: ICONS.SETTINGS });
  }


  return (
    <header className="bg-white shadow-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <h1 className="text-xl md:text-2xl font-bold text-club-primary">KTK Connect</h1>
              <svg className={`h-5 w-5 text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isMenuOpen && (
              <div className="origin-top-left absolute left-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                <div className="grid grid-cols-2 gap-1">
                  {menuItems.sort((a,b) => a.label.localeCompare(b.label)).map(item => (
                    <DropdownMenuItem 
                      key={item.view}
                      label={item.label}
                      icon={item.icon}
                      isActive={currentView === item.view}
                      onClick={() => handleMenuClick(item.view)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <NotificationsBell
              notifications={notifications}
              onMarkAsRead={onMarkNotificationsAsRead}
              setCurrentView={setCurrentView}
            />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-club-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                <span>{currentUser.name.charAt(0)}</span>
              </div>
              <button onClick={onLogout} className="text-sm text-slate-600 hover:underline">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;