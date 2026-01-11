import { useState } from 'react';
import { User } from '@/types';
import { mockUsers } from '../data/mockData';

export interface UseMembersReturnType {
  currentUser: User;
  users: User[];
  applyUserCreditUpdates: (updates: Record<string, number>) => void;
}

export const useMembers = (): UseMembersReturnType => {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const applyUserCreditUpdates = (updates: Record<string, number>) => {
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return;

    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user =>
        updates[user.id] ? { ...user, credits: user.credits + updates[user.id] } : user
      );
      const updatedCurrentUser = newUsers.find(user => user.id === currentUser.id);
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
      }
      return newUsers;
    });
  };

  return { currentUser, users, applyUserCreditUpdates };
};
