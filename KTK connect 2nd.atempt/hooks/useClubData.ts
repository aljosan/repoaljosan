import { useState, useMemo } from 'react';
import { User, ClubEvent, Group, Booking, Notification, UserRole, GroupMessage, RecurringBookingRule, ScheduleTemplate, BlockedSlot, ConflictCheckResult } from '../types';
import { mockUsers, mockEvents, mockGroups, mockBookings, mockNotifications, mockRecurringBookings, mockScheduleTemplates, mockBlockedSlots } from '../data/mockData';
import { INDOOR_COURTS } from '../constants';

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
  addBooking: (booking: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card') => { success: boolean, message: string };
  cancelBooking: (bookingId: string) => void;
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
  applyScheduleTemplate: (templateId: string, weekStartDate: Date) => { success: boolean, message: string };
  getBookingConflicts: (courtId: number, startTime: Date, endTime: Date, options: { excludeBookingId?: string, groupId?: string }) => ConflictCheckResult;
}

export const useClubData = (): UseClubDataReturnType => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [events, setEvents] = useState<ClubEvent[]>(mockEvents);
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [recurringBookingRules, setRecurringBookingRules] = useState<RecurringBookingRule[]>(mockRecurringBookings);
  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>(mockScheduleTemplates);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(mockBlockedSlots);

  const allBookings = useMemo(() => {
    const generatedBookings: Booking[] = [];
    recurringBookingRules.forEach(rule => {
        let currentDate = new Date(rule.seriesStartDate);
        while (currentDate <= rule.seriesEndDate) {
            if (rule.daysOfWeek.includes(currentDate.getDay())) {
                const startTime = new Date(currentDate);
                startTime.setHours(rule.startTime.hour, rule.startTime.minute, 0, 0);

                const endTime = new Date(currentDate);
                endTime.setHours(rule.endTime.hour, rule.endTime.minute, 0, 0);
                
                const hasException = bookings.some(b => 
                    b.recurringRuleId === rule.id &&
                    new Date(b.startTime).toDateString() === startTime.toDateString()
                );

                if (!hasException) {
                    generatedBookings.push({
                        id: `${rule.id}-${startTime.getTime()}`,
                        courtId: rule.courtId,
                        courtType: INDOOR_COURTS.includes(rule.courtId) ? 'Indoor' : 'Outdoor',
                        groupId: rule.groupId,
                        startTime,
                        endTime,
                        cost: 0,
                        notes: rule.notes,
                        recurringRuleId: rule.id,
                    });
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
    return [...bookings, ...generatedBookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [bookings, recurringBookingRules]);

  const getBookingConflicts = (courtId: number, startTime: Date, endTime: Date, options: { excludeBookingId?: string, groupId?: string }): ConflictCheckResult => {
    const { excludeBookingId, groupId } = options;
    const checkTime = new Date(startTime).getTime();
    const endCheckTime = new Date(endTime).getTime();

    // Check for court/time conflicts with other bookings
    const courtConflictBooking = allBookings.find(b =>
      b.id !== excludeBookingId &&
      b.courtId === courtId &&
      new Date(b.startTime).getTime() < endCheckTime &&
      new Date(b.endTime).getTime() > checkTime
    );
    if (courtConflictBooking) {
      return { conflict: true, reason: 'court', message: `Court ${courtId} is already booked at this time.` };
    }

    // Check for conflicts with blocked slots
    const blockedSlotConflict = blockedSlots.find(s =>
      s.courtId === courtId &&
      new Date(s.startTime).getTime() < endCheckTime &&
      new Date(s.endTime).getTime() > checkTime
    );
    if (blockedSlotConflict) {
      return { conflict: true, reason: 'blocked', message: `Court ${courtId} is blocked for maintenance at this time.` };
    }

    // Check for coach conflicts if a groupId is provided
    if (groupId) {
        const currentGroup = groups.find(g => g.id === groupId);
        if (!currentGroup) return { conflict: false }; // Group not found, no conflict

        const coach = users.find(u => currentGroup.members.includes(u.id) && u.role === UserRole.Coach);
        if (coach) {
            // Find all groups the coach is in
            const coachGroups = groups.filter(g => g.members.includes(coach.id));
            const coachGroupIds = new Set(coachGroups.map(g => g.id));

            // Check if the coach has another booking at the same time on ANY court
            const coachConflictBooking = allBookings.find(b =>
                b.id !== excludeBookingId &&
                b.groupId &&
                b.groupId !== groupId && // Exclude the group we are currently booking for
                coachGroupIds.has(b.groupId) &&
                new Date(b.startTime).getTime() < endCheckTime &&
                new Date(b.endTime).getTime() > checkTime
            );

            if (coachConflictBooking) {
                const conflictGroup = groups.find(g => g.id === coachConflictBooking.groupId);
                return { 
                    conflict: true, 
                    reason: 'coach', 
                    message: `Coach ${coach.name} is already scheduled with "${conflictGroup?.name}" on Court ${coachConflictBooking.courtId} at this time.`
                };
            }
        }
    }

    return { conflict: false };
  };

  const addBooking = (booking: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card'): { success: boolean, message: string } => {
    const conflict = getBookingConflicts(booking.courtId, booking.startTime, booking.endTime, {});
    if (conflict.conflict) {
        return { success: false, message: conflict.message || "This time slot is unavailable." };
    }

    if (paymentMethod === 'credits') {
        if (currentUser.credits < booking.cost) {
            return { success: false, message: "Insufficient credits for this booking." };
        }
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        const newUsers = [...users];
        newUsers[userIndex].credits -= booking.cost;
        setUsers(newUsers);
        setCurrentUser(newUsers[userIndex]);
    }

    const newBooking: Booking = { ...booking, id: `booking-${Date.now()}`, userId: currentUser.id };
    setBookings(prev => [...prev, newBooking]);
    setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Court ${booking.courtId} booked for ${booking.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`, timestamp: new Date(), read: false}, ...prev]);
    return { success: true, message: "Booking successful!" };
  };
  
  const cancelBooking = (bookingId: string) => {
    const bookingToCancel = allBookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    if (bookingToCancel.recurringRuleId && !bookingToCancel.isException) {
       setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Cannot cancel a single recurring session. Please edit the series.`, timestamp: new Date(), read: false}, ...prev]);
       return;
    }

    if (bookingToCancel.userId && bookingToCancel.cost > 0) {
        const userIndex = users.findIndex(u => u.id === bookingToCancel.userId);
        if (userIndex !== -1) {
            const newUsers = [...users];
            newUsers[userIndex].credits += bookingToCancel.cost;
            setUsers(newUsers);
            if (newUsers[userIndex].id === currentUser.id) { setCurrentUser(newUsers[userIndex]); }
        }
    }

    setBookings(prev => prev.filter(b => b.id !== bookingId));
    
    let notifMessage = `Booking on Court ${bookingToCancel.courtId} cancelled.`;
    if (bookingToCancel.groupId) {
        const group = groups.find(g => g.id === bookingToCancel.groupId);
        notifMessage = `Group session for "${group?.name}" on Court ${bookingToCancel.courtId} has been cancelled.`
    }
    setNotifications(prev => [{id: `notif-${Date.now()}`, message: notifMessage, timestamp: new Date(), read: false}, ...prev]);
  };
  
  const createGroupBooking = (groupId: string, courtId: number, startTime: Date, endTime: Date, notes?: string): Booking | null => {
    const conflict = getBookingConflicts(courtId, startTime, endTime, { groupId });
    if (conflict.conflict) {
        setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Failed to schedule group: ${conflict.message}`, timestamp: new Date(), read: false}, ...prev]);
        return null;
    }

    const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        courtId,
        courtType: INDOOR_COURTS.includes(courtId) ? 'Indoor' : 'Outdoor',
        groupId,
        startTime,
        endTime,
        cost: 0,
        notes,
    };

    setBookings(prev => [...prev, newBooking]);
    const group = groups.find(g => g.id === groupId);
    setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Group "${group?.name}" scheduled on Court ${courtId}.`, timestamp: new Date(), read: false}, ...prev]);
    return newBooking;
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>, editSeries: boolean): boolean => {
    const originalBooking = allBookings.find(b => b.id === bookingId);
    if (!originalBooking) return false;

    // --- Logic for RECURRING bookings ---
    if (originalBooking.recurringRuleId && editSeries) {
        // This is a simplified logic. A full implementation would check conflicts for all future instances.
        const rule = recurringBookingRules.find(r => r.id === originalBooking.recurringRuleId);
        if (!rule) return false;

        const newRule = { ...rule, courtId: updates.courtId ?? rule.courtId, groupId: updates.groupId ?? rule.groupId, notes: updates.notes ?? rule.notes };
        if (updates.startTime) {
            const newStartTime = new Date(updates.startTime);
            newRule.startTime = { hour: newStartTime.getHours(), minute: newStartTime.getMinutes() };
        }
        if (updates.endTime) {
            const newEndTime = new Date(updates.endTime);
            newRule.endTime = { hour: newEndTime.getHours(), minute: newEndTime.getMinutes() };
        }

        setRecurringBookingRules(prev => prev.map(r => r.id === newRule.id ? newRule : r));
        setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Recurring series for "${groups.find(g => g.id === newRule.groupId)?.name}" was updated.`, timestamp: new Date(), read: false}, ...prev]);
        return true;
    }

    // --- Logic for SINGLE bookings or single instances of a recurring booking ---
    const updatedBooking = { ...originalBooking, ...updates };

    const conflict = getBookingConflicts(updatedBooking.courtId, updatedBooking.startTime, updatedBooking.endTime, { excludeBookingId: bookingId, groupId: updatedBooking.groupId });
    if (conflict.conflict) {
        setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Failed to update: ${conflict.message}`, timestamp: new Date(), read: false}, ...prev]);
        return false;
    }
    
    if (updates.courtId) {
        updatedBooking.courtType = INDOOR_COURTS.includes(updates.courtId) ? 'Indoor' : 'Outdoor';
    }

    if (originalBooking.recurringRuleId && !editSeries) {
        updatedBooking.isException = true;
        updatedBooking.id = `booking-${Date.now()}`;
        setBookings(prev => [...prev.filter(b => b.id !== originalBooking.id), updatedBooking]);
    } else {
        setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBooking : b)));
    }
    
    setNotifications(prev => [{id: `notif-${Date.now()}`, message: `A session on Court ${updatedBooking.courtId} was updated.`, timestamp: new Date(), read: false}, ...prev]);
    return true;
  };

  const addRecurringBooking = (ruleDetails: Omit<RecurringBookingRule, 'id'>) => {
    const newRule: RecurringBookingRule = { ...ruleDetails, id: `recurring-${Date.now()}` };
    const firstInstanceStartTime = new Date(newRule.seriesStartDate);
    let dayDiff = (newRule.daysOfWeek[0] - firstInstanceStartTime.getDay() + 7) % 7;
    firstInstanceStartTime.setDate(firstInstanceStartTime.getDate() + dayDiff);
    firstInstanceStartTime.setHours(newRule.startTime.hour, newRule.startTime.minute);
    
    const firstInstanceEndTime = new Date(firstInstanceStartTime);
    firstInstanceEndTime.setHours(newRule.endTime.hour, newRule.endTime.minute);
    
    const conflict = getBookingConflicts(newRule.courtId, firstInstanceStartTime, firstInstanceEndTime, { groupId: newRule.groupId });
    if(conflict.conflict) {
        setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Could not create recurring session: ${conflict.message}`, timestamp: new Date(), read: false}, ...prev]);
        return false;
    }

    setRecurringBookingRules(prev => [...prev, newRule]);
    const group = groups.find(g => g.id === newRule.groupId);
    setNotifications(prev => [{id: `notif-${Date.now()}`, message: `New recurring session created for "${group?.name}".`, timestamp: new Date(), read: false}, ...prev]);
    return true;
  };

  const saveScheduleAsTemplate = (name: string, bookingsToSave: Booking[]) => {
      const templateBookings = bookingsToSave.map(b => {
          const dayOfWeek = new Date(b.startTime).getDay();
          const baseDate = new Date(`1970-01-${4 + dayOfWeek}`);
          const newStartTime = new Date(baseDate);
          newStartTime.setHours(new Date(b.startTime).getHours(), new Date(b.startTime).getMinutes());
          const newEndTime = new Date(baseDate);
          newEndTime.setHours(new Date(b.endTime).getHours(), new Date(b.endTime).getMinutes());
          
          return {
              courtId: b.courtId,
              courtType: b.courtType,
              groupId: b.groupId,
              startTime: newStartTime,
              endTime: newEndTime,
              cost: 0,
              notes: b.notes,
          } as Omit<Booking, 'id'>
      });

      const newTemplate: ScheduleTemplate = { id: `template-${Date.now()}`, name, bookings: templateBookings };
      setScheduleTemplates(prev => [...prev, newTemplate]);
      setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Schedule saved as template "${name}".`, timestamp: new Date(), read: false}, ...prev]);
  };

  const applyScheduleTemplate = (templateId: string, weekStartDate: Date): { success: boolean, message: string } => {
      const template = scheduleTemplates.find(t => t.id === templateId);
      if (!template) return { success: false, message: "Template not found." };

      const newBookings: Booking[] = [];
      for (const templateBooking of template.bookings) {
          const templateDate = new Date(templateBooking.startTime);
          const dayOfWeek = templateDate.getDay();

          const targetDate = new Date(weekStartDate);
          targetDate.setDate(weekStartDate.getDate() + (dayOfWeek - weekStartDate.getDay()));

          const newStartTime = new Date(targetDate);
          newStartTime.setHours(templateDate.getHours(), templateDate.getMinutes());
          const newEndTime = new Date(targetDate);
          newEndTime.setHours(new Date(templateBooking.endTime).getHours(), new Date(templateBooking.endTime).getMinutes());

          const conflict = getBookingConflicts(templateBooking.courtId, newStartTime, newEndTime, { groupId: templateBooking.groupId });
          if (conflict.conflict) {
              return { success: false, message: `Conflict detected for Court ${templateBooking.courtId} on ${newStartTime.toLocaleDateString()}: ${conflict.message}` };
          }
          newBookings.push({
            ...templateBooking,
            id: `booking-${Date.now()}-${Math.random()}`,
            startTime: newStartTime,
            endTime: newEndTime,
          });
      }
      setBookings(prev => [...prev, ...newBookings]);
      setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Template "${template.name}" applied successfully.`, timestamp: new Date(), read: false}, ...prev]);
      return { success: true, message: 'Template applied!' };
  };

  const blockSlot = (slot: Omit<BlockedSlot, 'id'>) => {
      const conflict = getBookingConflicts(slot.courtId, slot.startTime, slot.endTime, {});
      if(conflict.conflict && conflict.reason === 'court') {
        setNotifications(prev => [{id: `notif-${Date.now()}`, message: `Could not block slot. It conflicts with an existing booking.`, timestamp: new Date(), read: false}, ...prev]);
        return;
      }
      const newBlockedSlot: BlockedSlot = {...slot, id: `blocked-${Date.now()}`};
      setBlockedSlots(prev => [...prev, newBlockedSlot]);
  };

  const unblockSlot = (slotId: string) => {
      setBlockedSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const deleteGroup = (groupId: string) => {
    const groupName = groups.find(g => g.id === groupId)?.name || 'the deleted group';
    const singleBookingIdsToDelete = new Set(bookings.filter(b => b.groupId === groupId).map(b => b.id));
    if (singleBookingIdsToDelete.size > 0) {
        setBookings(prev => prev.filter(b => !singleBookingIdsToDelete.has(b.id)));
    }
    const recurringRulesToDelete = recurringBookingRules.filter(r => r.groupId === groupId).length;
    if (recurringRulesToDelete > 0) {
        setRecurringBookingRules(prev => prev.filter(r => r.groupId !== groupId));
    }
    const totalCancelled = singleBookingIdsToDelete.size + recurringRulesToDelete;
    if (totalCancelled > 0) {
       setNotifications(prev => [{id: `notif-${Date.now()}`, message: `All future sessions for "${groupName}" were cancelled.`, timestamp: new Date(), read: false}, ...prev]);
    }
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };
  
  const addMessageToGroup = (groupId: string, messageText: string) => setGroups(pgs => pgs.map(g => g.id === groupId ? { ...g, messages: [...g.messages, {id: `msg-${Date.now()}`, userId: currentUser.id, text: messageText, timestamp: new Date()}] } : g));
  const joinEvent = (eventId: string) => setEvents(pes => pes.map(e => e.id === eventId && e.attendees.length < e.maxAttendees && !e.attendees.includes(currentUser.id) ? { ...e, attendees: [...e.attendees, currentUser.id] } : e));
  const leaveEvent = (eventId: string) => setEvents(pes => pes.map(e => e.id === eventId ? { ...e, attendees: e.attendees.filter(id => id !== currentUser.id) } : e));
  const markNotificationAsRead = (notificationId: string) => setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  const addEvent = (eventDetails: Omit<ClubEvent, 'id'|'attendees'>) => setEvents(prev => [{...eventDetails, id:`event-${Date.now()}`, attendees:[]}, ...prev]);
  const deleteEvent = (eventId: string) => setEvents(prev => prev.filter(event => event.id !== eventId));
  const addGroup = (groupDetails: Pick<Group, 'name'|'description'>) => setGroups(prev => [...prev, {...groupDetails, id: `group-${Date.now()}`, members: [], messages: []}]);
  const updateGroup = (groupId: string, updates: Pick<Group, 'name'|'description'>) => setGroups(prev => prev.map(g => (g.id === groupId ? { ...g, ...updates } : g)));
  const moveUserToGroup = (userId: string, targetGroupId: string | null) => {
    setGroups(prevGroups => {
      const groupsWithoutUser = prevGroups.map(g => ({ ...g, members: g.members.filter(mId => mId !== userId) }));
      if (targetGroupId) {
        return groupsWithoutUser.map(g => g.id === targetGroupId ? { ...g, members: [...g.members, userId] } : g);
      }
      return groupsWithoutUser;
    });
  };

  return { 
    currentUser, users, events, groups, allBookings, notifications, recurringBookingRules, scheduleTemplates, blockedSlots,
    addBooking, cancelBooking, createGroupBooking, updateBooking, addMessageToGroup, joinEvent, leaveEvent, markNotificationAsRead,
    addEvent, deleteEvent, addGroup, updateGroup, deleteGroup, moveUserToGroup, addRecurringBooking, blockSlot, unblockSlot,
    saveScheduleAsTemplate, applyScheduleTemplate, getBookingConflicts
  };
};