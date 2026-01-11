import React from 'react';
import { useMembers } from '../../context/ClubContext';
import { UserRole } from '../../types';
import AdminGroupsView from './AdminGroupsView';
import MemberGroupsView from './MemberGroupsView';

const Groups: React.FC = () => {
  const { currentUser } = useMembers();

  if (currentUser.role === UserRole.Admin) {
    return <AdminGroupsView />;
  }
  
  return <MemberGroupsView />;
};

export default Groups;
