import React, { useState, useMemo } from 'react';
import { Court, Booking, Member, CourtType, LessonBooking, PaymentStatus, PaymentMethod } from '../types';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';

interface CourtBookingProps {
    courts: Court[];
    bookings: Booking[];
    lessonBookings: LessonBooking[];
    members: Member[];
    currentUser: Member | null;
    onBookCourt: (courtId: string, memberId: string, startTime: Date) => Booking | null;
    onPayForBooking: (bookingId: string, method: PaymentMethod) => boolean;
}

const TimeSlotGrid: React.FC<{
    courts: Court[];
    bookings: Booking[];
    lessonBookings: LessonBooking[];
    members: Member[];
    currentUser: Member | null;
    selectedDate: Date;
    onSlotClick: (court: Court, time: number) => void;
    onPayClick: (booking: Booking) => void;
}> = ({ courts, bookings, lessonBookings, members, currentUser, selectedDate, onSlotClick, onPayClick }) => {
    
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

    return (
        <div className="overflow-x-auto">
            <div className="grid gap-px bg-slate-200" style={{ gridTemplateColumns: `auto repeat(${courts.length}, minmax(100px, 1fr))` }}>
                <div className="sticky left-0 bg-slate-100 p-2 z-10"></div>
                {courts.map(court => (
                    <div key={court.id} className="p-2 text-center font-semibold text-slate-700 bg-slate-100 truncate">
                        {court.name}
                    </div>
                ))}

                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div className="sticky left-0 p-2 text-sm text-right font-mono text-slate-600 bg-slate-100 z-10">
                            {time}:00
                        </div>
                        {courts.map(court => {
                            const slotTime = new Date(selectedDate);
                            slotTime.setHours(time, 0, 0, 0);

                            const booking = bookings.find(b => b.courtId === court.id && b.startTime.getTime() === slotTime.getTime());
                            const lessonBooking = lessonBookings.find(lb => lb.courtId === court.id && lb.startTime.getTime() === slotTime.getTime());

                            if (booking) {
                                const member = members.find(m => m.id === booking.memberId);
                                const isCurrentUserBooking = currentUser ? booking.memberId === currentUser.id : false;

                                if (isCurrentUserBooking && booking.paymentStatus === PaymentStatus.UNPAID) {
                                     return (
                                        <div key={court.id} className="p-1 bg-white">
                                            <button onClick={() => onPayClick(booking)} className="w-full h-full p-1 text-xs text-center text-white truncate bg-yellow-500 hover:bg-yellow-600 transition-colors rounded-sm">
                                                <p className="font-semibold">Pay Now</p>
                                                <p>{booking.price} NOK</p>
                                            </button>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={court.id} className={`p-2 text-xs text-center text-white truncate ${isCurrentUserBooking ? 'bg-club-primary' : 'bg-slate-400'}`}>
                                        <p className="font-semibold">{member ? member.name : "Booked"}</p>
                                    </div>
                                );
                            } else if (lessonBooking) {
                                return (
                                     <div key={court.id} className="p-2 text-xs text-center text-white truncate bg-orange-500">
                                        <p className="font-semibold">Private Lesson</p>
                                    </div>
                                );
                            }
                            else {
                                return (
                                    <div key={court.id} className="bg-white p-0.5">
                                        <button 
                                            onClick={() => onSlotClick(court, time)}
                                            className="w-full h-full bg-club-accent/10 hover:bg-club-accent/30 transition-colors duration-150"
                                            aria-label={`Book ${court.name} at ${time}:00`}
                                        ></button>
                                    </div>
                                );
                            }
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const CourtBooking: React.FC<CourtBookingProps> = ({ courts, bookings, lessonBookings, members, currentUser, onBookCourt, onPayForBooking }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookingSlot, setBookingSlot] = useState<{ court: Court; time: number } | null>(null);
    const [bookingForPayment, setBookingForPayment] = useState<Booking | null>(null);

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
        });
    }, []);

    const indoorCourts = courts.filter(c => c.type === CourtType.INDOOR);
    const outdoorCourts = courts.filter(c => c.type === CourtType.OUTDOOR);
    
    const setDate = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0,0,0,0);
        setSelectedDate(newDate);
    }
    
    const handleSlotClick = (court: Court, time: number) => {
        setBookingSlot({ court, time });
    };

    const handleConfirmBooking = () => {
        if (!bookingSlot) return;
        const { court, time } = bookingSlot;
        const startTime = new Date(selectedDate);
        startTime.setHours(time, 0, 0, 0);
        
        if (!currentUser) return;
        const newBooking = onBookCourt(court.id, currentUser!.id, startTime);
        if (newBooking) {
            setBookingForPayment(newBooking);
        }
        setBookingSlot(null);
    };

    const handlePaymentConfirm = (method: PaymentMethod) => {
        if (!bookingForPayment) return;
        const success = onPayForBooking(bookingForPayment.id, method);
        if(success) {
            setBookingForPayment(null);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Select a Date</h2>
                 <div className="flex space-x-2 overflow-x-auto pb-2">
                    {dates.map(date => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => setDate(date)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${isSelected ? 'bg-club-primary text-white shadow' : 'bg-slate-200 hover:bg-slate-300'}`}
                            >
                                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </button>
                        )
                    })}
                 </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg">
                 <div className="p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Indoor Courts</h2>
                 </div>
                 <div className="p-4">
                    <TimeSlotGrid courts={indoorCourts} {...{bookings, lessonBookings, members, currentUser, selectedDate}} onSlotClick={handleSlotClick} onPayClick={setBookingForPayment} />
                 </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg">
                 <div className="p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Outdoor Courts</h2>
                 </div>
                 <div className="p-4">
                    <TimeSlotGrid courts={outdoorCourts} {...{bookings, lessonBookings, members, currentUser, selectedDate}} onSlotClick={handleSlotClick} onPayClick={setBookingForPayment} />
                 </div>
            </div>

            {bookingSlot && (
                <BookingModal 
                    court={bookingSlot.court}
                    time={bookingSlot.time}
                    date={selectedDate}
                    onConfirm={handleConfirmBooking}
                    onClose={() => setBookingSlot(null)}
                />
            )}

            {bookingForPayment && (
                 <PaymentModal
                    item={{
                        type: 'Court Booking',
                        name: courts.find(c => c.id === bookingForPayment.courtId)?.name || 'Unknown Court',
                        price: bookingForPayment.price,
                    }}
                    currentUser={currentUser}
                    onConfirm={handlePaymentConfirm}
                    onClose={() => setBookingForPayment(null)}
                />
            )}
        </div>
    );
};

export default CourtBooking;