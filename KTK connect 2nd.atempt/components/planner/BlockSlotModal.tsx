import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { BlockedSlot } from '../../types';
import { ALL_COURTS } from '../../constants';

interface BlockSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (slot: Omit<BlockedSlot, 'id'>) => void;
}

const BlockSlotModal: React.FC<BlockSlotModalProps> = ({ isOpen, onClose, onBlock }) => {
  const [courtId, setCourtId] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('Maintenance');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courtId || !startTime || !endTime || !reason) {
      setError('Please fill in all fields.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
        setError('End time must be after start time.');
        return;
    }

    onBlock({
      courtId: Number(courtId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason,
    });
    
    onClose();
  };
  
  const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Block a Time Slot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="courtId" className="block text-sm font-medium text-gray-700">Court</label>
          <select id="courtId" value={courtId} onChange={e => setCourtId(Number(e.target.value))} className={commonInputClasses}>
             {ALL_COURTS.map(id => <option key={id} value={id}>Court {id}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="datetime-local" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className={commonInputClasses} required />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="datetime-local" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className={commonInputClasses} required />
            </div>
        </div>
         <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
          <input type="text" id="reason" value={reason} onChange={e => setReason(e.target.value)} className={commonInputClasses} required />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Block Slot</Button>
        </div>
      </form>
    </Modal>
  );
};

export default BlockSlotModal;