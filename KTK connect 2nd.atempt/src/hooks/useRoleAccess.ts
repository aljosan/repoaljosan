import { useMemo } from 'react';
import { UserRole } from '../types/roles';
import { useAuth } from './useAuth';

export const useRoleAccess = (allowedRoles: UserRole[]) => {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) {
      return false;
    }
    return allowedRoles.includes(profile.role);
  }, [allowedRoles, profile]);
};
