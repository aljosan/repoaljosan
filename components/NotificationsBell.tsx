import React, { useState, useEffect, useRef } from 'react';
import { Notification, View } from '../types';
import { ICONS } from '../constants';
import NotificationsPanel from './NotificationsPanel';

interface NotificationsBellProps {
    notifications: Notification[];
    onMarkAsRead: () => void;
    setCurrentView: (view: View) => void;
}

const NotificationsBell: React.FC<NotificationsBellProps> = ({ notifications, onMarkAsRead, setCurrentView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Mark as read after a short delay to allow panel to open
            setTimeout(() => onMarkAsRead(), 1000);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={handleBellClick} className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none">
                {ICONS.BELL}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </button>
            {isOpen && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onClose={() => setIsOpen(false)}
                    setCurrentView={setCurrentView}
                />
            )}
        </div>
    );
};

export default NotificationsBell;