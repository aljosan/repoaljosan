import React from 'react';
import { Coach } from '../types';

interface CoachProfileCardProps {
    coach: Coach;
    onSelectCoach: () => void;
}

const CoachProfileCard: React.FC<CoachProfileCardProps> = ({ coach, onSelectCoach }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl">
            <div className="flex-1 p-6">
                <div className="flex items-center space-x-5">
                    <img src={coach.avatarUrl} alt={coach.name} className="h-24 w-24 rounded-full object-cover border-4 border-slate-200" />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{coach.name}</h2>
                         <div className="mt-2 flex flex-wrap gap-2">
                            {coach.specialties.map(spec => (
                                <span key={spec} className="px-2 py-1 bg-club-primary/10 text-club-primary-dark text-xs font-semibold rounded-full">{spec}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-slate-600">{coach.bio}</p>
            </div>
            <div className="bg-slate-50 p-4">
                <button 
                    onClick={onSelectCoach}
                    className="w-full px-6 py-3 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-club-primary focus:ring-offset-2"
                >
                    View Availability & Book
                </button>
            </div>
        </div>
    );
};

export default CoachProfileCard;