import React from 'react';
import { Booking, BlockedSlot } from '../../types';
import { useClub } from '../../context/ClubContext';
import { getGroupColorHex } from '../../utils/color';
import Icon from '../ui/Icon';

interface PlannerWeekGridProps {
    startDate: Date;
    bookings: Booking[];
    blockedSlots: BlockedSlot[];
}

const PlannerWeekGrid: React.FC<PlannerWeekGridProps> = ({ startDate, bookings, blockedSlots }) => {
    const { groups } = useClub();
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date;
    });

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-7 divide-x divide-gray-200 min-w-[800px]">
                {days.map(day => {
                    const dayBookings = bookings
                        .filter(b => new Date(b.startTime).toDateString() === day.toDateString())
                        .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                    
                    const dayBlocked = blockedSlots
                        .filter(s => new Date(s.startTime).toDateString() === day.toDateString())
                        .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                    
                    const allEvents = [...dayBookings, ...dayBlocked].sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    return (
                        <div key={day.toISOString()} className="flex flex-col">
                            <div className="p-3 bg-gray-50 text-center border-b">
                                <p className="font-semibold text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                <p className="text-2xl font-bold">{day.getDate()}</p>
                            </div>
                            <div className="flex-1 p-2 space-y-2 bg-white">
                                {allEvents.length > 0 ? allEvents.map(event => {
                                    if ('reason' in event) { // It's a BlockedSlot
                                        return (
                                             <div key={event.id} className="p-2 rounded-lg bg-gray-200 text-gray-700">
                                                <p className="text-xs font-bold truncate flex items-center gap-1"><Icon name="lock-closed" className="w-3 h-3"/> {event.reason}</p>
                                                <p className="text-[10px]">
                                                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                 <p className="text-[10px]">Court {event.courtId}</p>
                                            </div>
                                        );
                                    } else { // It's a Booking
                                        const group = groups.find(g => g.id === event.groupId);
                                        if (!group) return null;
                                        const color = getGroupColorHex(group.id);
                                        return (
                                            <div key={event.id} className="p-2 rounded-lg text-white" style={{ backgroundColor: color }}>
                                                <div className="flex justify-between items-start">
                                                    <p className="text-xs font-bold truncate flex-1">{group.name}</p>
                                                    {event.notes && <Icon name="document-text" className="w-3 h-3 text-white/70 flex-shrink-0"/>}
                                                </div>
                                                <p className="text-[10px] opacity-90">
                                                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-[10px] opacity-90">Court {event.courtId}</p>
                                            </div>
                                        );
                                    }
                                }) : (
                                    <div className="text-center text-xs text-gray-400 py-4">No sessions</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlannerWeekGrid;