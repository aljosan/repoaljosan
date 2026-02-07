export type UserRole = 'admin' | 'coach' | 'player' | 'parent';

export const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  coach: 'Coach',
  player: 'Player',
  parent: 'Parent',
};
