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
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type FocusType = 'technical' | 'tactical' | 'physical' | 'mental';

export interface SessionRecord {
  id: string;
  groupId: string;
  courtId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  durationMinutes: number;
  focus: FocusType;
  notes?: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface CreateSessionParams {
  actorUid: string;
  groupId: string;
  courtId: string;
  startTime: Timestamp;
  durationMinutes: number;
  focus: FocusType;
  notes?: string;
}

export interface UpdateSessionParams {
  actorUid: string;
  sessionId: string;
  patch: Partial<Pick<SessionRecord, 'courtId' | 'startTime' | 'durationMinutes' | 'focus' | 'notes'>>;
}

export interface DeleteSessionParams {
  actorUid: string;
  sessionId: string;
}

export interface SessionsForWeekParams {
  actorUid: string;
  weekStart: Date | Timestamp;
  weekEnd: Date | Timestamp;
  groupId?: string;
}

export interface SessionsForGroupParams {
  actorUid: string;
  groupId: string;
  range?: { start: Date | Timestamp; end: Date | Timestamp };
}

export class UnauthorizedSessionError extends Error {
  constructor(message = 'You are not authorized to perform this session action.') {
    super(message);
    this.name = 'UnauthorizedSessionError';
  }
}

export class SessionValidationError extends Error {
  constructor(message = 'Session validation failed.') {
    super(message);
    this.name = 'SessionValidationError';
  }
}

export class SessionConflictError extends Error {
  constructor(message = 'Session conflicts with an existing court booking.') {
    super(message);
    this.name = 'SessionConflictError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Requested resource was not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

const MAX_DURATION_MINUTES = 240;
const MAX_DURATION_MS = MAX_DURATION_MINUTES * 60 * 1000;

const sessionsCollection = collection(db, 'sessions');
const usersCollection = collection(db, 'users');
const groupsCollection = collection(db, 'groups');

const isTimestamp = (value: unknown): value is Timestamp => value instanceof Timestamp;

const normalizeTimestamp = (value: Date | Timestamp) =>
  value instanceof Timestamp ? value : Timestamp.fromDate(value);

const getUserProfile = async (uid: string) => {
  const snapshot = await getDoc(doc(usersCollection, uid));
  if (!snapshot.exists()) {
    throw new UnauthorizedSessionError('User profile not found.');
  }
  return snapshot.data() as {
    role: 'admin' | 'coach' | 'player' | 'parent';
    coachGroupIds?: string[];
    linkedPlayerIds?: string[];
  };
};

const getGroup = async (groupId: string) => {
  const snapshot = await getDoc(doc(groupsCollection, groupId));
  if (!snapshot.exists()) {
    throw new NotFoundError('Group not found.');
  }
  return snapshot.data() as { coachId: string; playerIds: string[] };
};

const validateFocus = (focus: FocusType) => {
  const allowed: FocusType[] = ['technical', 'tactical', 'physical', 'mental'];
  if (!allowed.includes(focus)) {
    throw new SessionValidationError('Focus value is invalid.');
  }
};

const validateDuration = (durationMinutes: number) => {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new SessionValidationError('Duration must be greater than zero.');
  }
  if (durationMinutes > MAX_DURATION_MINUTES) {
    throw new SessionValidationError(`Duration must be <= ${MAX_DURATION_MINUTES} minutes.`);
  }
};

const ensureTimestamp = (startTime: Timestamp) => {
  if (!isTimestamp(startTime)) {
    throw new SessionValidationError('Start time must be a Firestore Timestamp.');
  }
};

const sessionEndTime = (startTime: Timestamp, durationMinutes: number) =>
  Timestamp.fromMillis(startTime.toMillis() + durationMinutes * 60 * 1000);

const resolvedSessionEndTime = (session: SessionRecord) =>
  session.endTime ?? sessionEndTime(session.startTime, session.durationMinutes);

const chunk = <T,>(items: T[], size: number) =>
  items.reduce<T[][]>((acc, item, index) => {
    if (index % size === 0) {
      acc.push([]);
    }
    acc[acc.length - 1].push(item);
    return acc;
  }, []);

const assertActorCanManageGroup = (role: string, actorUid: string, groupId: string, coachGroupIds?: string[]) => {
  if (role === 'admin') {
    return;
  }
  if (role === 'coach') {
    if (!coachGroupIds || !coachGroupIds.includes(groupId)) {
      throw new UnauthorizedSessionError('Coach does not have access to this group.');
    }
    return;
  }
  throw new UnauthorizedSessionError('Only admins or coaches can manage sessions.');
};

const assertActorCanReadGroup = (
  role: string,
  actorUid: string,
  groupId: string,
  groupPlayerIds: string[],
  coachGroupIds?: string[],
  linkedPlayerIds?: string[]
) => {
  if (role === 'admin') {
    return;
  }
  if (role === 'coach') {
    if (!coachGroupIds || !coachGroupIds.includes(groupId)) {
      throw new UnauthorizedSessionError('Coach does not have access to this group.');
    }
    return;
  }
  if (role === 'player') {
    if (!groupPlayerIds.includes(actorUid)) {
      throw new UnauthorizedSessionError('Player does not belong to this group.');
    }
    return;
  }
  if (role === 'parent') {
    if (!linkedPlayerIds || !groupPlayerIds.some((playerId) => linkedPlayerIds.includes(playerId))) {
      throw new UnauthorizedSessionError('Parent has no linked players in this group.');
    }
    return;
  }
  throw new UnauthorizedSessionError('Unknown role.');
};

const loadGroupIdsForPlayer = async (playerId: string) => {
  const groupQuery = query(groupsCollection, where('playerIds', 'array-contains', playerId));
  const snapshot = await getDocs(groupQuery);
  return snapshot.docs.map((docSnap) => docSnap.id);
};

const loadGroupIdsForLinkedPlayers = async (linkedPlayerIds: string[]) => {
  if (linkedPlayerIds.length === 0) {
    return [];
  }
  const batches = chunk(linkedPlayerIds, 10);
  const groupIds = new Set<string>();
  for (const batch of batches) {
    const groupQuery = query(groupsCollection, where('playerIds', 'array-contains-any', batch));
    const snapshot = await getDocs(groupQuery);
    snapshot.docs.forEach((docSnap) => groupIds.add(docSnap.id));
  }
  return Array.from(groupIds);
};

const querySessionsForGroupIds = async (groupIds: string[], start: Timestamp, end: Timestamp) => {
  const chunks = chunk(groupIds, 10);
  const results: SessionRecord[] = [];
  for (const groupChunk of chunks) {
    const sessionsQuery = query(
      sessionsCollection,
      where('groupId', 'in', groupChunk),
      where('startTime', '>=', start),
      where('startTime', '<', end),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(sessionsQuery);
    snapshot.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...(docSnap.data() as SessionRecord) });
    });
  }
  return results.sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
};

