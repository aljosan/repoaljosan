import React, { useState } from 'react';
import { Coach, LessonBooking, Member, Court, Booking, PaymentMethod } from '../types';
import CoachProfileCard from './CoachProfileCard';
import CoachBookingCalendar from './CoachBookingCalendar';

interface LessonsViewProps {
    coaches: Coach[];
    lessonBookings: LessonBooking[];
    addLessonBooking: (coachId: string, memberId: string, startTime: Date) => LessonBooking | null;
    onPayForLessonBooking: (lessonId: string, method: PaymentMethod) => boolean;
    currentUser: Member | null;
    courts: Court[];
    regularBookings: Booking[];
    members: Member[];
}

const LessonsView: React.FC<LessonsViewProps> = (props) => {
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

    if (selectedCoach) {
        return (
            <div>
                 <button onClick={() => setSelectedCoach(null)} className="mb-6 text-sm font-semibold text-club-primary hover:text-club-primary-dark flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to All Coaches
                </button>
                <CoachBookingCalendar 
                    coach={selectedCoach}
                    {...props}
                />
            </div>
        )
    }

    return (
        <div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Book a Private Lesson</h1>
                <p className="mt-2 text-slate-600">Browse our certified coaches and book a time that works for you.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {props.coaches.map(coach => (
                    <CoachProfileCard 
                        key={coach.id}
                        coach={coach}
                        onSelectCoach={() => setSelectedCoach(coach)}
                    />
                ))}
            </div>
        </div>
    );
};

export default LessonsView;