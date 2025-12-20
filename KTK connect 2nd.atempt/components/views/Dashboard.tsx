import React, { useState } from 'react';
import { useClub } from '../../context/ClubContext';
import EventCard from '../dashboard/EventCard';
import AddEventModal from '../dashboard/AddEventModal';
import { ClubEvent, UserRole } from '../../types';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

const Dashboard: React.FC = () => {
  const { events, currentUser, addEvent } = useClub();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const isAdminOrCoach = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Coach;
  
  const handleAddEvent = (eventDetails: Omit<ClubEvent, 'id' | 'attendees'>) => {
    addEvent(eventDetails);
    setIsAddModalOpen(false);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.length > 0 ? (
          [...events].sort((a,b) => a.startTime.getTime() - b.startTime.getTime()).map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No events scheduled. {isAdminOrCoach ? "Click 'Add Event' to create one!" : ""}</p>
        )}
      </div>

      {isAdminOrCoach && (
        <>
            <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-8 right-8 !rounded-full !p-4 shadow-lg flex items-center gap-2"
                aria-label="Add new event"
            >
                <Icon name="plus" className="w-6 h-6" />
                <span className="hidden sm:inline">Add Event</span>
            </Button>
            <AddEventModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddEvent={handleAddEvent}
            />
        </>
      )}
    </div>
  );
};

export default Dashboard;
