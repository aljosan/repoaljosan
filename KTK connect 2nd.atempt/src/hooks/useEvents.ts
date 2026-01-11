import { useState } from 'react';
import { ClubEvent } from '@/types';
import { mockEvents } from '../data/mockData';

export interface UseEventsReturnType {
  events: ClubEvent[];
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  addEvent: (eventDetails: Omit<ClubEvent, 'id' | 'attendees'>) => void;
  deleteEvent: (eventId: string) => void;
}

interface UseEventsParams {
  currentUserId: string;
  addNotification: (message: string) => void;
}

export const useEvents = ({ currentUserId, addNotification }: UseEventsParams): UseEventsReturnType => {
  const [events, setEvents] = useState<ClubEvent[]>(mockEvents);

  const joinEvent = (eventId: string) =>
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId && event.attendees.length < event.maxAttendees && !event.attendees.includes(currentUserId)
          ? { ...event, attendees: [...event.attendees, currentUserId] }
          : event
      )
    );

  const leaveEvent = (eventId: string) =>
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, attendees: event.attendees.filter(id => id !== currentUserId) } : event
      )
    );

  const addEvent = (eventDetails: Omit<ClubEvent, 'id' | 'attendees'>) =>
    setEvents(prev => [{ ...eventDetails, id: `event-${Date.now()}`, attendees: [] }, ...prev]);

  const deleteEvent = (eventId: string) => {
    const eventTitle = events.find(event => event.id === eventId)?.title ?? 'Event';
    setEvents(prev => prev.filter(event => event.id !== eventId));
    addNotification(`"${eventTitle}" was deleted.`);
  };

  return { events, joinEvent, leaveEvent, addEvent, deleteEvent };
};
