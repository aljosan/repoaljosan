import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import { Booking } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

const MyBookingsList: React.FC = () => {
    const { currentUser, allBookings, cancelBooking } = useClub();
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

    const myUpcomingBookings = allBookings.filter(b => 
        b.userId === currentUser.id && new Date(b.startTime) > new Date()
    ).sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    const handleCancelClick = (booking: Booking) => {
        setBookingToCancel(booking);
    };

    const handleConfirmCancel = () => {
        if (bookingToCancel) {
            cancelBooking(bookingToCancel.id);
            setBookingToCancel(null);
        }
    };

    const handleRecurringCancel = (scope: 'single' | 'series') => {
        if (bookingToCancel) {
            cancelBooking(bookingToCancel.id, { scope });
            setBookingToCancel(null);
        }
    };

    if (myUpcomingBookings.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <Icon name="calendar" className="w-12 h-12 mx-auto text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Upcoming Bookings</h3>
                <p className="mt-1 text-sm text-gray-500">You have not booked any courts yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            <ul role="list" className="divide-y divide-gray-200">
                {myUpcomingBookings.map((booking) => (
                    <li key={booking.id} className="flex items-center justify-between gap-x-6 p-4 hover:bg-gray-50">
                        <div className="flex min-w-0 gap-x-4">
                             <Icon name={booking.courtType === 'Indoor' ? 'home' : 'sun'} className="h-8 w-8 text-gray-500 mt-1" />
                             <div className="min-w-0 flex-auto">
                                <p className="text-sm font-semibold leading-6 text-gray-900">
                                    Court {booking.courtId} ({booking.courtType})
                                </p>
                                <p className="mt-1 flex text-xs leading-5 text-gray-500">
                                    {new Date(booking.startTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long'})}, {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                        </div>
                        <Button variant="danger" onClick={() => handleCancelClick(booking)}>
                            <Icon name="trash" className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Cancel</span>
                        </Button>
                    </li>
                ))}
            </ul>
             {bookingToCancel && (
                <Modal
                    isOpen={!!bookingToCancel}
                    onClose={() => setBookingToCancel(null)}
                    title={bookingToCancel.recurringRuleId ? 'Cancel Recurring Booking' : 'Confirm Cancellation'}
                >
                    <p className="text-gray-700">
                        Are you sure you want to cancel your booking for <strong>Court {bookingToCancel.courtId}</strong> on{' '}
                        {new Date(bookingToCancel.startTime).toLocaleDateString()} at{' '}
                        {new Date(bookingToCancel.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}?
                    </p>
                    {!bookingToCancel.recurringRuleId && (
                        <p className="mt-2 text-sm text-green-600">Your credits ({bookingToCancel.cost}) will be refunded to your account.</p>
                    )}
                    {bookingToCancel.recurringRuleId && (
                        <p className="mt-2 text-sm text-gray-500">Choose whether to cancel this occurrence or the entire series.</p>
                    )}
                    <div className="flex flex-wrap justify-end gap-3 pt-4 mt-4">
                        <Button variant="secondary" onClick={() => setBookingToCancel(null)}>Keep Booking</Button>
                        {bookingToCancel.recurringRuleId ? (
                            <>
                                <Button variant="secondary" onClick={() => handleRecurringCancel('single')}>This Occurrence Only</Button>
                                <Button variant="danger" onClick={() => handleRecurringCancel('series')}>Entire Series</Button>
                            </>
                        ) : (
                            <Button variant="danger" onClick={handleConfirmCancel}>Confirm Cancellation</Button>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MyBookingsList;
