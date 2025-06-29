import React, { useState } from 'react';
import { LadderPlayer, Member, Challenge, ChallengeStatus } from '../types';
import LadderRankingList from './LadderRankingList';
import ChallengesSection from './ChallengesSection';
import ReportScoreModal from './ReportScoreModal';

interface LadderViewProps {
    ladderPlayers: LadderPlayer[];
    allMembers: Member[];
    challenges: Challenge[];
    currentUser: Member;
    onIssueChallenge: (challengerId: string, challengedId: string) => void;
    onRespondToChallenge: (challengeId: string, response: 'accept' | 'decline') => void;
    onReportResult: (challengeId: string, winnerId: string, score: string) => void;
}

type Tab = 'rankings' | 'challenges';

const LadderView: React.FC<LadderViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('rankings');
    const [reportingChallenge, setReportingChallenge] = useState<Challenge | null>(null);
    
    const { currentUser, challenges } = props;

    const myChallenges = challenges.filter(c => c.challengerId === currentUser.id || c.challengedId === currentUser.id);

    const handleReportScore = (challengeId: string, winnerId: string, score: string) => {
        props.onReportResult(challengeId, winnerId, score);
        setReportingChallenge(null);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">Club Ladder</h1>
                <p className="mt-2 text-slate-600">Challenge other members, report your scores, and climb the ranks!</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <TabButton label="Rankings" isActive={activeTab === 'rankings'} onClick={() => setActiveTab('rankings')} />
                        <TabButton label="My Challenges" isActive={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} />
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'rankings' && <LadderRankingList {...props} />}
                    {activeTab === 'challenges' && (
                        <ChallengesSection 
                            challenges={myChallenges}
                            currentUser={props.currentUser}
                            allMembers={props.allMembers}
                            onRespond={props.onRespondToChallenge}
                            onReportClick={(challenge) => setReportingChallenge(challenge)}
                        />
                    )}
                </div>
            </div>

            {reportingChallenge && (
                <ReportScoreModal 
                    challenge={reportingChallenge}
                    allMembers={props.allMembers}
                    onClose={() => setReportingChallenge(null)}
                    onSubmit={handleReportScore}
                />
            )}
        </div>
    );
};

const TabButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`${
            isActive ? 'border-club-primary text-club-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
    >
        {label}
    </button>
);


export default LadderView;