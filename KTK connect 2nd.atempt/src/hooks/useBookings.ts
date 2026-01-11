import { useMemo, useState } from 'react';
import {
  Booking,
  Group,
  RecurringBookingRule,
  ScheduleTemplate,
  BlockedSlot,
  ConflictCheckResult,
  User,
  UserRole,
} from '@/types';
import {
  mockBookings,
  mockRecurringBookings as mockRecurringBookingRules,
  mockScheduleTemplates,
  mockBlockedSlots,
} from '../data/mockData';
import { INDOOR_COURTS } from '@/constants';

export interface UseBookingsReturnType {
  allBookings: Booking[];
  recurringBookingRules: RecurringBookingRule[];
  scheduleTemplates: ScheduleTemplate[];
  blockedSlots: BlockedSlot[];
  addBooking: (booking: Omit<Booking, 'id' | 'userId'>, paymentMethod: 'credits' | 'card') => { success: boolean; message: string };
  cancelBooking: (bookingId: string, options?: { scope?: 'single' | 'series' }) => void;
  createGroupBooking: (groupId: string, courtId: number, startTime: Date, endTime: Date, notes?: string) => Booking | null;
  updateBooking: (bookingId: string, updates: Partial<Booking>, editSeries: boolean) => boolean;
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
  removeGroupBookings: (groupId: string, groupName: string) => void;
}

interface UseBookingsParams {
  currentUser: User;
  users: User[];
  groups: Group[];
  addNotification: (message: string) => void;
  applyUserCreditUpdates: (updates: Record<string, number>) => void;
}

