import React, { useState } from 'react';
import { useGroups, useMembers } from '../../context/ClubContext';
import GroupChat from '../groups/GroupChat';
import Icon from '../ui/Icon';
import { Group } from '../../types';

const MemberGroupsView: React.FC = () => {
  const { groups } = useGroups();
  const { currentUser } = useMembers();
  const myGroups = groups.filter(g => g.members.includes(currentUser.id));
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(myGroups.length > 0 ? myGroups[0] : null);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">Groups</h1>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
        <div className="md:w-1/3 lg:w-1/4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">My Groups</h2>
          <ul className="space-y-2">
            {myGroups.map(group => (
              <li
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedGroup?.id === group.id ? 'bg-primary-100 text-primary-800' : 'hover:bg-gray-100'}`}
              >
                <div className="font-semibold">{group.name}</div>
                <div className="text-sm text-gray-500">{group.description}</div>
              </li>
            ))}
             {myGroups.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">You are not a member of any group.</p>
            )}
          </ul>
        </div>
        <div className="md:w-2/3 lg:w-3/4 flex-grow">
          {selectedGroup ? (
            <GroupChat group={selectedGroup} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-md">
              <Icon name="users" className="w-16 h-16 text-gray-300" />
              <p className="mt-4 text-lg text-gray-500">Select a group to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberGroupsView;
