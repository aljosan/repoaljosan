import {
  User,
  UserRole,
  ClubEvent,
  Group,
  GroupMessage,
  Booking,
  Notification,
  RecurringBookingRule,
  ScheduleTemplate,
  BlockedSlot,
} from '@/types';

const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setHours(9, 0, 0, 0);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const createDateWithTime = (base: Date, hour: number, minute: number) => {
  const result = new Date(base);
  result.setHours(hour, minute, 0, 0);
  return result;
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: UserRole.Admin,
    credits: 120,
  },
  {
    id: 'user-2',
    name: 'Morgan Lee',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    role: UserRole.Member,
    credits: 80,
  },
  {
    id: 'user-3',
    name: 'Priya Patel',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    role: UserRole.Coach,
    credits: 0,
  },
  {
    id: 'user-4',
    name: 'Samuel Green',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    role: UserRole.Member,
    credits: 45,
  },
];

const groupMessages: GroupMessage[] = [
  {
    id: 'message-1',
    userId: 'user-3',
    text: 'Great job at practice today! Keep up the energy for the tournament.',
    timestamp: addDays(createDateWithTime(now, 18, 0), -1),
  },
  {
    id: 'message-2',
    userId: 'user-2',
    text: 'Thanks coach! Looking forward to the next session.',
    timestamp: addDays(createDateWithTime(now, 18, 15), -1),
  },
];

export const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Advanced Doubles',
    description: 'High intensity drills for advanced doubles strategy.',
    members: ['user-1', 'user-2', 'user-3'],
    messages: groupMessages,
  },
  {
    id: 'group-2',
    name: 'Beginner Clinic',
    description: 'Fundamentals and friendly matches for new members.',
    members: ['user-3', 'user-4'],
    messages: [
      {
        id: 'message-3',
        userId: 'user-3',
        text: 'Reminder: bring water and arrive 10 minutes early.',
        timestamp: addDays(createDateWithTime(now, 9, 30), -2),
      },
    ],
  },
];

export const mockEvents: ClubEvent[] = [
  {
    id: 'event-1',
    title: 'Friday Night Social',
    type: 'Social',
    startTime: createDateWithTime(addDays(startOfWeek, 4), 19, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 4), 21, 0),
    attendees: ['user-1', 'user-2', 'user-4'],
    maxAttendees: 20,
  },
  {
    id: 'event-2',
    title: 'Tournament Qualifiers',
    type: 'Tournament',
    startTime: createDateWithTime(addDays(startOfWeek, 5), 9, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 5), 15, 0),
    attendees: ['user-1', 'user-2'],
    maxAttendees: 32,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    courtId: 1,
    courtType: 'Indoor',
    userId: 'user-1',
    startTime: createDateWithTime(addDays(startOfWeek, 1), 10, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 1), 11, 30),
    cost: 12,
    notes: 'Warm-up session before coaching.',
  },
  {
    id: 'booking-2',
    courtId: 2,
    courtType: 'Indoor',
    groupId: 'group-1',
    startTime: createDateWithTime(addDays(startOfWeek, 2), 18, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 2), 19, 30),
    cost: 0,
    notes: 'Advanced drills with Coach Priya.',
    recurringRuleId: 'recurring-1',
    isException: true,
  },
  {
    id: 'booking-3',
    courtId: 4,
    courtType: 'Outdoor',
    userId: 'user-2',
    startTime: createDateWithTime(addDays(startOfWeek, 3), 7, 30),
    endTime: createDateWithTime(addDays(startOfWeek, 3), 8, 30),
    cost: 8,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notification-1',
    message: 'Court 2 maintenance scheduled for Wednesday 1-3pm.',
    timestamp: addDays(createDateWithTime(now, 12, 0), -2),
    read: false,
  },
  {
    id: 'notification-2',
    message: 'New member Samuel Green joined Beginner Clinic.',
    timestamp: addDays(createDateWithTime(now, 14, 30), -3),
    read: true,
  },
];

export const mockRecurringBookings: RecurringBookingRule[] = [
  {
    id: 'recurring-1',
    groupId: 'group-1',
    courtId: 2,
    startTime: { hour: 18, minute: 0 },
    endTime: { hour: 19, minute: 30 },
    daysOfWeek: [2, 4],
    seriesStartDate: addDays(startOfWeek, -14),
    seriesEndDate: addDays(startOfWeek, 28),
    notes: 'Weekly high-performance training.',
  },
  {
    id: 'recurring-2',
    groupId: 'group-2',
    courtId: 5,
    startTime: { hour: 9, minute: 0 },
    endTime: { hour: 10, minute: 0 },
    daysOfWeek: [1, 3],
    seriesStartDate: addDays(startOfWeek, -7),
    seriesEndDate: addDays(startOfWeek, 21),
  },
];

export const mockScheduleTemplates: ScheduleTemplate[] = [
  {
    id: 'template-1',
    name: 'Weekend Tournament Prep',
    bookings: [
      {
        courtId: 1,
        courtType: 'Indoor',
        groupId: 'group-1',
        startTime: createDateWithTime(addDays(startOfWeek, 6), 10, 0),
        endTime: createDateWithTime(addDays(startOfWeek, 6), 12, 0),
        cost: 0,
        notes: 'Strategy session',
        recurringRuleId: 'recurring-1',
      },
      {
        courtId: 3,
        courtType: 'Indoor',
        groupId: 'group-2',
        startTime: createDateWithTime(addDays(startOfWeek, 6), 12, 30),
        endTime: createDateWithTime(addDays(startOfWeek, 6), 13, 30),
        cost: 0,
        notes: 'Skill building drills',
      },
    ],
  },
  {
    id: 'template-2',
    name: 'Morning Singles Focus',
    bookings: [
      {
        courtId: 4,
        courtType: 'Outdoor',
        startTime: createDateWithTime(addDays(startOfWeek, 1), 7, 0),
        endTime: createDateWithTime(addDays(startOfWeek, 1), 8, 30),
        cost: 10,
        notes: 'Conditioning drills',
      },
    ],
  },
];

export const mockBlockedSlots: BlockedSlot[] = [
  {
    id: 'blocked-1',
    courtId: 2,
    startTime: createDateWithTime(addDays(startOfWeek, 3), 13, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 3), 15, 0),
    reason: 'Resurfacing',
  },
  {
    id: 'blocked-2',
    courtId: 6,
    startTime: createDateWithTime(addDays(startOfWeek, 5), 8, 0),
    endTime: createDateWithTime(addDays(startOfWeek, 5), 9, 30),
    reason: 'Junior camp',
  },
];
