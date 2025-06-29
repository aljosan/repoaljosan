import React from 'react';
import { Challenge, ChallengeStatus, Member } from '../types';
import MemberAvatar from './MemberAvatar';

interface ChallengeCardProps {
    challenge: Challenge;
    currentUser: Member;
    allMembers: Member[];
    onRespond: (challengeId: string, response: 'accept' | 'decline') => void;
    onReportClick: (challenge: Challenge) => void;
    isCompleted?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, currentUser, allMembers, onRespond, onReportClick, isCompleted }) => {
    const challenger = allMembers.find(m => m.id === challenge.challengerId);
    const challenged = allMembers.find(m => m.id === challenge.challengedId);
    if (!challenger || !challenged) return null;

    const isCurrentUserChallenger = currentUser.id === challenger.id;

    const renderActions = () => {
        if (challenge.status === ChallengeStatus.PENDING && !isCurrentUserChallenger) {
            return (
                <div className="flex space-x-2">
                    <button onClick={() => onRespond(challenge.id, 'accept')} className="px-4 py-1.5 bg-club-primary text-white text-xs font-semibold rounded-full hover:bg-club-primary-dark transition-colors">Accept</button>
                    <button onClick={() => onRespond(challenge.id, 'decline')} className="px-4 py-1.5 bg-slate-500 text-white text-xs font-semibold rounded-full hover:bg-slate-600 transition-colors">Decline</button>
                </div>
            );
        }
        if (challenge.status === ChallengeStatus.ACCEPTED) {
             return (
                <button onClick={() => onReportClick(challenge)} className="px-4 py-1.5 bg-club-accent text-white text-xs font-semibold rounded-full hover:bg-blue-500 transition-colors">Report Score</button>
            );
        }
        return null;
    };
    
    const statusPillColors: Record<ChallengeStatus, string> = {
        [ChallengeStatus.PENDING]: "bg-yellow-100 text-yellow-800",
        [ChallengeStatus.ACCEPTED]: "bg-blue-100 text-blue-800",
        [ChallengeStatus.COMPLETED]: "bg-green-100 text-green-800",
        [ChallengeStatus.DECLINED]: "bg-red-100 text-red-800",
    }
    
    return (
        <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between transition-all border border-slate-200">
            <div className="flex items-center space-x-4">
                <MemberAvatar member={challenger} />
                <div className="text-center">
                    <p className="font-bold text-slate-700">vs</p>
                    {challenge.status === ChallengeStatus.COMPLETED && challenge.score && (
                        <p className="text-xs text-slate-500 mt-1">{challenge.score}</p>
                    )}
                </div>
                <MemberAvatar member={challenged} />
                <div>
                    <p className="font-semibold text-slate-800">{challenger.name} vs {challenged.name}</p>
                    <p className="text-sm text-slate-500">Issued: {new Date(challenge.issuedDate).toLocaleDateString()}</p>
                     {challenge.status === ChallengeStatus.COMPLETED && challenge.winnerId && (
                        <p className="text-sm font-bold text-club-primary mt-1">Winner: {allMembers.find(m => m.id === challenge.winnerId)?.name}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusPillColors[challenge.status]}`}>
                    {challenge.status}
                </span>
                {!isCompleted && renderActions()}
            </div>
        </div>
    );
};

export default ChallengeCard;