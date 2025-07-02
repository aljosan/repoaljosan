import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useClub } from '../../context/ClubContext';
import { Booking, RecurringBookingRule } from '../../types';
import { ALL_COURTS } from '../../constants';
import Icon from '../ui/Icon';

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Booking>) => void;
  onDelete: () => void;
  booking: Booking | null;
  onAddRecurring: (rule: Omit<RecurringBookingRule, 'id'>) => boolean;
}

const EditSessionModal: React.FC<EditSessionModalProps> = ({ isOpen, onClose, onSave, onDelete, booking, onAddRecurring }) => {
  const { groups } = useClub();
  
  const [groupId, setGroupId] = useState('');
  const [courtId, setCourtId] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [seriesStartDate, setSeriesStartDate] = useState('');
  const [seriesEndDate, setSeriesEndDate] = useState('');

  const [error, setError] = useState('');
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);

  const toLocalISOString = (date: Date, includeTime = true) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return includeTime ? d.toISOString().slice(0, 16) : d.toISOString().slice(0, 10);
  }

  useEffect(() => {
    if (booking) {
      setGroupId(booking.groupId || '');
      setCourtId(booking.courtId);
      setStartTime(toLocalISOString(new Date(booking.startTime)));
      setEndTime(toLocalISOString(new Date(booking.endTime)));
      setNotes(booking.notes || '');
      setIsRecurring(!!booking.recurringRuleId); // A real app would fetch the rule and populate fully
      setDaysOfWeek(booking.recurringRuleId ? [new Date(booking.startTime).getDay()] : []);
      setSeriesStartDate(booking.recurringRuleId ? toLocalISOString(new Date(booking.startTime), false) : '');
      setSeriesEndDate('');
      setError('');
      setConfirmingDelete(false);
    }
  }, [booking]);
  
  const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white disabled:bg-gray-100";

  const handleDayToggle = (dayIndex: number) => {
      setDaysOfWeek(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!booking) return;

    const newStartTime = new Date(startTime);
    const newEndTime = new Date(endTime);

    if (newStartTime >= newEndTime) {
        setError('End time must be after the start time.');
        return;
    }
    
    if (isRecurring && !booking.recurringRuleId) {
        // Creating a new recurring booking
        if(daysOfWeek.length === 0 || !seriesStartDate || !seriesEndDate) {
            setError("Please select repetition days and a start/end date for the series.");
            return;
        }
        const success = onAddRecurring({
            groupId,
            courtId: Number(courtId),
            startTime: { hour: newStartTime.getHours(), minute: newStartTime.getMinutes() },
            endTime: { hour: newEndTime.getHours(), minute: newEndTime.getMinutes() },
            daysOfWeek,
            seriesStartDate: new Date(seriesStartDate),
            seriesEndDate: new Date(seriesEndDate),
            notes,
        });
        if (success) onClose();
    } else {
        // Updating a single booking
        onSave({
            groupId,
            courtId: Number(courtId),
            startTime: newStartTime,
            endTime: newEndTime,
            notes,
        });
        onClose();
    }
  };
  
  const handleDelete = () => {
    if (booking) onDelete();
  };
  
  if (!isOpen || !booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Session">
       {isConfirmingDelete ? (
            <div className="space-y-4">
                <p className="font-semibold text-lg text-red-700">Confirm Deletion</p>
                <p>Are you sure you want to delete this session? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete Session</Button>
                </div>
            </div>
       ) : (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
              <select id="group" value={groupId} onChange={e => setGroupId(e.target.value)} className={commonInputClasses}>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

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
              <label htmlFor="sessionNotes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="sessionNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g., Focus on backhand drills. Link to video: https://..."
                className={commonInputClasses}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                    <input id="isRecurring" type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked && !booking.recurringRuleId)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" disabled={!!booking.recurringRuleId}/>
                    <label htmlFor="isRecurring" className="ml-3 block text-sm font-medium text-gray-900">Repeat this session</label>
                </div>
                {isRecurring && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Repeat on</label>
                            <div className="mt-2 flex gap-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <button key={i} type="button" onClick={() => handleDayToggle(i)} className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${daysOfWeek.includes(i) ? 'bg-primary-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="seriesStartDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" id="seriesStartDate" value={seriesStartDate} onChange={e => setSeriesStartDate(e.target.value)} className={commonInputClasses} />
                             </div>
                              <div>
                                <label htmlFor="seriesEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" id="seriesEndDate" value={seriesEndDate} onChange={e => setSeriesEndDate(e.target.value)} className={commonInputClasses} />
                             </div>
                        </div>
                    </div>
                )}
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="flex justify-between items-center pt-4">
              <Button type="button" variant="danger" onClick={() => setConfirmingDelete(true)}>Delete</Button>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </div>
        </form>
       )}
    </Modal>
  );
};

export default EditSessionModal;