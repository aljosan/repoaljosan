import React from 'react';
import { Notification, View } from '../types';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
    setCurrentView: (view: View) => void;
}

const timeSince = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onClose, setCurrentView }) => {
    
    const handleNotificationClick = (notification: Notification) => {
        setCurrentView(notification.link);
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white rounded-lg shadow-xl z-30 border border-slate-200">
            <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {notifications.length === 0 ? (
                    <p className="text-center text-slate-500 p-6">You have no new notifications.</p>
                ) : (
                    notifications.map(n => (
                        <div 
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-club-primary/5' : ''}`}
                        >
                            <p className="text-sm text-slate-700">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{timeSince(n.timestamp)}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;