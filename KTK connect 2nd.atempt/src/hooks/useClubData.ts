import { useBookings } from './useBookings';
import { useEvents } from './useEvents';
import { useGroups } from './useGroups';
import { useMembers } from './useMembers';
import { useNotifications } from './useNotifications';
import { Booking, ClubEvent, ConflictCheckResult, Group, Notification, RecurringBookingRule, ScheduleTemplate, User, BlockedSlot } from '@/types';

export interface UseClubDataReturnType {
  currentUser: User;
  users: User[];
  events: ClubEvent[];
  groups: Group[];
  recurringBookingRules: RecurringBookingRule[];
  scheduleTemplates: ScheduleTemplate[];
  allBookings: Booking[];
  blockedSlots: BlockedSlot[];
  notifications: Notification[];
  addBooking: (booking: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card') => { success: boolean; message: string };
  cancelBooking: (bookingId: string, options?: { scope?: 'single' | 'series' }) => void;
  createGroupBooking: (groupId: string, courtId: number, startTime: Date, endTime: Date, notes?: string) => Booking | null;
  updateBooking: (bookingId: string, updates: Partial<Booking>, editSeries: boolean) => boolean;
  addMessageToGroup: (groupId: string, messageText: string) => void;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addEvent: (eventDetails: Omit<ClubEvent, 'id' | 'attendees'>) => void;
  deleteEvent: (eventId: string) => void;
  addGroup: (groupDetails: Pick<Group, 'name' | 'description'>) => void;
  updateGroup: (groupId: string, updates: Pick<Group, 'name' | 'description'>) => void;
  deleteGroup: (groupId: string) => void;
  moveUserToGroup: (userId: string, targetGroupId: string | null) => void;
  addRecurringBooking: (rule: Omit<RecurringBookingRule, 'id'>) => boolean;
  blockSlot: (slot: Omit<BlockedSlot, 'id'>) => void;
  unblockSlot: (slotId: string) => void;
  saveScheduleAsTemplate: (name: string, bookings: Booking[]) => void;
  applyScheduleTemplate: (templateId: string, weekStartDate: Date) => { success: boolean; message: string };
  getBookingConflicts: (
    courtId: number,
    startTime: Date,
    endTime: Date,
    options: { excludeBookingId?: string; groupId?: string }
  ) => ConflictCheckResult;
  cancelMultipleBookings: (bookingIds: string[]) => void;
  moveMultipleBookings: (bookingIds: Set<string>, primaryBookingId: string, newStartTime: Date) => boolean;
}

export const useClubData = (): UseClubDataReturnType => {
  const { currentUser, users, applyUserCreditUpdates } = useMembers();
  const { notifications, addNotification, markNotificationAsRead } = useNotifications();
  const {
    groups,
    addGroup,
    updateGroup,
    deleteGroup: deleteGroupState,
    addMessageToGroup,
    moveUserToGroup,
  } = useGroups({ currentUserId: currentUser.id });
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
    removeGroupBookings,
  } = useBookings({ currentUser, users, groups, addNotification, applyUserCreditUpdates });
  const { events, joinEvent, leaveEvent, addEvent, deleteEvent } = useEvents({
    currentUserId: currentUser.id,
    addNotification,
  });

  const deleteGroup = (groupId: string) => {
    const groupName = groups.find(group => group.id === groupId)?.name || 'the deleted group';
    removeGroupBookings(groupId, groupName);
    deleteGroupState(groupId);
  };

  return {
    currentUser,
    users,
    events,
    groups,
    allBookings,
    notifications,
    recurringBookingRules,
    scheduleTemplates,
    blockedSlots,
    addBooking,
    cancelBooking,
    createGroupBooking,
    updateBooking,
    addMessageToGroup,
    joinEvent,
    leaveEvent,
    markNotificationAsRead,
    addEvent,
    deleteEvent,
    addGroup,
    updateGroup,
    deleteGroup,
    moveUserToGroup,
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
