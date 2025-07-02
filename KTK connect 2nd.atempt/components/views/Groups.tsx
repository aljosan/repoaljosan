import React from 'react';
import { useClub } from '../../context/ClubContext';
import { UserRole } from '../../types';
import AdminGroupsView from './AdminGroupsView';
import MemberGroupsView from './MemberGroupsView';

const Groups: React.FC = () => {
  const { currentUser } = useClub();

  if (currentUser.role === UserRole.Admin) {
    return <AdminGroupsView />;
  }
  
  return <MemberGroupsView />;
};

export default Groups;