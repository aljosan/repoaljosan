import React, { createContext, useContext } from 'react';
import { useClubData } from './useClubData';

const ClubDataContext = createContext<ReturnType<typeof useClubData> | null>(null);

export const ClubDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const clubData = useClubData();
    return <ClubDataContext.Provider value={clubData}>{children}</ClubDataContext.Provider>;
};

export const useClubDataContext = () => {
    const ctx = useContext(ClubDataContext);
    if (!ctx) throw new Error('useClubDataContext must be used within ClubDataProvider');
    return ctx;
};

export const useMembers = () => {
    const { members, currentUser, updateMemberDetails, toggleNtfConsent, agreeToPolicies, deleteCurrentUser } = useClubDataContext();
    return { members, currentUser, updateMemberDetails, toggleNtfConsent, agreeToPolicies, deleteCurrentUser };
};

export const useBookings = () => {
    const { courts, bookings, lessonBookings, addBooking, payForBooking, addLessonBooking, payForLessonBooking } = useClubDataContext();
    return { courts, bookings, lessonBookings, addBooking, payForBooking, addLessonBooking, payForLessonBooking };
};

export const useGroups = () => {
    const { groups, groupMessages, sendGroupMessage, coaches, createGroup, updateGroup, deleteGroup, moveMemberToGroup } = useClubDataContext();
    return { groups, groupMessages, sendGroupMessage, coaches, createGroup, updateGroup, deleteGroup, moveMemberToGroup };
};

export const useTransactions = () => {
    const { transactions, awardCredits } = useClubDataContext();
    return { transactions, awardCredits };
};
