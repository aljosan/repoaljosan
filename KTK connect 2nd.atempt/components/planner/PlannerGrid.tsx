import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ALL_COURTS, BOOKING_START_HOUR, BOOKING_END_HOUR } from '../../constants';
import { Booking, BlockedSlot, ConflictCheckResult } from '../../types';
import Icon from '../ui/Icon';
import ResizableSessionCard from './ResizableSessionCard';

interface PlannerGridProps {
  selectedDate: Date;
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
  onEditSession: (booking: Booking) => void;
  potentialConflicts: Map<string, ConflictCheckResult>;
}

const SLOT_HEIGHT_PX = 40; // Corresponds to h-10 in Tailwind for a 30-min slot
const TOTAL_SLOTS = (BOOKING_END_HOUR - BOOKING_START_HOUR) * 2;

const PlannerGrid: React.FC<PlannerGridProps> = ({ selectedDate, bookings, blockedSlots, onEditSession, potentialConflicts }) => {
  const timeSlots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const time = new Date(selectedDate);
    time.setHours(BOOKING_START_HOUR, 0, 0, 0);
    time.setMinutes(i * 30);
    return time;
  });

  const getPositionAndHeight = (startTimeStr: string, endTimeStr: string) => {
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);
    const startMinutes = (startTime.getHours() - BOOKING_START_HOUR) * 60 + startTime.getMinutes();
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const top = (startMinutes / 30) * SLOT_HEIGHT_PX;
    const height = (durationMinutes / 30) * SLOT_HEIGHT_PX;
    return { top, height };
  };

  const CourtColumn: React.FC<{ courtId: number }> = ({ courtId }) => {
    const courtBookings = bookings.filter(b => b.courtId === courtId);
    const courtBlockedSlots = blockedSlots.filter(s => s.courtId === courtId);

    return (
      <div className="relative border-l border-gray-200">
        {timeSlots.map((time, index) => {
          const droppableId = `droppable-${courtId}-${time.getTime()}`;
          const conflict = potentialConflicts.get(droppableId);
          const { setNodeRef, isOver } = useDroppable({
            id: droppableId,
            data: { courtId, startTime: time }
          });

          let slotClass = 'border-t border-dashed border-gray-200 transition-colors';
          if (isOver) {
            slotClass += ' bg-green-100';
          } else if (conflict?.reason === 'coach') {
            slotClass += ' bg-yellow-200 border-yellow-400';
          }

          return (
            <div 
              key={index} 
              ref={setNodeRef} 
              className={`h-10 ${slotClass}`}
              title={conflict?.message}
            />
          );
        })}

        {courtBookings.map(booking => (
          <ResizableSessionCard 
            key={booking.id}
            booking={booking}
            positionAndHeight={getPositionAndHeight(booking.startTime.toString(), booking.endTime.toString())}
            onEdit={() => onEditSession(booking)}
          />
        ))}

        {courtBlockedSlots.map(slot => {
            const { top, height } = getPositionAndHeight(slot.startTime.toString(), slot.endTime.toString());
            return (
                <div
                    key={slot.id}
                    style={{ top: `${top}px`, height: `${height}px`, left: '2px', right: '2px' }}
                    className="absolute rounded-lg p-2 text-white flex flex-col justify-center items-center text-center bg-gray-400 z-10"
                >
                    <Icon name="lock-closed" className="w-5 h-5 mb-1" />
                    <p className="font-bold text-xs truncate">{slot.reason}</p>
                </div>
            );
        })}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex">
        <div className="w-16 flex-shrink-0">
          <div className="h-12"></div>
          {timeSlots.map((time, i) =>
            i % 2 === 0 ? (
              <div key={i} className="h-20 text-right pr-2 text-xs font-semibold text-gray-500 flex items-start justify-end pt-1 -mt-2">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
            ) : null
          )}
        </div>

        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${ALL_COURTS.length}, minmax(120px, 1fr))`}}>
           <div className="col-span-full grid" style={{ gridTemplateColumns: 'subgrid' }}>
             {ALL_COURTS.map(id => <div key={id} className="h-12 text-center font-semibold p-2 border-b-2 border-l border-gray-200">Court {id}</div>)}
           </div>
           {ALL_COURTS.map(id => <CourtColumn key={id} courtId={id} />)}
        </div>
      </div>
    </div>
  );
};

export default PlannerGrid;