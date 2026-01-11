import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Group } from '../../types';
import { useMembers } from '../../context/ClubContext';
import { AvatarGroup } from '../ui/Avatar';
import { getGroupColorHex } from '../../utils/color';

interface DraggableGroupCardProps {
    group: Group;
}

const DraggableGroupCard: React.FC<DraggableGroupCardProps> = ({ group }) => {
    const { users } = useMembers();
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: group.id,
        data: {
            type: 'group',
            groupId: group.id
        }
    });

    const groupColor = getGroupColorHex(group.id);

    const style = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        borderLeftColor: groupColor,
    };
    
    const groupMembers = users.filter(u => group.members.includes(u.id));

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            className="p-3 bg-white rounded-lg shadow border border-gray-200 cursor-grab active:cursor-grabbing border-l-4"
        >
            <p className="font-bold text-gray-800">{group.name}</p>
            <p className="text-sm text-gray-500 truncate">{group.description}</p>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">{group.members.length} Members</span>
                <AvatarGroup users={groupMembers} max={3} />
            </div>
        </div>
    );
};

export default DraggableGroupCard;
