import React from 'react';
import { useClub } from '../../context/ClubContext';
import { INDOOR_COURTS, OUTDOOR_COURTS, BOOKING_START_HOUR, BOOKING_END_HOUR } from '../../constants';
import { User, Booking, Group, BlockedSlot } from '../../types';
import Icon from '../ui/Icon';

interface BookingGridProps {
  selectedDate: Date;
  onSlotClick: (courtId: number, startTime: Date) => void;
}

const BookingGrid: React.FC<BookingGridProps> = ({ selectedDate, onSlotClick }) => {
  const { allBookings, users, groups, blockedSlots } = useClub();
  
  // Explicitly generate all hours from 6:00 up to 24:00.
  const hours: number[] = [];
  for (let hour = BOOKING_START_HOUR; hour < BOOKING_END_HOUR; hour++) {
      hours.push(hour);
  }

  const getBookingForSlot = (courtId: number, startTime: Date): Booking | undefined => {
    return allBookings.find(b =>
      b.courtId === courtId &&
      new Date(b.startTime).getTime() === startTime.getTime()
    );
  };

  const getBlockedSlot = (courtId: number, startTime: Date): BlockedSlot | undefined => {
      return blockedSlots.find(s =>
        s.courtId === courtId &&
        startTime.getTime() >= new Date(s.startTime).getTime() &&
        startTime.getTime() < new Date(s.endTime).getTime()
      );
  };
  
  const CourtGroup: React.FC<{title: string; courts: number[], icon: 'home' | 'sun'}> = ({title, courts, icon}) => (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 px-2">
            <Icon name={icon} className="w-6 h-6 text-gray-600"/>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="grid gap-px bg-gray-200" style={{ gridTemplateColumns: `4rem repeat(${courts.length}, minmax(0, 1fr))` }}>
            {/* Header Row */}
            <div className="bg-gray-100 p-2"></div>
            {courts.map(courtId => (
            <div key={courtId} className="bg-gray-100 text-center font-semibold p-2 text-sm">
                Court {courtId}
            </div>
            ))}

            {/* Time Slot Rows */}
            {hours.map(hour => {
                const slotStartTime = new Date(selectedDate);
                slotStartTime.setHours(hour, 0, 0, 0);

                return (
                    <React.Fragment key={hour}>
                    <div className="bg-gray-100 p-2 text-xs text-right font-semibold text-gray-500 h-16 flex items-center justify-end">
                        {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                    {courts.map(courtId => {
                        const booking = getBookingForSlot(courtId, slotStartTime);
                        const blockedSlot = getBlockedSlot(courtId, slotStartTime);
                        const booker = booking?.userId ? users.find(u => u.id === booking.userId) : null;
                        const groupBooking = booking?.groupId ? groups.find(g => g.id === booking.groupId) : null;
                        const isPast = slotStartTime < new Date();
                        
                        let content: React.ReactNode;
                        if (blockedSlot) {
                            content = (
                                <div className="w-full h-full bg-gray-200 text-gray-600 rounded p-1 text-center text-[10px] sm:text-xs flex flex-col justify-center items-center" title={blockedSlot.reason}>
                                    <Icon name="lock-closed" className="w-4 h-4 mb-1"/>
                                    <span className="font-bold">Unavailable</span>
                                </div>
                            );
                        } else if (booking) {
                            content = groupBooking ? (
                                <div className="w-full h-full bg-indigo-100 text-indigo-800 rounded p-1 text-center text-[10px] sm:text-xs flex flex-col justify-center items-center">
                                    <span className="font-bold">Group Session</span>
                                    <span className="truncate">{groupBooking.name}</span>
                                </div>
                            ) : booker ? (
                                <div className="w-full h-full bg-red-100 text-red-800 rounded p-1 text-center text-[10px] sm:text-xs flex flex-col justify-center items-center">
                                    <span className="font-bold">Booked</span>
                                    <span className="truncate">by {booker.name}</span>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-200 rounded"></div>
                            );
                        } else if (isPast) {
                            content = <div className="w-full h-full bg-gray-100 rounded"></div>;
                        } else {
                            content = (
                                <button
                                    onClick={() => onSlotClick(courtId, slotStartTime)}
                                    className="w-full h-full bg-green-100 hover:bg-green-300 transition-colors rounded text-green-800 text-sm font-semibold flex items-center justify-center"
                                    aria-label={`Book court ${courtId} at ${hour}:00`}
                                >
                                    <span className="hidden sm:inline">Book</span>
                                    <span className="sm:hidden text-lg">+</span>
                                </button>
                            );
                        }
                        
                        return (
                            <div key={courtId} className="bg-white p-1 flex items-center justify-center">
                                {content}
                            </div>
                        );
                    })}
                    </React.Fragment>
                );
            })}
        </div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
        <CourtGroup title="Indoor Courts" courts={INDOOR_COURTS} icon="home"/>
        <CourtGroup title="Outdoor Courts" courts={OUTDOOR_COURTS} icon="sun"/>
    </div>
  );
};

export default BookingGrid;