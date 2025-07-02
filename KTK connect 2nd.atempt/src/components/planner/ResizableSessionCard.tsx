import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Booking } from '../../types';
import { useClub } from '../../context/ClubContext';
import Icon from '../ui/Icon';
import { getGroupColorHex } from '../../utils/color';
import LinkifiedText from '../ui/LinkifiedText';

interface ResizableSessionCardProps {
  booking: Booking;
  positionAndHeight: { top: number, height: number };
  onEdit: () => void;
  onSelect: (e: React.MouseEvent) => void;
  isSelected: boolean;
  onDoubleClick: () => void;
}

const ResizableSessionCard: React.FC<ResizableSessionCardProps> = ({ booking, positionAndHeight, onEdit, onSelect, isSelected, onDoubleClick }) => {
  const { groups } = useClub();
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
    zIndex: isDragging ? 100 : (isSelected ? 20 : 10),
    backgroundColor: groupColor,
  };
  
  const selectionClasses = isSelected ? 'ring-2 ring-offset-2 ring-primary-600' : 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit();
    }
  };

  const startTime = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ariaLabel = `Session for ${group.name}, ${startTime} to ${endTime} on Court ${booking.courtId}. ${isSelected ? 'Selected.' : ''} Double-click or press Enter to edit.`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute rounded-lg p-2 text-white flex flex-col justify-between shadow-lg transition-all duration-100 group ${selectionClasses} ${isDragging ? 'opacity-80' : ''}`}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={ariaLabel}
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
             </div>
        </div>
      </div>
      
      {booking.notes && (
          <div className="absolute bottom-full mb-2 w-full left-0 hidden group-hover:block z-30 p-2">
              <div className="bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg max-w-xs break-words">
                  <h4 className="font-bold mb-1 border-b border-gray-600 pb-1">Session Notes</h4>
                  <p className="mt-1"><LinkifiedText text={booking.notes} /></p>
              </div>
          </div>
      )}

      {/* Resize Handle with larger touch area */}
      <div className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-end justify-center group/handle"
          onMouseDown={(e) => { 
            e.stopPropagation();
            // This is a simplified resize handle. A full implementation would use a separate draggable for resizing.
            // For now, we'll just trigger the edit modal.
            onDoubleClick();
           }}
      >
        <div className="w-6 h-1 bg-white/50 rounded-full group-hover/handle:bg-white transition-colors"></div>
      </div>
    </div>
  );
};

export default ResizableSessionCard;