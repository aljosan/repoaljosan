import React, { useState } from 'react';
import BookingGrid from '../booking/BookingGrid';
import { useClub } from '../../context/ClubContext';
import BookingModal from '../booking/BookingModal';
import { Booking } from '../../types';
import MyBookingsList from '../booking/MyBookingsList';
import Icon from '../ui/Icon';

type BookingViewTab = 'book' | 'manage';

const CourtBooking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingViewTab>('book');
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: number; startTime: Date } | null>(null);
  const { addBooking, currentUser } = useClub();

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0,0,0,0);
    return date;
  });

  const handleSlotClick = (courtId: number, startTime: Date) => {
    setSelectedSlot({ courtId, startTime });
    setIsModalOpen(true);
  };
  
  const handleConfirmBooking = (bookingDetails: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card'): { success: boolean, message: string } => {
     const result = addBooking(bookingDetails, paymentMethod);
     if(result.success) {
        // The modal will handle closing itself on success state.
     }
     return result;
  };

  const TabButton: React.FC<{tab: BookingViewTab, label: string, icon: 'court' | 'list-bullet'}> = ({tab, label, icon}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
            activeTab === tab 
            ? 'text-primary-600 border-primary-600' 
            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon name={icon} className="w-5 h-5" />
        {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Court Booking</h1>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton tab="book" label="Book a Court" icon="court" />
            <TabButton tab="manage" label="My Upcoming Bookings" icon="list-bullet" />
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'book' && (
             <div className="bg-white rounded-lg shadow-md p-2 sm:p-4">
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    {dates.map(date => (
                        <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 w-24 text-center py-3 text-sm font-semibold transition-colors ${
                            date.toDateString() === selectedDate.toDateString()
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        >
                        <span className="block">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="block text-2xl">{date.getDate()}</span>
                        </button>
                    ))}
                </div>
                <BookingGrid selectedDate={selectedDate} onSlotClick={handleSlotClick} />
            </div>
        )}
        {activeTab === 'manage' && (
            <MyBookingsList />
        )}
      </div>

      {selectedSlot && (
        <BookingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            slot={selectedSlot}
            onConfirmBooking={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default CourtBooking;