import React, { useState } from 'react';
import { Member, PaymentMethod } from '../types';

interface PaymentModalProps {
    item: {
        type: string;
        name: string;
        price: number;
    };
    currentUser: Member;
    onConfirm: (method: PaymentMethod) => void;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ item, currentUser, onConfirm, onClose }) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('Card');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(amount);
    };

    const canAffordWithCredits = currentUser.clubCredits >= item.price;

    const handleConfirm = () => {
        if (!selectedMethod) return;
        onConfirm(selectedMethod);
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-slate-800">Complete Your Payment</h2>
                
                <div className="mt-6 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">{item.type}:</span>
                        <span>{item.name}</span>
                    </div>
                     <div className="flex justify-between items-center text-xl font-bold text-club-primary border-t border-b border-slate-200 py-3 my-3">
                        <span>Total Price:</span>
                        <span>{formatCurrency(item.price)}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Choose Payment Method</h3>
                    <div className="space-y-3">
                        <PaymentOption
                            method="Card"
                            title="Pay with Card/Vipps (Simulated)"
                            description="Use a standard payment method."
                            selectedMethod={selectedMethod}
                            onSelect={setSelectedMethod}
                        />
                        <PaymentOption
                            method="Credits"
                            title="Pay with Club Credits"
                            description={`Available: ${currentUser.clubCredits} credits`}
                            selectedMethod={selectedMethod}
                            onSelect={setSelectedMethod}
                            disabled={!canAffordWithCredits}
                        />
                    </div>
                </div>

                {!canAffordWithCredits && selectedMethod === 'Credits' && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg text-center">
                        You have insufficient credits to pay for this item. Please select another payment method.
                    </div>
                )}


                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedMethod}
                        className="px-5 py-2 bg-club-primary text-white rounded-md font-semibold hover:bg-club-primary-dark transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Pay Now
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

const PaymentOption: React.FC<{
    method: PaymentMethod,
    title: string,
    description: string,
    selectedMethod: PaymentMethod | null,
    onSelect: (method: PaymentMethod) => void,
    disabled?: boolean
}> = ({ method, title, description, selectedMethod, onSelect, disabled=false }) => {
    const isSelected = selectedMethod === method;
    return (
        <div 
            onClick={() => !disabled && onSelect(method)}
            className={`
                p-4 border rounded-lg transition-all
                ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer hover:border-club-primary'}
                ${isSelected ? 'border-club-primary bg-club-primary/5 ring-2 ring-club-primary' : 'border-slate-300'}
            `}
        >
            <div className="flex items-center">
                <div className="flex-1">
                    <p className={`font-semibold ${disabled ? 'text-slate-500' : 'text-slate-800'}`}>{title}</p>
                    <p className={`text-sm ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
                </div>
                <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? 'border-club-primary bg-club-primary' : 'border-slate-400'}
                `}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
            </div>
        </div>
    )
}

export default PaymentModal;