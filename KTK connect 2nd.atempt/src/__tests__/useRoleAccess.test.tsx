import { renderHook } from '@testing-library/react';
import { jest } from '@jest/globals';
import { useAuth } from '../hooks/useAuth';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { UserRole } from '../types/roles';

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;

const setProfileRole = (role: UserRole) => {
  useAuthMock.mockReturnValue({
    user: null,
    profile: {
      id: 'user-1',
      email: 'coach@example.com',
      displayName: 'Alex Coach',
      role,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    isLoading: false,
    signIn: async () => {},
    signOut: async () => {},
  });
};

afterEach(() => {
  useAuthMock.mockReset();
});

test('allows profiles with an accepted role', () => {
  setProfileRole('coach');
  const { result } = renderHook(() => useRoleAccess(['admin', 'coach']));

  expect(result.current).toBe(true);
});

test('rejects profiles without an accepted role', () => {
  setProfileRole('player');
  const { result } = renderHook(() => useRoleAccess(['admin', 'coach']));

  expect(result.current).toBe(false);
});
