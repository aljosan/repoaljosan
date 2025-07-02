import React from 'react';
import { PartnerRequest, Member } from '../types';
import MemberAvatar from './MemberAvatar';

interface PartnerRequestCardProps {
    request: PartnerRequest;
    author: Member;
    currentUser: Member | null;
    onCloseRequest: (requestId: string) => void;
}

const PartnerRequestCard: React.FC<PartnerRequestCardProps> = ({ request, author, currentUser, onCloseRequest }) => {
    
    const handleRespond = () => {
        alert(`You can now coordinate with ${author.name}! For now, this request will be closed.`);
        onCloseRequest(request.id);
    };
    
    const isOwnRequest = currentUser ? author.id === currentUser.id : false;

    return (
        <div className="bg-white rounded-lg shadow-lg p-5 flex flex-col justify-between border-l-4 border-club-primary">
            <div>
                <div className="flex items-center mb-3">
                    <MemberAvatar member={author} />
                    <div className="ml-3">
                        <p className="font-bold text-slate-800">{author.name}</p>
                        <p className="text-xs text-slate-500">is looking for a game</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                    <p><strong>Date:</strong> {new Date(request.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p><strong>Time:</strong> {request.timeWindow}</p>
                    <p><strong>Type:</strong> <span className="px-2 py-0.5 bg-club-primary/10 text-club-primary-dark font-medium rounded-full text-xs">{request.gameType}</span></p>
                </div>
            </div>
            <div className="mt-5">
                {isOwnRequest ? (
                     <button onClick={() => onCloseRequest(request.id)} className="w-full bg-slate-500 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors py-2 text-sm">
                        Close My Request
                    </button>
                ) : (
                    <button onClick={handleRespond} className="w-full bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors py-2 text-sm">
                        I'm In!
                    </button>
                )}
            </div>
        </div>
    );
};

export default PartnerRequestCard;