export const useBookings = ({
  currentUser,
  users,
  groups,
  addNotification,
  applyUserCreditUpdates,
}: UseBookingsParams): UseBookingsReturnType => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [recurringBookingRules, setRecurringBookingRules] = useState<RecurringBookingRule[]>(mockRecurringBookingRules);
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

          const hasException = bookings.some(
            b => b.recurringRuleId === rule.id && new Date(b.startTime).toDateString() === startTime.toDateString()
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
    const visibleBookings = bookings.filter(b => !b.isCancelled);
    return [...visibleBookings, ...generatedBookings].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [bookings, recurringBookingRules]);

  const getBookingConflicts = (
    courtId: number,
    startTime: Date,
    endTime: Date,
    options: { excludeBookingId?: string; groupId?: string }
  ): ConflictCheckResult => {
    const { excludeBookingId, groupId } = options;
    const checkTime = new Date(startTime).getTime();
    const endCheckTime = new Date(endTime).getTime();

    const allRelevantBookings = allBookings.filter(
      b => b.id !== excludeBookingId && (!b.recurringRuleId || b.id !== `${b.recurringRuleId}-${startTime.getTime()}`)
    );

    const courtConflictBooking = allRelevantBookings.find(
      b =>
        b.courtId === courtId &&
        new Date(b.startTime).getTime() < endCheckTime &&
        new Date(b.endTime).getTime() > checkTime
    );
    if (courtConflictBooking) {
      return { conflict: true, reason: 'court', message: `Court ${courtId} is already booked at this time.` };
    }

    const blockedSlotConflict = blockedSlots.find(
      s =>
        s.courtId === courtId &&
        new Date(s.startTime).getTime() < endCheckTime &&
        new Date(s.endTime).getTime() > checkTime
    );
    if (blockedSlotConflict) {
      return { conflict: true, reason: 'blocked', message: `Court ${courtId} is blocked for ${blockedSlotConflict.reason} at this time.` };
    }

    if (groupId) {
      const currentGroup = groups.find(g => g.id === groupId);
      if (!currentGroup) return { conflict: false };

      const coach = users.find(u => currentGroup.members.includes(u.id) && u.role === UserRole.Coach);
      if (coach) {
        const coachGroups = groups.filter(g => g.members.includes(coach.id));
        const coachGroupIds = new Set(coachGroups.map(g => g.id));

        const coachConflictBooking = allRelevantBookings.find(
          b =>
            b.groupId &&
            b.groupId !== groupId &&
            coachGroupIds.has(b.groupId) &&
            new Date(b.startTime).getTime() < endCheckTime &&
            new Date(b.endTime).getTime() > checkTime
        );

        if (coachConflictBooking) {
          const conflictGroup = groups.find(g => g.id === coachConflictBooking.groupId);
          return {
            conflict: true,
            reason: 'coach',
            message: `Coach ${coach.name} is already scheduled with "${conflictGroup?.name}" on Court ${coachConflictBooking.courtId} at this time.`,
          };
        }
      }
    }

    return { conflict: false };
  };

  const addBooking = (
    booking: Omit<Booking, 'id' | 'userId'>,
    paymentMethod: 'credits' | 'card'
  ): { success: boolean; message: string } => {
    const conflict = getBookingConflicts(booking.courtId, booking.startTime, booking.endTime, {});
    if (conflict.conflict) {
      return { success: false, message: conflict.message || 'This time slot is unavailable.' };
    }

    if (paymentMethod === 'credits') {
      if (currentUser.credits < booking.cost) {
        return { success: false, message: 'Insufficient credits for this booking.' };
      }
      applyUserCreditUpdates({ [currentUser.id]: -booking.cost });
    }

    const newBooking: Booking = { ...booking, id: `booking-${Date.now()}`, userId: currentUser.id };
    setBookings(prev => [...prev, newBooking]);
    addNotification(
      `Court ${booking.courtId} booked for ${booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    );
    return { success: true, message: 'Booking successful!' };
  };

  const cancelBooking = (bookingId: string, options?: { scope?: 'single' | 'series' }) => {
    const bookingToCancel = allBookings.find(b => b.id === bookingId);
    if (!bookingToCancel) return;

    const scope = options?.scope;

    if (bookingToCancel.recurringRuleId && !scope) {
      addNotification('Please choose whether to cancel this occurrence or the entire series.');
      return;
    }

    const refundCredits = (bookingsToRefund: Booking[]) => {
      const userCreditUpdates: Record<string, number> = {};
      bookingsToRefund.forEach(booking => {
        if (booking.userId && booking.cost > 0) {
          userCreditUpdates[booking.userId] = (userCreditUpdates[booking.userId] || 0) + booking.cost;
        }
      });

      applyUserCreditUpdates(userCreditUpdates);
    };

    if (bookingToCancel.recurringRuleId && scope === 'series') {
      const ruleId = bookingToCancel.recurringRuleId;
      const rule = recurringBookingRules.find(r => r.id === ruleId);
      const ruleGroup = groups.find(g => g.id === rule?.groupId);
      const relatedBookings = bookings.filter(b => b.recurringRuleId === ruleId);

      refundCredits(relatedBookings);
      setBookings(prev => prev.filter(b => b.recurringRuleId !== ruleId));
      setRecurringBookingRules(prev => prev.filter(r => r.id !== ruleId));

      const seriesMessage = ruleGroup
        ? `Entire recurring series for "${ruleGroup.name}" was cancelled.`
        : `Entire recurring series on Court ${bookingToCancel.courtId} was cancelled.`;
      addNotification(seriesMessage);
      return;
    }

    if (bookingToCancel.recurringRuleId && scope === 'single') {
      const occurrenceDate = new Date(bookingToCancel.startTime).toDateString();
      const ruleGroup = groups.find(g => g.id === bookingToCancel.groupId);

      refundCredits([bookingToCancel]);
      setBookings(prev => {
        const remaining = prev.filter(
          b => !(b.recurringRuleId === bookingToCancel.recurringRuleId && new Date(b.startTime).toDateString() === occurrenceDate)
        );
        const cancellationException: Booking = {
          ...bookingToCancel,
          id: `booking-${Date.now()}`,
          isException: true,
          isCancelled: true,
        };
        return [...remaining, cancellationException];
      });

      const dateLabel = bookingToCancel.startTime.toLocaleDateString();
      const timeLabel = bookingToCancel.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const occurrenceMessage = ruleGroup
        ? `This occurrence of "${ruleGroup.name}" on ${dateLabel} at ${timeLabel} was cancelled.`
        : `This occurrence on Court ${bookingToCancel.courtId} on ${dateLabel} at ${timeLabel} was cancelled.`;
      addNotification(occurrenceMessage);
      return;
    }

    if (bookingToCancel.userId && bookingToCancel.cost > 0) {
      applyUserCreditUpdates({ [bookingToCancel.userId]: bookingToCancel.cost });
    }

    setBookings(prev => prev.filter(b => b.id !== bookingId));

    let notifMessage = `Booking on Court ${bookingToCancel.courtId} at ${bookingToCancel.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} cancelled.`;
    if (bookingToCancel.groupId) {
      const group = groups.find(g => g.id === bookingToCancel.groupId);
      notifMessage = `Session for "${group?.name}" on Court ${bookingToCancel.courtId} at ${bookingToCancel.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} was cancelled.`;
    }
    addNotification(notifMessage);
  };

  const cancelMultipleBookings = (bookingIds: string[]) => {
    const userCreditUpdates: Record<string, number> = {};
    const actualBookingIdsToDelete = new Set<string>();

    bookingIds.forEach(id => {
      const booking = allBookings.find(b => b.id === id);
      if (booking && (!booking.recurringRuleId || booking.isException)) {
        actualBookingIdsToDelete.add(booking.id);
        if (booking.userId && booking.cost > 0) {
          userCreditUpdates[booking.userId] = (userCreditUpdates[booking.userId] || 0) + booking.cost;
        }
      }
    });

    applyUserCreditUpdates(userCreditUpdates);

    setBookings(prev => prev.filter(b => !actualBookingIdsToDelete.has(b.id)));
    addNotification(`${actualBookingIdsToDelete.size} sessions have been cancelled.`);
  };

  const moveMultipleBookings = (bookingIds: Set<string>, primaryBookingId: string, newPrimaryStartTime: Date): boolean => {
    const primaryBooking = allBookings.find(b => b.id === primaryBookingId);
    if (!primaryBooking) return false;

    const timeDiff = newPrimaryStartTime.getTime() - new Date(primaryBooking.startTime).getTime();
    const bookingsToUpdate: Booking[] = [];

    for (const id of bookingIds) {
      const booking = allBookings.find(b => b.id === id);
      if (!booking) continue;

      const duration = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
      const newStartTime = new Date(new Date(booking.startTime).getTime() + timeDiff);
      const newEndTime = new Date(newStartTime.getTime() + duration);

      const conflict = getBookingConflicts(booking.courtId, newStartTime, newEndTime, { excludeBookingId: id, groupId: booking.groupId });
      if (conflict.conflict) {
        addNotification(`Bulk move failed: ${conflict.message}`);
        return false;
      }

      bookingsToUpdate.push({
        ...booking,
        id: booking.isException ? booking.id : `booking-${Date.now()}-${Math.random()}`,
        startTime: newStartTime,
        endTime: newEndTime,
        isException: booking.recurringRuleId ? true : undefined,
      });
    }

    setBookings(prev => {
      const originalIds = new Set(bookingIds);
      const otherBookings = prev.filter(b => !originalIds.has(b.id));
      return [...otherBookings, ...bookingsToUpdate];
    });

    addNotification(`${bookingIds.size} sessions have been moved successfully.`);
    return true;
  };

  const createGroupBooking = (
    groupId: string,
    courtId: number,
    startTime: Date,
    endTime: Date,
    notes?: string
  ): Booking | null => {
    const conflict = getBookingConflicts(courtId, startTime, endTime, { groupId });
    const group = groups.find(g => g.id === groupId);
    if (conflict.conflict) {
      addNotification(`Failed to schedule group: ${conflict.message}`);
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
    addNotification(
      `New session for "${group?.name}" scheduled on Court ${courtId} at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    );
    return newBooking;
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>, editSeries: boolean): boolean => {
    const originalBooking = allBookings.find(b => b.id === bookingId);
    if (!originalBooking) return false;

    if (originalBooking.recurringRuleId && editSeries) {
      const rule = recurringBookingRules.find(r => r.id === originalBooking.recurringRuleId);
      if (!rule) return false;

      const newRule: RecurringBookingRule = { ...rule, notes: updates.notes ?? rule.notes };

      if (updates.groupId) newRule.groupId = updates.groupId;
      if (updates.courtId) newRule.courtId = updates.courtId;

      if (updates.startTime) {
        const newStartTime = new Date(updates.startTime);
        newRule.startTime = { hour: newStartTime.getHours(), minute: newStartTime.getMinutes() };
      }
      if (updates.endTime) {
        const newEndTime = new Date(updates.endTime);
        newRule.endTime = { hour: newEndTime.getHours(), minute: newEndTime.getMinutes() };
      }

      setRecurringBookingRules(prev => prev.map(r => (r.id === newRule.id ? newRule : r)));
      addNotification(`Recurring series for "${groups.find(g => g.id === newRule.groupId)?.name}" was updated.`);
      return true;
    }

    const updatedBookingFields = { ...originalBooking, ...updates };

    const conflict = getBookingConflicts(updatedBookingFields.courtId, updatedBookingFields.startTime, updatedBookingFields.endTime, {
      excludeBookingId: bookingId,
      groupId: updatedBookingFields.groupId,
    });
    if (conflict.conflict) {
      addNotification(`Failed to update: ${conflict.message}`);
      return false;
    }

    if (updates.courtId) {
      updatedBookingFields.courtType = INDOOR_COURTS.includes(updates.courtId) ? 'Indoor' : 'Outdoor';
    }

    if (originalBooking.recurringRuleId && !editSeries) {
      const newException = { ...updatedBookingFields, isException: true, id: `booking-${Date.now()}` };
      setBookings(prev => [...prev, newException]);
    } else {
      setBookings(prev => prev.map(b => (b.id === bookingId ? updatedBookingFields : b)));
    }

    const group = groups.find(g => g.id === updatedBookingFields.groupId);
    addNotification(`Session for "${group?.name}" on ${updatedBookingFields.startTime.toLocaleDateString()} was updated.`);
    return true;
  };

  const addRecurringBooking = (ruleDetails: Omit<RecurringBookingRule, 'id'>) => {
    const newRule: RecurringBookingRule = { ...ruleDetails, id: `recurring-${Date.now()}` };
    const firstInstanceStartTime = new Date(newRule.seriesStartDate);
    const dayDiff = (newRule.daysOfWeek[0] - firstInstanceStartTime.getDay() + 7) % 7;
    firstInstanceStartTime.setDate(firstInstanceStartTime.getDate() + dayDiff);
    firstInstanceStartTime.setHours(newRule.startTime.hour, newRule.startTime.minute);

    const firstInstanceEndTime = new Date(firstInstanceStartTime);
    firstInstanceEndTime.setHours(newRule.endTime.hour, newRule.endTime.minute);

    const conflict = getBookingConflicts(newRule.courtId, firstInstanceStartTime, firstInstanceEndTime, { groupId: newRule.groupId });
    if (conflict.conflict) {
      addNotification(`Could not create recurring session: ${conflict.message}`);
      return false;
    }

    setRecurringBookingRules(prev => [...prev, newRule]);
    const group = groups.find(g => g.id === newRule.groupId);
    addNotification(`New recurring series for "${group?.name}" created.`);
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
      } as Omit<Booking, 'id' | 'userId'>;
    });

    const newTemplate: ScheduleTemplate = { id: `template-${Date.now()}`, name, bookings: templateBookings };
    setScheduleTemplates(prev => [...prev, newTemplate]);
    addNotification(`Schedule saved as template "${name}".`);
  };

  const applyScheduleTemplate = (templateId: string, weekStartDate: Date): { success: boolean; message: string } => {
    const template = scheduleTemplates.find(t => t.id === templateId);
    if (!template) return { success: false, message: 'Template not found.' };

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
        return {
          success: false,
          message: `Conflict detected for Court ${templateBooking.courtId} on ${newStartTime.toLocaleDateString()}: ${conflict.message}`,
        };
      }
      newBookings.push({
        ...templateBooking,
        id: `booking-${Date.now()}-${Math.random()}`,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
    setBookings(prev => [...prev, ...newBookings]);
    addNotification(`Template "${template.name}" applied successfully.`);
    return { success: true, message: 'Template applied!' };
  };

  const blockSlot = (slot: Omit<BlockedSlot, 'id'>) => {
    const conflict = getBookingConflicts(slot.courtId, slot.startTime, slot.endTime, {});
    if (conflict.conflict && conflict.reason === 'court') {
      addNotification('Could not block slot. It conflicts with an existing booking.');
      return;
    }
    const newBlockedSlot: BlockedSlot = { ...slot, id: `blocked-${Date.now()}` };
    setBlockedSlots(prev => [...prev, newBlockedSlot]);
  };

  const unblockSlot = (slotId: string) => {
    setBlockedSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const removeGroupBookings = (groupId: string, groupName: string) => {
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
      addNotification(`All future sessions for "${groupName}" were cancelled.`);
    }
  };

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
    removeGroupBookings,
  };
};