const detectCourtConflict = (sessions: SessionRecord[], candidateStart: Timestamp, candidateDuration: number, ignoreId?: string) => {
  const candidateEnd = sessionEndTime(candidateStart, candidateDuration);
  const candidateStartMs = candidateStart.toMillis();
  const candidateEndMs = candidateEnd.toMillis();
  return sessions.some((session) => {
    if (ignoreId && session.id === ignoreId) {
      return false;
    }
    const existingStart = session.startTime.toMillis();
    const existingEnd = resolvedSessionEndTime(session).toMillis();
    return existingStart < candidateEndMs && existingEnd > candidateStartMs;
  });
};

export async function createSession(params: CreateSessionParams) {
  const { actorUid, groupId, courtId, startTime, durationMinutes, focus, notes } = params;
  if (!actorUid) {
    throw new UnauthorizedSessionError('Actor UID is required.');
  }
  ensureTimestamp(startTime);
  validateDuration(durationMinutes);
  validateFocus(focus);

  const profile = await getUserProfile(actorUid);

  const createdSession = await runTransaction(db, async (transaction) => {
    const groupRef = doc(groupsCollection, groupId);
    const groupSnapshot = await transaction.get(groupRef);
    if (!groupSnapshot.exists()) {
      throw new NotFoundError('Group not found.');
    }
    const group = groupSnapshot.data() as { coachId: string; playerIds: string[] };
    if (profile.role !== 'admin' && group.coachId !== actorUid) {
      throw new UnauthorizedSessionError('Coach does not have access to this group.');
    }
    assertActorCanManageGroup(profile.role, actorUid, groupId, profile.coachGroupIds);

    const newStart = startTime;
    const newEnd = sessionEndTime(startTime, durationMinutes);
    const windowStart = Timestamp.fromMillis(newStart.toMillis() - MAX_DURATION_MS);
    const conflictQuery = query(
      sessionsCollection,
      where('courtId', '==', courtId),
      where('startTime', '>=', windowStart),
      where('startTime', '<', newEnd),
      orderBy('startTime', 'asc')
    );
    const conflictSnapshot = await transaction.get(conflictQuery);
    const existingSessions: SessionRecord[] = conflictSnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as SessionRecord),
    }));
    if (detectCourtConflict(existingSessions, newStart, durationMinutes)) {
      throw new SessionConflictError();
    }

    const sessionRef = doc(sessionsCollection);
    const sessionData = {
      groupId,
      courtId,
      startTime,
      endTime: newEnd,
      durationMinutes,
      focus,
      notes: notes ?? null,
      createdBy: actorUid,
      createdAt: serverTimestamp(),
    };
    transaction.set(sessionRef, sessionData);
    return { id: sessionRef.id, ...sessionData };
  });

  const createdSnapshot = await getDoc(doc(sessionsCollection, createdSession.id));
  if (!createdSnapshot.exists()) {
    throw new NotFoundError('Session not found after creation.');
  }
  return { id: createdSnapshot.id, ...(createdSnapshot.data() as SessionRecord) };
}

