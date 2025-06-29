import React, { useState } from 'react';
import { useClubData } from '../hooks/useClubData';
import { Member, Transaction } from '../types';

interface AdminCreditManagementProps {
    clubData: ReturnType<typeof useClubData>;
}

const AdminCreditManagement: React.FC<AdminCreditManagementProps> = ({ clubData }) => {
    const { members, transactions, awardCredits } = clubData;
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMemberId || !amount || !reason) {
            setFeedback('Error: Please fill out all fields.');
            return;
        }
        const numericAmount = parseInt(amount, 10);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setFeedback('Error: Please enter a valid positive number for credits.');
            return;
        }
        
        awardCredits(selectedMemberId, numericAmount, reason);
        const memberName = members.find(m => m.id === selectedMemberId)?.name;
        setFeedback(`Success! Awarded ${numericAmount} credits to ${memberName}.`);

        // Reset form
        setSelectedMemberId('');
        setAmount('');
        setReason('');

        setTimeout(() => setFeedback(''), 4000);
    };

    const sortedTransactions = [...transactions].sort((a,b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="bg-white rounded-lg shadow-lg">
             <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Club Credit Management</h2>
                <p className="text-sm text-slate-500 mt-1">Award credits to members for community work and view all transactions.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Award Credits Form */}
                <div className="space-y-4">
                     <h3 className="font-semibold text-lg text-slate-700">Award Club Credits</h3>
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                             <label htmlFor="member-select" className="block text-sm font-medium text-slate-700">Member</label>
                             <select id="member-select" value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-club-primary focus:border-club-primary sm:text-sm rounded-md">
                                <option value="" disabled>Select a member...</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                             </select>
                        </div>
                         <div>
                            <label htmlFor="credit-amount" className="block text-sm font-medium text-slate-700">Amount of Credits</label>
                            <input type="number" id="credit-amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div>
                            <label htmlFor="credit-reason" className="block text-sm font-medium text-slate-700">Reason</label>
                            <input type="text" id="credit-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Helped with tournament" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3"/>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="px-6 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors">Award Credits</button>
                        </div>
                        {feedback && <p className={`text-sm ${feedback.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{feedback}</p>}
                     </form>
                </div>
                {/* All Transactions Log */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-700">All Transactions</h3>
                    <div className="h-96 overflow-y-auto border border-slate-200 rounded-md">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Member</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {sortedTransactions.map(tx => {
                                    const member = members.find(m => m.id === tx.memberId);
                                    return (
                                        <tr key={tx.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="text-sm font-medium text-slate-800">{member?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-xs">{tx.description}</p>
                                            </td>
                                            <td className={`px-4 py-3 text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-700'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</td>
                                            <td className="px-4 py-3 text-xs">{tx.paymentMethod}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreditManagement;
