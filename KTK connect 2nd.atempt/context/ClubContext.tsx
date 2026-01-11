import React, { createContext, useContext, ReactNode } from 'react';
import { useClubData, UseClubDataReturnType } from '../hooks/useClubData';

const ClubContext = createContext<UseClubDataReturnType | null>(null);

export const ClubDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clubData = useClubData();
  return <ClubContext.Provider value={clubData}>{children}</ClubContext.Provider>;
};

export const useClub = (): UseClubDataReturnType => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubDataProvider');
  }
  return context;
};

export const useMembers = () => {
  const { currentUser, users } = useClub();
  return { currentUser, users };
};

export const useEvents = () => {
  const { events, joinEvent, leaveEvent, addEvent, deleteEvent } = useClub();
  return { events, joinEvent, leaveEvent, addEvent, deleteEvent };
};

export const useGroups = () => {
  const { groups, addGroup, updateGroup, deleteGroup, addMessageToGroup, moveUserToGroup } = useClub();
  return { groups, addGroup, updateGroup, deleteGroup, addMessageToGroup, moveUserToGroup };
};

export const useBookings = () => {
  const {
    allBookings,
    recurringBookingRules,
    scheduleTemplates,
    blockedSlots,
    addBooking,
    cancelBooking,
    createGroupBooking,
    updateBooking,
    addRecurringBooking,
    blockSlot,
    unblockSlot,
    saveScheduleAsTemplate,
    applyScheduleTemplate,
    getBookingConflicts,
    cancelMultipleBookings,
    moveMultipleBookings,
  } = useClub();
  return {
    allBookings,
    recurringBookingRules,
    scheduleTemplates,
    blockedSlots,
    addBooking,
    cancelBooking,
    createGroupBooking,
    updateBooking,
    addRecurringBooking,
    blockSlot,
    unblockSlot,
    saveScheduleAsTemplate,
    applyScheduleTemplate,
    getBookingConflicts,
    cancelMultipleBookings,
    moveMultipleBookings,
  };
};

export const useNotifications = () => {
  const { notifications, markNotificationAsRead } = useClub();
  return { notifications, markNotificationAsRead };
};
