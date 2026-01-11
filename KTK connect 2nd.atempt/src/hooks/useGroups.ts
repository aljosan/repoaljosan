import { useState } from 'react';
import { Group } from '@/types';
import { mockGroups } from '../data/mockData';

export interface UseGroupsReturnType {
  groups: Group[];
  addGroup: (groupDetails: Pick<Group, 'name' | 'description'>) => void;
  updateGroup: (groupId: string, updates: Pick<Group, 'name' | 'description'>) => void;
  deleteGroup: (groupId: string) => void;
  addMessageToGroup: (groupId: string, messageText: string) => void;
  moveUserToGroup: (userId: string, targetGroupId: string | null) => void;
}

export const useGroups = ({ currentUserId }: { currentUserId: string }): UseGroupsReturnType => {
  const [groups, setGroups] = useState<Group[]>(mockGroups);

  const addGroup = (groupDetails: Pick<Group, 'name' | 'description'>) =>
    setGroups(prev => [...prev, { ...groupDetails, id: `group-${Date.now()}`, members: [], messages: [] }]);

  const updateGroup = (groupId: string, updates: Pick<Group, 'name' | 'description'>) =>
    setGroups(prev => prev.map(g => (g.id === groupId ? { ...g, ...updates } : g)));

  const deleteGroup = (groupId: string) => setGroups(prev => prev.filter(g => g.id !== groupId));

  const addMessageToGroup = (groupId: string, messageText: string) =>
    setGroups(prevGroups =>
      prevGroups.map(g =>
        g.id === groupId
          ? {
              ...g,
              messages: [
                ...g.messages,
                { id: `msg-${Date.now()}`, userId: currentUserId, text: messageText, timestamp: new Date() },
              ],
            }
          : g
      )
    );

  const moveUserToGroup = (userId: string, targetGroupId: string | null) => {
    setGroups(prevGroups => {
      const groupsWithoutUser = prevGroups.map(g => ({ ...g, members: g.members.filter(mId => mId !== userId) }));
      if (targetGroupId) {
        return groupsWithoutUser.map(g =>
          g.id === targetGroupId ? { ...g, members: [...g.members, userId] } : g
        );
      }
      return groupsWithoutUser;
    });
  };

  return { groups, addGroup, updateGroup, deleteGroup, addMessageToGroup, moveUserToGroup };
};
