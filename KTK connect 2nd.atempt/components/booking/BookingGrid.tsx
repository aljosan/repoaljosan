import React from 'react';
import { useBookings, useGroups, useMembers } from '../../context/ClubContext';
import { INDOOR_COURTS, OUTDOOR_COURTS, BOOKING_START_HOUR, BOOKING_END_HOUR } from '../../constants';
import { User, Booking, Group, BlockedSlot } from '../../types';
import Icon from '../ui/Icon';

interface BookingGridProps {
  selectedDate: Date;
  onSlotClick: (courtId: number, startTime: Date) => void;
}

const BookingGrid: React.FC<BookingGridProps> = ({ selectedDate, onSlotClick }) => {
  const { allBookings, blockedSlots } = useBookings();
  const { users } = useMembers();
  const { groups } = useGroups();
  
  const SLOT_DURATION_MINUTES = 30;
  const slotStartTimes: Date[] = [];
  for (let minutes = BOOKING_START_HOUR * 60; minutes < BOOKING_END_HOUR * 60; minutes += SLOT_DURATION_MINUTES) {
    const slotStartTime = new Date(selectedDate);
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slotStartTime.setHours(hour, minute, 0, 0);
    slotStartTimes.push(slotStartTime);
  }

  const getBookingForSlot = (courtId: number, startTime: Date): Booking | undefined => {
    const slotTime = startTime.getTime();
    return allBookings.find(b =>
      b.courtId === courtId &&
      new Date(b.startTime).getTime() <= slotTime &&
      new Date(b.endTime).getTime() > slotTime
    );
  };

  const getBlockedSlot = (courtId: number, startTime: Date): BlockedSlot | undefined => {
    const slotTime = startTime.getTime();
    return blockedSlots.find(s =>
      s.courtId === courtId &&
      slotTime >= new Date(s.startTime).getTime() &&
      slotTime < new Date(s.endTime).getTime()
    );
  };
  
  const CourtGroup: React.FC<{title: string; courts: number[], icon: 'home' | 'sun'}> = ({title, courts, icon}) => (
    <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 px-2">
            <Icon name={icon} className="w-6 h-6 text-gray-600"/>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div
          className="grid gap-px bg-gray-200"
          style={{ gridTemplateColumns: `4rem repeat(${courts.length}, minmax(0, 1fr))`, gridAutoRows: '3rem' }}
        >
            {/* Header Row */}
            <div className="bg-gray-100 p-2" style={{ gridColumn: 1, gridRow: 1 }}></div>
            {courts.map((courtId, index) => (
              <div
                key={courtId}
                className="bg-gray-100 text-center font-semibold p-2 text-sm"
                style={{ gridColumn: index + 2, gridRow: 1 }}
              >
                  Court {courtId}
              </div>
            ))}

            {/* Time Labels */}
            {slotStartTimes.map((slotStartTime, index) => (
              <div
                key={`time-${slotStartTime.getTime()}`}
                className="bg-gray-100 p-2 text-[10px] sm:text-xs text-right font-semibold text-gray-500 flex items-center justify-end"
                style={{ gridColumn: 1, gridRow: index + 2 }}
              >
                {slotStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            ))}

            {/* Slot Cells */}
            {courts.map((courtId, courtIndex) => {
              const occupiedSlots = new Set<number>();

              return slotStartTimes.map((slotStartTime, index) => {
                if (occupiedSlots.has(index)) {
                  return null;
                }

                const booking = getBookingForSlot(courtId, slotStartTime);
                const blockedSlot = getBlockedSlot(courtId, slotStartTime);
                const booker = booking?.userId ? users.find(u => u.id === booking.userId) : null;
                const groupBooking = booking?.groupId ? groups.find(g => g.id === booking.groupId) : null;
                const isPast = slotStartTime < new Date();
                const gridRow = index + 2;
                const gridColumn = courtIndex + 2;

                const setOccupiedSlots = (endTime: Date) => {
                  const durationMinutes = (endTime.getTime() - slotStartTime.getTime()) / (1000 * 60);
                  const span = Math.max(1, Math.ceil(durationMinutes / SLOT_DURATION_MINUTES));
                  for (let offset = 1; offset < span; offset += 1) {
                    occupiedSlots.add(index + offset);
                  }
                  return span;
                };

                let content: React.ReactNode;
                let rowSpan = 1;

                if (blockedSlot) {
                  rowSpan = setOccupiedSlots(new Date(blockedSlot.endTime));
                  content = (
                    <div className="w-full h-full bg-gray-200 text-gray-600 rounded p-1 text-center text-[10px] sm:text-xs flex flex-col justify-center items-center" title={blockedSlot.reason}>
                        <Icon name="lock-closed" className="w-4 h-4 mb-1"/>
                        <span className="font-bold">Unavailable</span>
                    </div>
                  );
                } else if (booking) {
                  rowSpan = setOccupiedSlots(new Date(booking.endTime));
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
                        aria-label={`Book court ${courtId} at ${slotStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                        <span className="hidden sm:inline">Book</span>
                        <span className="sm:hidden text-lg">+</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={`${courtId}-${slotStartTime.getTime()}`}
                    className="bg-white p-1 flex items-center justify-center h-full"
                    style={{ gridColumn, gridRow: `${gridRow} / span ${rowSpan}` }}
                  >
                    {content}
                  </div>
                );
              });
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
