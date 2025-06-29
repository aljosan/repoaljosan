import React, { useState } from 'react';
import { useClubData } from '../hooks/useClubData';
import { View, Transaction } from '../types';

interface MyAccountViewProps {
    clubData: ReturnType<typeof useClubData>;
    setCurrentView: (view: View) => void;
}

const MyAccountView: React.FC<MyAccountViewProps> = ({ clubData, setCurrentView }) => {
    const { currentUser, transactions, toggleNtfConsent, agreeToPolicies, updateMemberDetails, deleteCurrentUser, ADMIN_ID } = clubData;

    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(currentUser.name);

    const handleNameSave = () => {
        if (editedName.trim()) {
            updateMemberDetails(currentUser.id, { name: editedName.trim() });
            setIsEditingName(false);
        }
    };

    const handleAgreeAndReview = () => {
        agreeToPolicies(currentUser.id);
        setCurrentView(View.PRIVACY_POLICY);
    };
    
    const handleDeleteAccount = () => {
        if (currentUser.id === ADMIN_ID) {
            alert("The admin account cannot be deleted for safety reasons in this demo.");
            return;
        }
        const confirmation = window.confirm(
            "Are you absolutely sure you want to delete your account?\n\nThis action is irreversible. All your bookings, posts, challenges, and other data will be permanently erased."
        );
        if (confirmation) {
            deleteCurrentUser();
            alert("Your account has been deleted.");
        }
    };

    const myTransactions = [...transactions]
        .filter(t => t.memberId === currentUser.id)
        .sort((a,b) => b.date.getTime() - a.date.getTime());

    const formatCredits = (amount: number) => {
         return new Intl.NumberFormat('nb-NO').format(amount);
    }
    
    const getTransactionPillColor = (tx: Transaction) => {
        if (tx.paymentMethod === 'Awarded') return 'bg-green-100 text-green-800';
        if (tx.paymentMethod === 'Credits') return 'bg-blue-100 text-blue-800';
        return 'bg-slate-100 text-slate-800';
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Club Credits Section */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                <h2 className="text-lg font-semibold text-slate-600">Your Club Credits</h2>
                <div className="flex items-center justify-center mt-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-5xl font-bold text-club-primary ml-2">{formatCredits(currentUser.clubCredits)}</p>
                </div>
                <p className="text-sm text-slate-500 mt-3">Earn credits by helping out with club events and activities!</p>
            </div>

            {/* My Profile Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">My Profile</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-slate-700">Name</label>
                        {isEditingName ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="px-2 py-1 border border-slate-300 rounded-md"
                                />
                                <button onClick={handleNameSave} className="px-3 py-1 bg-club-primary text-white text-sm rounded-md">Save</button>
                                <button onClick={() => setIsEditingName(false)} className="px-3 py-1 bg-slate-200 text-sm rounded-md">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <p className="text-slate-800">{currentUser.name}</p>
                                <button onClick={() => setIsEditingName(true)} className="text-sm text-club-primary hover:underline">Edit</button>
                            </div>
                        )}
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="font-medium text-slate-700">Avatar</label>
                        <img src={currentUser.avatarUrl} alt="Your avatar" className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Privacy & Consent Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">Privacy & Consent</h2>
                 <div className="space-y-4">
                    {currentUser.consentAgreedTimestamp ? (
                         <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                            You agreed to our Privacy Policy on {new Date(currentUser.consentAgreedTimestamp).toLocaleDateString()}. 
                            <span onClick={() => setCurrentView(View.PRIVACY_POLICY)} className="underline cursor-pointer ml-2">View Policy</span>
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center justify-between">
                            <p>You have not yet agreed to our updated Privacy Policy.</p>
                            <button onClick={handleAgreeAndReview} className="px-4 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark">
                                Review and Agree
                            </button>
                        </div>
                    )}
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="checkbox"
                            id="ntf-consent"
                            checked={!!currentUser.ntfConsent}
                            onChange={() => toggleNtfConsent(currentUser.id)}
                            className="h-5 w-5 rounded text-club-primary focus:ring-club-primary mt-1 cursor-pointer"
                        />
                        <div>
                            <label htmlFor="ntf-consent" className="font-medium text-slate-800 cursor-pointer">Share data with Norwegian Tennis Federation</label>
                            <p className="text-sm text-slate-600 mt-1">By checking this box, you consent to sharing your basic membership information (name and NTF ID) with the NTF to verify your official membership status.</p>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Transaction History Section */}
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">My Purchases & Credits</h2>
                </div>
                <div className="divide-y divide-slate-200">
                    {myTransactions.length > 0 ? (
                        myTransactions.map(tx => (
                            <div key={tx.id} className="p-6 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800">{tx.description}</p>
                                    <p className="text-sm text-slate-500">{tx.date.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-700'}`}>
                                        {tx.amount > 0 ? '+' : ''}{formatCredits(tx.amount)}
                                        <span className="text-base font-medium ml-1">{tx.amount > 0 ? 'credits' : 'NOK'}</span>
                                    </p>
                                    {tx.paymentMethod && 
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full mt-1 inline-block ${getTransactionPillColor(tx)}`}>
                                            {tx.amount < 0 ? `Paid with ${tx.paymentMethod}` : tx.paymentMethod}
                                        </span>
                                    }
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="p-8 text-center text-slate-500">
                            <p>No transactions yet.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Danger Zone */}
            <div className="bg-red-50 border-2 border-dashed border-red-300 rounded-lg p-6">
                 <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
                 <div className="mt-4 flex items-center justify-between">
                    <div>
                        <p className="font-medium text-red-800">Delete Your Account</p>
                        <p className="text-sm text-red-600">This will permanently delete all your data. This action cannot be undone.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
                        Delete My Account
                    </button>
                 </div>
            </div>
        </div>
    );
};

export default MyAccountView;