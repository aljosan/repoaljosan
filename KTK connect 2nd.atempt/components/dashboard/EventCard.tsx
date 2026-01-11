import React, { useState } from 'react';
import { ClubEvent, User, UserRole } from '../../types';
import { useEvents, useMembers } from '../../context/ClubContext';
import { AvatarGroup } from '../ui/Avatar';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';

interface EventCardProps {
  event: ClubEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { users, currentUser } = useMembers();
  const { joinEvent, leaveEvent, deleteEvent } = useEvents();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const eventAttendees: User[] = users.filter(user => event.attendees.includes(user.id));
  const isAttending = event.attendees.includes(currentUser.id);
  const isFull = event.attendees.length >= event.maxAttendees;
  const isAdminOrCoach = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Coach;

  const handleToggleAttendance = () => {
    if (isAttending) {
      leaveEvent(event.id);
    } else if (!isFull) {
      joinEvent(event.id);
    }
  };

  const handleDelete = () => {
    deleteEvent(event.id);
    setDeleteModalOpen(false);
  };
  
  const typeColors: Record<ClubEvent['type'], string> = {
    'Social': 'bg-blue-100 text-blue-800',
    'Training': 'bg-green-100 text-green-800',
    'Tournament': 'bg-purple-100 text-purple-800',
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col">
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xl font-bold text-gray-900 flex-1">{event.title}</h3>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[event.type]} whitespace-nowrap`}>
                {event.type}
              </span>
              {isAdminOrCoach && (
                <>
                  <button onClick={() => setEditModalOpen(true)} className="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Edit event">
                    <Icon name="pencil" className="w-5 h-5"/>
                  </button>
                  <button onClick={() => setDeleteModalOpen(true)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete event">
                    <Icon name="trash" className="w-5 h-5"/>
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(event.startTime).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Attendees ({event.attendees.length}/{event.maxAttendees})</p>
            <div className="mt-2">
              <AvatarGroup users={eventAttendees} max={4} />
            </div>
          </div>
        </div>
        <div className="p-5 bg-gray-50 border-t">
          <Button
            onClick={handleToggleAttendance}
            disabled={isFull && !isAttending}
            variant={isAttending ? 'secondary' : 'primary'}
            className="w-full"
          >
            {isAttending ? 'Leave' : (isFull ? 'Event Full' : 'Join')}
          </Button>
        </div>
      </div>

      {isAdminOrCoach && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
            <div className="space-y-4">
                <p>Are you sure you want to delete the event "<strong>{event.title}</strong>"? This action cannot be undone.</p>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete Event</Button>
                </div>
            </div>
        </Modal>
      )}

      {isAdminOrCoach && (
        <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Event">
          <div className="space-y-4">
            <p>Editing events is not available yet. Please check back soon.</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="primary" onClick={() => setEditModalOpen(false)}>Got it</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default EventCard;
