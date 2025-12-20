export enum UserRole {
  Member = 'Member',
  Admin = 'Admin',
  Coach = 'Coach',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: UserRole;
  credits: number;
}

export interface ClubEvent {
  id:string;
  title: string;
  type: 'Social' | 'Training' | 'Tournament';
  startTime: Date;
  endTime: Date;
  attendees: string[]; // array of user IDs
  maxAttendees: number;
}

export interface GroupMessage {
  id: string;
  userId: string;
  text: string;
  timestamp: Date;
}

export interface Group {
  id:string;
  name: string;
  description: string;
  members: string[]; // array of user IDs
  messages: GroupMessage[];
}

export interface Booking {
  id: string;
  courtId: number;
  courtType: 'Indoor' | 'Outdoor';
  userId?: string;
  groupId?: string;
  startTime: Date;
  endTime: Date;
  cost: number;
  notes?: string;
  recurringRuleId?: string;
  isException?: boolean; // True if this is a modified instance of a recurring booking
  isCancelled?: boolean; // True if this is a cancellation exception for a recurring booking
}

export interface RecurringBookingRule {
    id: string;
    groupId: string;
    courtId: number;
    startTime: { hour: number; minute: number }; // Time of day
    endTime: { hour: number; minute: number };
    daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
    seriesStartDate: Date;
    seriesEndDate: Date;
    notes?: string;
}

export interface ScheduleTemplate {
    id: string;
    name: string;
    bookings: Omit<Booking, 'id' | 'userId'>[];
}

export interface BlockedSlot {
    id: string;
    courtId: number;
    startTime: Date;
    endTime: Date;
    reason: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type AppView = 'dashboard' | 'groups' | 'booking' | 'coach' | 'planner';

export interface ConflictCheckResult {
  conflict: boolean;
  reason?: 'court' | 'coach' | 'blocked';
  message?: string;
}
