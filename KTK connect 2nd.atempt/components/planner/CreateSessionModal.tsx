import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { durationMinutes: number, notes: string }) => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [notes, setNotes] = useState('');
  
  const durations = [
    { label: '1 Hour', minutes: 60 },
    { label: '1.5 Hours', minutes: 90 },
    { label: '2 Hours', minutes: 120 },
  ];

  const handleDurationSelect = (durationMinutes: number) => {
    onSubmit({ durationMinutes, notes });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group Session">
      <div className="space-y-4">
        <div>
            <label htmlFor="sessionNotes" className="block text-sm font-medium text-gray-700">Session Notes (Optional)</label>
            <textarea
                id="sessionNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g., Focus on backhand drills. Link to video: https://..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
        </div>
        <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-gray-700">Choose Session Duration</p>
            {durations.map(({ label, minutes }) => (
            <Button
                key={minutes}
                variant="secondary"
                className="w-full text-lg !py-3"
                onClick={() => handleDurationSelect(minutes)}
            >
                {label}
            </Button>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default CreateSessionModal;