export async function updateSession(params: UpdateSessionParams) {
  const { actorUid, sessionId, patch } = params;
  if (!actorUid) {
    throw new UnauthorizedSessionError('Actor UID is required.');
  }
  if (!patch || Object.keys(patch).length === 0) {
    throw new SessionValidationError('No updates provided.');
  }

  const profile = await getUserProfile(actorUid);
  const sessionRef = doc(sessionsCollection, sessionId);

  await runTransaction(db, async (transaction) => {
    const sessionSnapshot = await transaction.get(sessionRef);
    if (!sessionSnapshot.exists()) {
      throw new NotFoundError('Session not found.');
    }
    const existingSession = sessionSnapshot.data() as SessionRecord;

    const groupRef = doc(groupsCollection, existingSession.groupId);
    const groupSnapshot = await transaction.get(groupRef);
    if (!groupSnapshot.exists()) {
      throw new NotFoundError('Group not found.');
    }
    const group = groupSnapshot.data() as { coachId: string; playerIds: string[] };
    if (profile.role !== 'admin' && group.coachId !== actorUid) {
      throw new UnauthorizedSessionError('Coach does not have access to this group.');
    }
    assertActorCanManageGroup(profile.role, actorUid, existingSession.groupId, profile.coachGroupIds);

    const nextStart = patch.startTime ?? existingSession.startTime;
    const nextDuration = patch.durationMinutes ?? existingSession.durationMinutes;
    const nextCourtId = patch.courtId ?? existingSession.courtId;
    const nextFocus = patch.focus ?? existingSession.focus;

    ensureTimestamp(nextStart);
    validateDuration(nextDuration);
    validateFocus(nextFocus);

    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (patch.courtId) updates.courtId = patch.courtId;
    if (patch.startTime) updates.startTime = patch.startTime;
    if (patch.durationMinutes) updates.durationMinutes = patch.durationMinutes;
    if (patch.focus) updates.focus = patch.focus;
    if (patch.notes !== undefined) updates.notes = patch.notes ?? null;

    const newEnd = sessionEndTime(nextStart, nextDuration);
    updates.endTime = newEnd;

    const needsConflictCheck =
      patch.courtId !== undefined || patch.startTime !== undefined || patch.durationMinutes !== undefined;

    if (needsConflictCheck) {
      const windowStart = Timestamp.fromMillis(nextStart.toMillis() - MAX_DURATION_MS);
      const conflictQuery = query(
        sessionsCollection,
        where('courtId', '==', nextCourtId),
        where('startTime', '>=', windowStart),
        where('startTime', '<', newEnd),
        orderBy('startTime', 'asc')
      );
      const conflictSnapshot = await transaction.get(conflictQuery);
      const existingSessions: SessionRecord[] = conflictSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as SessionRecord),
      }));
      if (detectCourtConflict(existingSessions, nextStart, nextDuration, sessionId)) {
        throw new SessionConflictError();
      }
    }

    transaction.update(sessionRef, updates);
  });

  const updatedSnapshot = await getDoc(sessionRef);
  if (!updatedSnapshot.exists()) {
    throw new NotFoundError('Session not found after update.');
  }
  return { id: updatedSnapshot.id, ...(updatedSnapshot.data() as SessionRecord) };
}

