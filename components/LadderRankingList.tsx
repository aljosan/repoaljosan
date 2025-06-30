import React from 'react';
import { LadderPlayer, Member } from '../types';
import MemberAvatar from './MemberAvatar';

interface LadderRankingListProps {
    ladderPlayers: LadderPlayer[];
    allMembers: Member[];
    currentUser: Member | null;
    onIssueChallenge: (challengerId: string, challengedId: string) => void;
}

const LadderRankingList: React.FC<LadderRankingListProps> = ({ ladderPlayers, allMembers, currentUser, onIssueChallenge }) => {
    
    const currentUserRank = currentUser ? ladderPlayers.find(p => p.memberId === currentUser.id)?.rank : undefined;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rank</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Player</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Record (W-L)</th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Challenge</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {ladderPlayers.map(player => {
                        const member = allMembers.find(m => m.id === player.memberId);
                        if (!member) return null;

                        const isCurrentUser = currentUser ? player.memberId === currentUser.id : false;
                        const canChallenge = currentUserRank && player.rank < currentUserRank && player.rank >= currentUserRank - 5;

                        return (
                            <tr key={player.memberId} className={isCurrentUser ? 'bg-club-primary/10' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-slate-700">{player.rank}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <MemberAvatar member={member} size="md" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{member.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{player.wins} - {player.losses}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canChallenge && (
                                        <button
                                            onClick={() => currentUser && onIssueChallenge(currentUser.id, player.memberId)}
                                            className="px-4 py-1.5 bg-club-primary text-white text-xs font-semibold rounded-full hover:bg-club-primary-dark transition-colors"
                                        >
                                            Challenge
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default LadderRankingList;