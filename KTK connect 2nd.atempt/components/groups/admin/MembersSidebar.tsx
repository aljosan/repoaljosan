import React, { useState } from 'react';
import { User } from '../../../types';
import { Avatar } from '../../ui/Avatar';

interface MembersSidebarProps {
  allUsers: User[];
}

const MembersSidebar: React.FC<MembersSidebarProps> = ({ allUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, userId: string) => {
        e.dataTransfer.setData('userId', userId);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-64 bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Club Members</h2>
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        draggable
                        onDragStart={e => handleDragStart(e, user.id)}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-grab"
                    >
                        <Avatar user={user} size="sm" />
                        <span className="text-sm font-medium">{user.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MembersSidebar;