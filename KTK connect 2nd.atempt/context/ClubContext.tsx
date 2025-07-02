import React, { createContext, useContext, ReactNode } from 'react';
import { useClubData, UseClubDataReturnType } from '../hooks/useClubData';

const ClubContext = createContext<UseClubDataReturnType | null>(null);

export const ClubDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clubData = useClubData();
  return (
    <ClubContext.Provider value={clubData}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = (): UseClubDataReturnType => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubDataProvider');
  }
  return context;
};