export async function deleteSession(params: DeleteSessionParams) {
  const { actorUid, sessionId } = params;
  if (!actorUid) {
    throw new UnauthorizedSessionError('Actor UID is required.');
  }
  const sessionRef = doc(sessionsCollection, sessionId);
  const profile = await getUserProfile(actorUid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(sessionRef);
    if (!snapshot.exists()) {
      throw new NotFoundError('Session not found.');
    }
    const session = snapshot.data() as SessionRecord;
    const groupSnapshot = await transaction.get(doc(groupsCollection, session.groupId));
    if (!groupSnapshot.exists()) {
      throw new NotFoundError('Group not found.');
    }
    const group = groupSnapshot.data() as { coachId: string; playerIds: string[] };
    if (profile.role !== 'admin' && group.coachId !== actorUid) {
      throw new UnauthorizedSessionError('Coach does not have access to this group.');
    }
    assertActorCanManageGroup(profile.role, actorUid, session.groupId, profile.coachGroupIds);
    transaction.delete(sessionRef);
  });
}

export async function getSessionsForWeek(params: SessionsForWeekParams) {
  const { actorUid, weekStart, weekEnd, groupId } = params;
  if (!actorUid) {
    throw new UnauthorizedSessionError('Actor UID is required.');
  }
  const profile = await getUserProfile(actorUid);
  const start = normalizeTimestamp(weekStart);
  const end = normalizeTimestamp(weekEnd);

  if (groupId) {
    const group = await getGroup(groupId);
    assertActorCanReadGroup(
      profile.role,
      actorUid,
      groupId,
      group.playerIds,
      profile.coachGroupIds,
      profile.linkedPlayerIds
    );
    const sessionsQuery = query(
      sessionsCollection,
      where('groupId', '==', groupId),
      where('startTime', '>=', start),
      where('startTime', '<', end),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as SessionRecord) }));
  }

  if (profile.role === 'admin') {
    const sessionsQuery = query(
      sessionsCollection,
      where('startTime', '>=', start),
      where('startTime', '<', end),
      orderBy('startTime', 'asc')
    );
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as SessionRecord) }));
  }

  if (profile.role === 'coach') {
    const coachGroupIds = profile.coachGroupIds ?? [];
    if (coachGroupIds.length === 0) {
      return [];
    }
    return querySessionsForGroupIds(coachGroupIds, start, end);
  }

  if (profile.role === 'player') {
    const playerGroupIds = await loadGroupIdsForPlayer(actorUid);
    if (playerGroupIds.length === 0) {
      return [];
    }
    return querySessionsForGroupIds(playerGroupIds, start, end);
  }

  if (profile.role === 'parent') {
    const linkedPlayerIds = profile.linkedPlayerIds ?? [];
    const groupIds = await loadGroupIdsForLinkedPlayers(linkedPlayerIds);
    if (groupIds.length === 0) {
      return [];
    }
    return querySessionsForGroupIds(groupIds, start, end);
  }

  throw new UnauthorizedSessionError('Unknown role.');
}

export async function getSessionsForGroup(params: SessionsForGroupParams) {
  const { actorUid, groupId, range } = params;
  if (!actorUid) {
    throw new UnauthorizedSessionError('Actor UID is required.');
  }
  const profile = await getUserProfile(actorUid);
  const group = await getGroup(groupId);
  assertActorCanReadGroup(
    profile.role,
    actorUid,
    groupId,
    group.playerIds,
    profile.coachGroupIds,
    profile.linkedPlayerIds
  );

  const start = range ? normalizeTimestamp(range.start) : Timestamp.fromMillis(0);
  const end = range ? normalizeTimestamp(range.end) : Timestamp.fromMillis(253402300799000);

  const sessionsQuery = query(
    sessionsCollection,
    where('groupId', '==', groupId),
    where('startTime', '>=', start),
    where('startTime', '<', end),
    orderBy('startTime', 'asc')
  );
  const snapshot = await getDocs(sessionsQuery);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as SessionRecord) }));
}
