import React from 'react';
import { User } from '../../../types';
import { Avatar } from '../../ui/Avatar';

interface MemberCardProps {
    user: User;
}

const MemberCard: React.FC<MemberCardProps> = ({ user }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, userId: string) => {
        e.dataTransfer.setData('userId', userId);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            draggable
            onDragStart={(e) => handleDragStart(e, user.id)}
            className="flex items-center gap-3 p-3 bg-white rounded-md shadow-sm border cursor-grab active:cursor-grabbing"
        >
            <Avatar user={user} size="sm"/>
            <div className="flex-1">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
            </div>
        </div>
    );
};

export default MemberCard;