import React from 'react';
import { Coach } from '../types';

interface LessonBookingModalProps {
    coach: Coach;
    time: number;
    date: Date;
    onConfirm: () => void;
    onClose: () => void;
}

const LessonBookingModal: React.FC<LessonBookingModalProps> = ({ coach, time, date, onConfirm, onClose }) => {
    const formatDate = (d: Date) => {
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
            aria-labelledby="lesson-booking-modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="lesson-booking-modal-title" className="text-2xl font-bold text-slate-800">Confirm Your Lesson</h2>
                
                <div className="mt-6 space-y-4 text-slate-700">
                    <div className="flex items-center p-3 bg-slate-100 rounded-lg">
                        <span className="font-semibold w-20">Coach:</span>
                        <div className="flex items-center">
                            <img src={coach.avatarUrl} alt={coach.name} className="h-8 w-8 rounded-full mr-2"/>
                            <span>{coach.name}</span>
                        </div>
                    </div>
                     <div className="flex items-center p-3 bg-slate-100 rounded-lg">
                        <span className="font-semibold w-20">Date:</span>
                        <span>{formatDate(date)}</span>
                    </div>
                     <div className="flex items-center p-3 bg-slate-100 rounded-lg">
                        <span className="font-semibold w-20">Time:</span>
                        <span>{time}:00 - {time + 1}:00</span>
                    </div>
                    <div className="text-center pt-2 text-sm text-slate-500">
                        <p>A court will be automatically assigned for your lesson.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-5 py-2 bg-club-primary text-white rounded-md font-semibold hover:bg-club-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-club-primary focus:ring-offset-2"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                    from {
                        opacity: 0;
                        transform: scale(.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default LessonBookingModal;