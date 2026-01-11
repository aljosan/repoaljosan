import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { BOOKING_COST_PER_HOUR, INDOOR_COURTS } from '../../constants';
import { Booking } from '../../types';
import { useMembers } from '../../context/ClubContext';
import Icon from '../ui/Icon';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: { courtId: number; startTime: Date };
  onConfirmBooking: (bookingDetails: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card') => { success: boolean, message: string };
}

type ModalStep = 'confirm' | 'pay' | 'success' | 'error';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, slot, onConfirmBooking }) => {
  const { currentUser } = useMembers();
  const [step, setStep] = useState<ModalStep>('confirm');
  const [errorMessage, setErrorMessage] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Reset step when modal is reopened for a new slot
  useEffect(() => {
    if (isOpen) {
        setStep('confirm');
        setErrorMessage('');
        setDurationMinutes(60);
    }
  }, [isOpen, slot]);

  const { courtId, startTime } = slot;
  const courtType: 'Indoor' | 'Outdoor' = INDOOR_COURTS.includes(courtId) ? 'Indoor' : 'Outdoor';
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  const cost = BOOKING_COST_PER_HOUR * (durationMinutes / 60);
  const hasEnoughCredits = currentUser.credits >= cost;
  
  const handlePayment = (method: 'credits' | 'card') => {
      const bookingDetails = { courtId, courtType, startTime, endTime, cost };
      const result = onConfirmBooking(bookingDetails, method);
      if (result.success) {
          setStep('success');
      } else {
          setErrorMessage(result.message);
          setStep('error');
      }
  };

  const renderContent = () => {
    switch(step) {
      case 'confirm':
        return (
          <div className="space-y-4 text-gray-700">
            <p>Please confirm the details for your booking:</p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p><strong>Court:</strong> {courtId} ({courtType})</p>
              <p><strong>Date:</strong> {startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Duration:</strong> {durationMinutes} minutes</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-600">Select duration</p>
              <div className="grid grid-cols-3 gap-2">
                {[60, 90, 120].map(minutes => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setDurationMinutes(minutes)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      durationMinutes === minutes
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200">
                <span className="font-semibold text-lg text-blue-800">Cost: {cost} Credits</span>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={() => setStep('pay')}>Proceed to Payment</Button>
            </div>
          </div>
        );
      case 'pay':
        return (
            <div className="space-y-4 text-gray-700">
                <p className="font-semibold text-lg">Choose Payment Method</p>
                <div className="space-y-3">
                    <Button onClick={() => handlePayment('credits')} disabled={!hasEnoughCredits} className="w-full flex justify-between items-center text-left !p-4">
                        <div>
                            <p className="font-semibold">Pay with Club Credits</p>
                            <p className={`text-sm ${hasEnoughCredits ? 'text-white/80' : 'text-red-200'}`}>
                                Balance: {currentUser.credits} Credits {hasEnoughCredits ? '' : '(Insufficient)'}
                            </p>
                        </div>
                        <Icon name="credit-card" className="w-8 h-8"/>
                    </Button>
                     <Button onClick={() => handlePayment('card')} variant="secondary" className="w-full flex justify-between items-center text-left !p-4">
                         <div>
                            <p className="font-semibold">Pay with Card</p>
                            <p className="text-sm text-gray-500">Simulated secure payment</p>
                        </div>
                        <Icon name="credit-card" className="w-8 h-8 text-gray-700"/>
                    </Button>
                </div>
                 <div className="flex justify-start pt-4">
                    <Button variant="secondary" onClick={() => setStep('confirm')}>Back</Button>
                </div>
            </div>
        );
    case 'success':
        return (
            <div className="text-center space-y-4 py-8">
                <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto"/>
                <h3 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h3>
                <p className="text-gray-600">Your booking for Court {courtId} is complete. A notification has been sent.</p>
                <div className="pt-4">
                    <Button variant="primary" onClick={onClose}>Done</Button>
                </div>
            </div>
        );
    case 'error':
        return (
            <div className="text-center space-y-4 py-8">
                <Icon name="close" className="w-16 h-16 text-red-500 mx-auto bg-red-100 rounded-full p-2"/>
                <h3 className="text-2xl font-bold text-gray-800">Booking Failed</h3>
                <p className="text-gray-600">{errorMessage}</p>
                 <div className="pt-4 flex justify-center gap-3">
                    <Button variant="secondary" onClick={() => setStep('pay')}>Try Again</Button>
                    <Button variant="primary" onClick={onClose}>Close</Button>
                </div>
            </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book Court ${courtId}`}>
      {renderContent()}
    </Modal>
  );
};

export default BookingModal;
