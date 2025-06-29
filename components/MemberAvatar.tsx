

import React from 'react';
import { Member, Coach } from '../types';

interface MemberAvatarProps {
  member: Member | Coach;
  size?: 'sm' | 'md' | 'lg';
}

const MemberAvatar: React.FC<MemberAvatarProps> = ({ member, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  return (
    <img
      className={`rounded-full object-cover border-2 border-white ${sizeClasses[size]}`}
      src={member.avatarUrl}
      alt={member.name}
      title={member.name}
    />
  );
};

export default MemberAvatar;