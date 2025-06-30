import React from 'react';
import { Event, Member, AvailabilityStatus } from '../types';
import MemberAvatar from './MemberAvatar';
import AvailabilityButtons from './AvailabilityButtons';
import { ICONS } from '../constants';

interface EventCardProps {
  event: Event;
  allMembers: Member[];
  currentUser: Member | null;
  onUpdateAvailability: (eventId: string, memberId: string, status: AvailabilityStatus) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, allMembers, currentUser, onUpdateAvailability }) => {
  
  const getAttendees = (status: AvailabilityStatus) => {
    return event.availability
      .filter(a => a.status === status)
      .map(a => allMembers.find(m => m.id === a.memberId))
      .filter((m): m is Member => !!m);
  };

  const attendees = getAttendees(AvailabilityStatus.ATTENDING);
  const maybes = getAttendees(AvailabilityStatus.MAYBE);
  
  const currentUserAvailability = currentUser ? (event.availability.find(a => a.memberId === currentUser.id)?.status || AvailabilityStatus.PENDING) : AvailabilityStatus.PENDING;

  const eventTypeColors = {
    Match: 'bg-club-primary text-white',
    Training: 'bg-club-primary text-white',
    Social: 'bg-club-accent text-white',
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-slate-800">{event.title}</h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${eventTypeColors[event.type]}`}>{event.type}</span>
        </div>
        
        <div className="mt-3 text-slate-600 space-y-2">
            <p className="flex items-center">{ICONS.CALENDAR} {formatDate(event.date)}</p>
            <p className="flex items-center">{ICONS.LOCATION} {event.location}</p>
        </div>

        <p className="mt-4 text-slate-700">{event.description}</p>
        
        <div className="mt-6">
            <h4 className="font-semibold text-slate-800">Your Availability:</h4>
            {currentUser && (
              <AvailabilityButtons
                currentStatus={currentUserAvailability}
                onSetStatus={(status) => onUpdateAvailability(event.id, currentUser.id, status)}
              />
            )}
        </div>

      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div>
          <h5 className="font-semibold text-sm text-slate-700">Going ({attendees.length})</h5>
          {attendees.length > 0 ? (
            <div className="flex -space-x-2 mt-2">
              {attendees.map(member => <MemberAvatar key={member.id} member={member} />)}
            </div>
          ) : <p className="text-sm text-slate-500 mt-1">No one confirmed yet.</p>}
        </div>
        <div className="mt-4">
          <h5 className="font-semibold text-sm text-slate-700">Maybe ({maybes.length})</h5>
          {maybes.length > 0 ? (
            <div className="flex -space-x-2 mt-2">
              {maybes.map(member => <MemberAvatar key={member.id} member={member} />)}
            </div>
          ) : <p className="text-sm text-slate-500 mt-1">No maybes yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default EventCard;