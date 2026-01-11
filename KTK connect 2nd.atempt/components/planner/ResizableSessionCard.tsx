import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Booking } from '../../types';
import { useGroups } from '../../context/ClubContext';
import Icon from '../ui/Icon';
import { getGroupColorHex } from '../../utils/color';
import LinkifiedText from '../ui/LinkifiedText';

interface ResizableSessionCardProps {
  booking: Booking;
  positionAndHeight: { top: number, height: number };
  onEdit: () => void;
}

const ResizableSessionCard: React.FC<ResizableSessionCardProps> = ({ booking, positionAndHeight, onEdit }) => {
  const { groups } = useGroups();
  const group = groups.find(g => g.id === booking.groupId);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: booking.id,
      data: { type: 'session', booking },
  });
  
  if (!group) return null;
  
  const groupColor = getGroupColorHex(group.id);

  const style = {
    ...positionAndHeight,
    transform: CSS.Translate.toString(transform),
    left: '2px',
    right: '2px',
    zIndex: isDragging ? 100 : 10,
    backgroundColor: groupColor,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute rounded-lg p-2 text-white flex flex-col justify-between shadow-lg transition-all duration-100 group ${isDragging ? 'opacity-80' : ''}`}
      onClick={onEdit} 
      {...attributes}
      {...listeners}
    >
      <div className="h-full cursor-pointer">
        <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
                 <p className="font-bold text-xs truncate">{group.name}</p>
                 <p className="text-xs opacity-80 truncate">{group.description}</p>
            </div>
             <div className="flex-shrink-0 flex items-center gap-1 pl-1">
                {booking.notes && <Icon name="document-text" className="w-3 h-3 text-white/70" title="Has notes"/>}
                {booking.recurringRuleId && <Icon name="arrow-path" className="w-3 h-3 text-white/70" title="Recurring session"/>}
                <Icon name="arrows-up-down-left-right" className="w-4 h-4 text-white/50 cursor-grab active:cursor-grabbing"/>
             </div>
        </div>
      </div>
      
      {booking.notes && (
          <div className="absolute bottom-full mb-2 w-full left-0 hidden group-hover:block z-20 p-2">
              <div className="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg max-w-xs break-words">
                  <h4 className="font-bold mb-1 border-b border-gray-600 pb-1">Session Notes</h4>
                  <p className="mt-1"><LinkifiedText text={booking.notes} /></p>
              </div>
          </div>
      )}

      <div
        onMouseDown={(e) => { e.stopPropagation(); onEdit(); }} // Simplified: open edit modal for resizing
        className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-end justify-center"
      >
        <div className="w-6 h-1 bg-white/50 rounded-full hover:bg-white transition-colors"></div>
      </div>
    </div>
  );
};

export default ResizableSessionCard;
