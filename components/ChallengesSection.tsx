import React from 'react';
import { Challenge, ChallengeStatus, Member } from '../types';
import ChallengeCard from './ChallengeCard';

interface ChallengesSectionProps {
    challenges: Challenge[];
    currentUser: Member | null;
    allMembers: Member[];
    onRespond: (challengeId: string, response: 'accept' | 'decline') => void;
    onReportClick: (challenge: Challenge) => void;
}

const ChallengesSection: React.FC<ChallengesSectionProps> = (props) => {
    const { challenges, currentUser, ...rest } = props;

    const incoming = currentUser ? challenges.filter(c => c.challengedId === currentUser.id && c.status === ChallengeStatus.PENDING) : [];
    const outgoing = currentUser ? challenges.filter(c => c.challengerId === currentUser.id && c.status === ChallengeStatus.PENDING) : [];
    const active = currentUser ? challenges.filter(c => c.status === ChallengeStatus.ACCEPTED && (c.challengerId === currentUser.id || c.challengedId === currentUser.id)) : [];
    const completed = challenges.filter(c => c.status === ChallengeStatus.COMPLETED || c.status === ChallengeStatus.DECLINED);

    return (
        <div className="space-y-8">
            { (incoming.length > 0 || outgoing.length > 0 || active.length > 0) ? (
              <>
                <ChallengeCategory title="Incoming Challenges" challenges={incoming} currentUser={currentUser} {...rest} />
                <ChallengeCategory title="Outgoing Challenges" challenges={outgoing} currentUser={currentUser} {...rest} />
                <ChallengeCategory title="Active Matches" challenges={active} currentUser={currentUser} {...rest} />
              </>
            ) : <p className="text-center text-slate-500">You have no pending or active challenges. Go to the rankings and challenge someone!</p> }
            
            <ChallengeCategory title="Completed Matches" challenges={completed} currentUser={currentUser} {...rest} isCompleted/>

        </div>
    );
};

const ChallengeCategory: React.FC<{ title: string; challenges: Challenge[]; isCompleted?: boolean; } & Omit<ChallengesSectionProps, 'challenges'>> = ({ title, challenges, ...props }) => {
    if (challenges.length === 0) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="space-y-4">
                {challenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} {...props} />
                ))}
            </div>
        </div>
    );
};

export default ChallengesSection;