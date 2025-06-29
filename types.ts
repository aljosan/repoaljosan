export enum AvailabilityStatus {
  ATTENDING = 'ATTENDING',
  MAYBE = 'MAYBE',
  NOT_ATTENDING = 'NOT_ATTENDING',
  PENDING = 'PENDING'
}

export enum EventType {
  MATCH = 'Match',
  TRAINING = 'Training',
  SOCIAL = 'Social'
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  COMMUNITY = 'COMMUNITY',
  GROUPS = 'GROUPS',
  LADDER = 'LADDER',
  FIND_PARTNER = 'FIND_PARTNER',
  BOOKING = 'BOOKING',
  LESSONS = 'LESSONS',
  SURVEYS = 'SURVEYS',
  MEMBERS = 'MEMBERS',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  AI_COACH = 'AI_COACH',
  MY_ACCOUNT = 'MY_ACCOUNT',
  LEARNING_CENTER = 'LEARNING_CENTER',
  SETTINGS = 'SETTINGS',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
}

export enum PaymentStatus {
    UNPAID = 'Unpaid',
    PAID = 'Paid',
}

export interface Member {
  id: string;
  name: string;
  avatarUrl: string;
  clubCredits: number;
  ntfConsent?: boolean;
  ntfId?: string;
  consentAgreedTimestamp?: number;
}

export interface MemberAvailability {
  memberId: string;
  status: AvailabilityStatus;
}

export interface Event {
  id:string;
  title: string;
  type: EventType;
  date: Date;
  location: string;
  description: string;
  availability: MemberAvailability[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Court Booking types
export enum CourtType {
  INDOOR = 'Indoor',
  OUTDOOR = 'Outdoor'
}

export interface Court {
  id: string;
  name: string;
  type: CourtType;
}

export interface Booking {
  id: string;
  courtId: string;
  memberId: string;
  startTime: Date;
  price: number;
  paymentStatus: PaymentStatus;
}

// Survey types
export interface SurveyQuestion {
  id: string;
  text: string;
  options: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  surveyId: string;
  memberId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

// Community Wall types
export interface Post {
  id: string;
  authorId: string;
  timestamp: Date;
  textContent: string;
  videoUrl?: string; // Optional video URL (e.g., YouTube)
}

// Lessons types
export interface Coach {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    specialties: string[];
}

export interface LessonBooking {
    id: string;
    coachId: string;
    memberId: string;
    courtId: string;
    startTime: Date;
    price: number;
    paymentStatus: PaymentStatus;
}

// Groups types
export interface Group {
    id: string;
    name: string;
    description: string;
    memberIds: string[];
    coachId?: string;
}

export interface GroupMessage {
    id: string;
    groupId: string;
    authorId: string;
    timestamp: Date;
    textContent: string;
}

// Ladder types
export interface LadderPlayer {
    memberId: string;
    rank: number;
    wins: number;
    losses: number;
}

export enum ChallengeStatus {
    PENDING = 'Pending',
    ACCEPTED = 'Accepted',
    COMPLETED = 'Completed',
    DECLINED = 'Declined',
}

export interface Challenge {
    id: string;
    challengerId: string;
    challengedId: string;
    status: ChallengeStatus;
    issuedDate: Date;
    resolvedDate?: Date;
    score?: string; // e.g., "6-4, 6-3"
    winnerId?: string;
}

// Find a Partner types
export enum GameType {
    SINGLES = 'Singles',
    DOUBLES = 'Doubles',
}

export enum RequestStatus {
    OPEN = 'Open',
    CLOSED = 'Closed',
}

export interface PartnerRequest {
    id: string;
    memberId: string;
    date: Date;
    timeWindow: string; // e.g., "Morning", "Afternoon"
    gameType: GameType;
    status: RequestStatus;
    timestamp: Date;
}

// Announcements type
export interface Announcement {
    id: string;
    authorId: string; // Should be an admin
    title: string;
    content: string;
    timestamp: Date;
}

// Notifications type
export interface Notification {
    id: string;
    memberId: string;
    message: string;
    link: View;
    relatedId?: string; // e.g., challengeId, groupId
    isRead: boolean;
    timestamp: Date;
}

// Wallet and Payment types
export type PaymentMethod = 'Card' | 'Credits' | 'Awarded';

export interface Transaction {
    id: string;
    memberId: string;
    date: Date;
    description: string;
    amount: number; // positive for credits awarded, negative for payments
    paymentMethod?: PaymentMethod;
}

// Learning Center types
export enum ArticleCategory {
    TECHNICAL = 'Technical',
    TACTICAL = 'Tactical',
    MENTAL = 'Mental',
    PHYSICAL = 'Physical',
}

export interface Article {
    id: string;
    title: string;
    category: ArticleCategory;
    summary: string;
    content: string;
}