import React, { useState, useMemo } from 'react';
import { Coach, LessonBooking, Member, Court, Booking, PaymentStatus, PaymentMethod } from '../types';
import LessonBookingModal from './LessonBookingModal';
import PaymentModal from './PaymentModal';

interface CoachBookingCalendarProps {
    coach: Coach;
    lessonBookings: LessonBooking[];
    addLessonBooking: (coachId: string, memberId: string, startTime: Date) => LessonBooking | null;
    onPayForLessonBooking: (lessonId: string, method: PaymentMethod) => boolean;
    currentUser: Member;
    courts: Court[];
    regularBookings: Booking[];
    members: Member[];
}

const CoachBookingCalendar: React.FC<CoachBookingCalendarProps> = ({ coach, lessonBookings, addLessonBooking, onPayForLessonBooking, currentUser, courts, regularBookings }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookingSlot, setBookingSlot] = useState<number | null>(null);
    const [lessonForPayment, setLessonForPayment] = useState<LessonBooking | null>(null);

    const dates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
        });
    }, []);

    const setDate = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        setSelectedDate(newDate);
    }

    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

    const handleConfirmBooking = () => {
        if (bookingSlot === null) return;
        const startTime = new Date(selectedDate);
        startTime.setHours(bookingSlot, 0, 0, 0);

        const newLesson = addLessonBooking(coach.id, currentUser.id, startTime);
        if (newLesson) {
            setLessonForPayment(newLesson);
        }
        setBookingSlot(null);
    }
    
    const handlePaymentConfirm = (method: PaymentMethod) => {
        if (!lessonForPayment) return;
        const success = onPayForLessonBooking(lessonForPayment.id, method);
        if (success) {
            setLessonForPayment(null);
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="text-center border-b border-slate-200 pb-6 mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Book a Lesson with {coach.name}</h2>
            </div>
            
            <div className="mb-6">
                 <h3 className="text-lg font-bold text-slate-800 mb-3">Select a Date</h3>
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

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Select a Time Slot</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {timeSlots.map(time => {
                        const slotTime = new Date(selectedDate);
                        slotTime.setHours(time, 0, 0, 0);

                        const coachIsBusy = lessonBookings.some(lb => lb.coachId === coach.id && lb.startTime.getTime() === slotTime.getTime());
                        
                        const occupiedCourtIds = new Set([
                            ...regularBookings.filter(b => b.startTime.getTime() === slotTime.getTime()).map(b => b.courtId),
                            ...lessonBookings.filter(lb => lb.startTime.getTime() === slotTime.getTime()).map(lb => lb.courtId)
                        ]);
                        const courtIsAvailable = courts.some(c => !occupiedCourtIds.has(c.id));
                        
                        const isAvailable = !coachIsBusy && courtIsAvailable;

                        if (!isAvailable) {
                             return (
                                <button key={time} disabled className="px-4 py-3 bg-slate-200 text-slate-500 rounded-md text-sm font-mono cursor-not-allowed">
                                    {time}:00
                                </button>
                            );
                        }

                        return (
                             <button 
                                key={time} 
                                onClick={() => setBookingSlot(time)}
                                className="px-4 py-3 bg-club-accent/20 text-blue-800 font-semibold rounded-md text-sm font-mono hover:bg-club-accent/40 transition-colors"
                            >
                                {time}:00
                            </button>
                        )
                    })}
                </div>
            </div>
            {bookingSlot !== null && (
                <LessonBookingModal
                    coach={coach}
                    time={bookingSlot}
                    date={selectedDate}
                    onConfirm={handleConfirmBooking}
                    onClose={() => setBookingSlot(null)}
                />
            )}
            {lessonForPayment && (
                 <PaymentModal
                    item={{
                        type: 'Private Lesson',
                        name: `with ${coach.name}`,
                        price: lessonForPayment.price,
                    }}
                    currentUser={currentUser}
                    onConfirm={handlePaymentConfirm}
                    onClose={() => setLessonForPayment(null)}
                />
            )}
        </div>
    );
};

export default CoachBookingCalendar;