import React, { useState, useRef, useEffect } from 'react';
import { useClub } from '../../context/ClubContext';
import Icon from '../ui/Icon';

const NotificationDropdown: React.FC = () => {
  const { notifications, markNotificationAsRead } = useClub();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleToggle = () => {
      setIsOpen(prev => !prev);
      if(!isOpen) {
          notifications.filter(n => !n.read).forEach(n => markNotificationAsRead(n.id));
      }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-full bg-primary-600 p-1 text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
      >
        <span className="sr-only">View notifications</span>
        <Icon name="bell" className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu">
          <div className="px-4 py-2 text-sm font-semibold text-gray-900 border-b">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map(notification => (
              <div key={notification.id} className={`px-4 py-3 text-sm text-gray-700 border-b last:border-b-0 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <p>{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {notifications.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">No notifications yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;