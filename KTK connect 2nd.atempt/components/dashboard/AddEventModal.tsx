import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ClubEvent } from '../../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (eventDetails: Omit<ClubEvent, 'id' | 'attendees'>) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Social' | 'Training' | 'Tournament'>('Social');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState(10);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !startTime || !endTime || !maxAttendees) {
      setError('Please fill in all fields.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
        setError('End time must be after start time.');
        return;
    }
    if (Number(maxAttendees) < 2) {
        setError('Maximum attendees must be at least 2.');
        return;
    }


    onAddEvent({
      title,
      type,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxAttendees: Number(maxAttendees),
    });
    
    // Reset form and close
    setTitle('');
    setType('Social');
    setStartTime('');
    setEndTime('');
    setMaxAttendees(10);
    onClose();
  };
  
  const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Event">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClasses} required />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select id="type" value={type} onChange={e => setType(e.target.value as any)} className={commonInputClasses} required>
            <option>Social</option>
            <option>Training</option>
            <option>Tournament</option>
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
          <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">Max Attendees</label>
          <input type="number" id="maxAttendees" value={maxAttendees} onChange={e => setMaxAttendees(Number(e.target.value))} className={commonInputClasses} min="2" required />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Create Event</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEventModal;