import React, { useState, useMemo } from 'react';
import { PartnerRequest, Member, GameType, RequestStatus } from '../types';
import PartnerRequestCard from './PartnerRequestCard';

interface FindPartnerViewProps {
    requests: PartnerRequest[];
    members: Member[];
    currentUser: Member;
    onAddRequest: (req: Omit<PartnerRequest, 'id' | 'status' | 'timestamp'>) => void;
    onCloseRequest: (requestId: string) => void;
}

const FindPartnerView: React.FC<FindPartnerViewProps> = ({ requests, members, currentUser, onAddRequest, onCloseRequest }) => {
    const [gameType, setGameType] = useState<GameType>(GameType.SINGLES);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeWindow, setTimeWindow] = useState('Anytime');
    
    const openRequests = requests.filter(r => r.status === RequestStatus.OPEN);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddRequest({
            memberId: currentUser.id,
            date: new Date(date),
            timeWindow,
            gameType
        });
    };

    const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    }), []);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Create a Partner Request</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Date</label>
                        <select value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm rounded-md">
                            {dateOptions.map(d => <option key={d} value={d}>{new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric'})}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Time</label>
                        <select value={timeWindow} onChange={e => setTimeWindow(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm rounded-md">
                           <option>Anytime</option>
                           <option>Morning (8-12)</option>
                           <option>Afternoon (12-17)</option>
                           <option>Evening (17-22)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Game Type</label>
                         <select value={gameType} onChange={e => setGameType(e.target.value as GameType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm rounded-md">
                           <option value={GameType.SINGLES}>Singles</option>
                           <option value={GameType.DOUBLES}>Doubles</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors py-2">Post Request</button>
                </form>
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-4">Open Requests</h2>
                 {openRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {openRequests.map(req => {
                            const author = members.find(m => m.id === req.memberId);
                            if (!author) return null;
                            return <PartnerRequestCard key={req.id} request={req} author={author} currentUser={currentUser} onCloseRequest={onCloseRequest} />;
                        })}
                    </div>
                 ) : (
                    <p className="text-center text-slate-500 bg-white rounded-lg shadow-md p-8">No open requests right now. Why not create one?</p>
                 )}
            </div>
        </div>
    );
};

export default FindPartnerView;