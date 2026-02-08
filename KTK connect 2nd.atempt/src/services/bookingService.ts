import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebase';

export type BookingStatus = 'active' | 'cancelled';

export interface BookingRecord {
  id: string;
  courtId: string;
  userId: string;
  groupId?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: BookingStatus;
  createdAt: Timestamp;
}

export interface BookingRule {
  id: string;
  maxDurationMinutes: number;
  priorityRoleIds: string[];
  isActive: boolean;
}

export interface CreateBookingParams {
  courtId: string;
  userId: string;
  groupId?: string;
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface CancelBookingParams {
  bookingId: string;
}

export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}

export class BookingConflictError extends Error {
  constructor(message = 'Booking conflicts with an existing reservation.') {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export class BookingRuleViolationError extends Error {
  constructor(message = 'Booking violates club booking rules.') {
    super(message);
    this.name = 'BookingRuleViolationError';
  }
}

export class UnauthorizedBookingError extends Error {
  constructor(message = 'You are not authorized to perform this booking action.') {
    super(message);
    this.name = 'UnauthorizedBookingError';
  }
}

const bookingsCollection = collection(db, 'bookings');
const bookingRulesCollection = collection(db, 'bookingRules');
const usersCollection = collection(db, 'users');

const getCurrentUserId = () => auth.currentUser?.uid ?? null;

const getUserRole = async (userId: string) => {
  const snapshot = await getDoc(doc(usersCollection, userId));
  if (!snapshot.exists()) {
    throw new UnauthorizedBookingError('User profile not found.');
  }
  return snapshot.data().role as string;
};

const validateTimeRange = (startTime: Timestamp, endTime: Timestamp) => {
  if (startTime.toMillis() >= endTime.toMillis()) {
    throw new BookingRuleViolationError('Start time must be before end time.');
  }
  const durationMinutes = Math.floor((endTime.toMillis() - startTime.toMillis()) / 60000);
  if (durationMinutes <= 0) {
    throw new BookingRuleViolationError('Booking duration must be greater than zero.');
  }
  return durationMinutes;
};

const enforceBookingRules = async (durationMinutes: number, userRole: string) => {
  if (userRole === 'admin') {
    return;
  }
  const activeRulesQuery = query(bookingRulesCollection, where('isActive', '==', true));
  const rulesSnapshot = await getDocs(activeRulesQuery);
  if (rulesSnapshot.empty) {
    return;
  }
  const maxAllowed = rulesSnapshot.docs
    .map((docSnap) => docSnap.data().maxDurationMinutes as number)
    .filter((value) => typeof value === 'number' && value > 0)
    .reduce((min, value) => Math.min(min, value), Number.POSITIVE_INFINITY);
  if (durationMinutes > maxAllowed) {
    throw new BookingRuleViolationError('Booking duration exceeds club limits.');
  }
};

const buildOverlapQuery = (courtId: string, startTime: Timestamp, endTime: Timestamp) =>
  query(
    bookingsCollection,
    where('courtId', '==', courtId),
    where('status', '==', 'active'),
    where('startTime', '<', endTime),
    where('endTime', '>', startTime)
  );

export async function createBooking(params: CreateBookingParams) {
  const actorId = getCurrentUserId();
  if (!actorId) {
    throw new UnauthorizedBookingError('You must be signed in to create bookings.');
  }

  const { courtId, userId, groupId, startTime, endTime } = params;
  const durationMinutes = validateTimeRange(startTime, endTime);

  const actorRole = await getUserRole(actorId);
  if (actorRole !== 'admin' && actorId !== userId) {
    throw new UnauthorizedBookingError('Users may only create bookings for themselves.');
  }

  await enforceBookingRules(durationMinutes, actorRole);

  return runTransaction(db, async (transaction) => {
    const overlapSnapshot = await transaction.get(buildOverlapQuery(courtId, startTime, endTime));
    if (!overlapSnapshot.empty) {
      throw new BookingConflictError();
    }

    const bookingRef = doc(bookingsCollection);
    const bookingData = {
      courtId,
      userId,
      groupId: groupId ?? null,
      startTime,
      endTime,
      status: 'active' as BookingStatus,
      createdAt: serverTimestamp(),
    };

    transaction.set(bookingRef, bookingData);
    return { id: bookingRef.id, ...bookingData };
  });
}

export async function cancelBooking(params: CancelBookingParams) {
  const actorId = getCurrentUserId();
  if (!actorId) {
    throw new UnauthorizedBookingError('You must be signed in to cancel bookings.');
  }

  const { bookingId } = params;
  const bookingRef = doc(bookingsCollection, bookingId);
  const snapshot = await getDoc(bookingRef);
  if (!snapshot.exists()) {
    throw new BookingRuleViolationError('Booking not found.');
  }

  const booking = snapshot.data() as BookingRecord;
  const actorRole = await getUserRole(actorId);

  if (actorRole !== 'admin' && booking.userId !== actorId) {
    throw new UnauthorizedBookingError('You can only cancel your own bookings.');
  }

  if (actorRole !== 'admin' && booking.startTime.toMillis() <= Timestamp.now().toMillis()) {
    throw new BookingRuleViolationError('Only future bookings can be cancelled.');
  }

  if (booking.status === 'cancelled') {
    return;
  }

  await updateDoc(bookingRef, { status: 'cancelled' });
}

export async function getBookingsForCourt(courtId: string, range: TimeRange) {
  const courtQuery = query(
    bookingsCollection,
    where('courtId', '==', courtId),
    where('startTime', '>=', range.start),
    where('startTime', '<', range.end),
    orderBy('startTime', 'asc')
  );
  const snapshot = await getDocs(courtQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as BookingRecord) }));
}

export async function getBookingsForUser(userId: string) {
  const userQuery = query(bookingsCollection, where('userId', '==', userId), orderBy('startTime', 'desc'));
  const snapshot = await getDocs(userQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as BookingRecord) }));
}
