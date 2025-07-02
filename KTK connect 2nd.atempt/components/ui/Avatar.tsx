import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <img
      className={`${sizeClasses[size]} rounded-full object-cover`}
      src={user.avatarUrl}
      alt={user.name}
      title={user.name}
    />
  );
};

interface AvatarGroupProps {
  users: User[];
  max?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 3 }) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visibleUsers.map(user => (
        <img
          key={user.id}
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src={user.avatarUrl}
          alt={user.name}
          title={user.name}
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 ring-2 ring-white text-xs font-medium text-gray-600">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};