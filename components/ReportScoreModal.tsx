import React, { useState } from 'react';
import { Challenge, Member } from '../types';

interface ReportScoreModalProps {
    challenge: Challenge;
    allMembers: Member[];
    onClose: () => void;
    onSubmit: (challengeId: string, winnerId: string, score: string) => void;
}

const ReportScoreModal: React.FC<ReportScoreModalProps> = ({ challenge, allMembers, onClose, onSubmit }) => {
    const [winnerId, setWinnerId] = useState<string>('');
    const [score, setScore] = useState('');

    const challenger = allMembers.find(m => m.id === challenge.challengerId);
    const challenged = allMembers.find(m => m.id === challenge.challengedId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!winnerId || !score.trim()) {
            alert("Please select a winner and enter the score.");
            return;
        }
        onSubmit(challenge.id, winnerId, score);
    };
    
    if (!challenger || !challenged) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800">Report Match Score</h2>
                <p className="text-slate-600 mt-1">For match: {challenger.name} vs {challenged.name}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="winner" className="block text-sm font-medium text-slate-700">Winner</label>
                        <select
                            id="winner"
                            value={winnerId}
                            onChange={(e) => setWinnerId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Select winner...</option>
                            <option value={challenger.id}>{challenger.name}</option>
                            <option value={challenged.id}>{challenged.name}</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="score" className="block text-sm font-medium text-slate-700">Score</label>
                        <input
                            type="text"
                            id="score"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="e.g., 6-4, 6-3"
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-club-primary text-white rounded-md font-semibold hover:bg-club-primary-dark transition-colors">Submit Score</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportScoreModal;