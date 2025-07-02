import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface DurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (durationMinutes: number) => void;
}

const DurationModal: React.FC<DurationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const durations = [
    { label: '1 Hour', minutes: 60 },
    { label: '1.5 Hours', minutes: 90 },
    { label: '2 Hours', minutes: 120 },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Session Duration">
      <div className="space-y-3">
        <p className="text-gray-600">Choose how long the group session will be.</p>
        {durations.map(({ label, minutes }) => (
          <Button
            key={minutes}
            variant="secondary"
            className="w-full text-lg !py-3"
            onClick={() => onSubmit(minutes)}
          >
            {label}
          </Button>
        ))}
      </div>
       <div className="flex justify-end gap-3 pt-4 mt-2">
          <Button type="button" variant="primary" onClick={onClose}>Cancel</Button>
        </div>
    </Modal>
  );
};

export default DurationModal;