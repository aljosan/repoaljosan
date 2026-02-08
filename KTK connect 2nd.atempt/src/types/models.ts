import { UserRole } from './roles';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  linkedPlayerIds?: string[];
  coachGroupIds?: string[];
  createdAt: string;
}

export interface Court {
  id: string;
  name: string;
  surface: string;
  isIndoor: boolean;
}

export interface BookingRule {
  id: string;
  title: string;
  maxDurationMinutes: number;
  priorityRoleIds: UserRole[];
  isActive: boolean;
}

export interface CourtBooking {
  id: string;
  courtId: string;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface TrainingGroup {
  id: string;
  name: string;
  coachId: string;
  level: string;
  ageBand: string;
  playerIds: string[];
}

export interface TrainingSession {
  id: string;
  groupId: string;
  courtId: string;
  startTime: string;
  durationMinutes: number;
  focus: 'technical' | 'tactical' | 'physical' | 'mental';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  playerId: string;
  status: 'present' | 'absent' | 'injured';
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  authorId: string;
  groupId?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  sentAt: string;
  isRead: boolean;
}
