

import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import EventCard from './components/EventCard';
import MemberAvatar from './components/MemberAvatar';
import AICoach from './components/AICoach';
import CourtBooking from './components/CourtBooking';
import SurveysView from './components/SurveysView';
import CommunityView from './components/CommunityView';
import LessonsView from './components/LessonsView';
import GroupsView from './components/GroupsView';
import LadderView from './components/LadderView';
import FindPartnerView from './components/FindPartnerView';
import AnnouncementsView from './components/AnnouncementsView';
import MyAccountView from './components/WalletView';
import LearningCenterView from './components/LearningCenterView';
import { useClubDataContext, useMembers, useBookings, useGroups } from './hooks/ClubDataContext';
import { View } from './types';
import SettingsView from './components/SettingsView';
import PrivacyPolicyView from './components/PrivacyPolicyView';

const DashboardView: React.FC = () => {
    const { events, members, currentUser, updateAvailability } = useClubDataContext();
    const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.getTime() - b.date.getTime()), [events]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sortedEvents.map(event => (
                <EventCard key={event.id} event={event} allMembers={members} currentUser={currentUser} onUpdateAvailability={updateAvailability} />
            ))}
        </div>
    );
};

const MembersView: React.FC = () => {
    const { members } = useMembers();
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Club Members ({members.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {members.map(member => (
                    <div key={member.id} className="flex flex-col items-center text-center">
                        <MemberAvatar member={member} size="lg" />
                        <p className="mt-2 font-semibold text-slate-700">{member.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CourtBookingView: React.FC = () => {
    const { courts, bookings, lessonBookings, addBooking, payForBooking } = useBookings();
    const { members, currentUser } = useMembers();
    return <CourtBooking courts={courts} bookings={bookings} lessonBookings={lessonBookings} members={members} currentUser={currentUser} onBookCourt={addBooking} onPayForBooking={payForBooking} />;
};

const CommunityPageView: React.FC = () => {
    const { posts, members, currentUser, addPost } = useClubDataContext();
    return <CommunityView posts={posts} members={members} currentUser={currentUser} onAddPost={addPost} />;
};

const GroupsPageView: React.FC = () => {
    const { groups, groupMessages, sendGroupMessage, coaches, createGroup, updateGroup, deleteGroup, moveMemberToGroup } = useGroups();
    const { members, currentUser } = useMembers();
    const { ADMIN_ID } = useClubDataContext();
    return <GroupsView
        groups={groups}
        messages={groupMessages}
        onSendMessage={sendGroupMessage}
        allMembers={members}
        currentUser={currentUser}
        coaches={coaches}
        adminId={ADMIN_ID}
        onCreateGroup={createGroup}
        onUpdateGroup={updateGroup}
        onDeleteGroup={deleteGroup}
        onMoveMember={moveMemberToGroup}
    />;
};

const LessonsPageView: React.FC = () => {
    const { coaches, lessonBookings, addLessonBooking, currentUser, courts, bookings, members, payForLessonBooking } = useClubDataContext();
    return <LessonsView coaches={coaches} lessonBookings={lessonBookings} addLessonBooking={addLessonBooking} currentUser={currentUser} courts={courts} regularBookings={bookings} members={members} onPayForLessonBooking={payForLessonBooking} />;
};

const LadderPageView: React.FC = () => {
    const { ladderPlayers, members, challenges, currentUser, issueChallenge, respondToChallenge, reportMatchResult } = useClubDataContext();
    return <LadderView ladderPlayers={ladderPlayers} allMembers={members} challenges={challenges} currentUser={currentUser} onIssueChallenge={issueChallenge} onRespondToChallenge={respondToChallenge} onReportResult={reportMatchResult} />;
};

const FindPartnerPageView: React.FC = () => {
    const { partnerRequests, members, currentUser, addPartnerRequest, closePartnerRequest } = useClubDataContext();
    return <FindPartnerView
        requests={partnerRequests}
        members={members}
        currentUser={currentUser}
        onAddRequest={addPartnerRequest}
        onCloseRequest={closePartnerRequest}
    />;
};

const AnnouncementsPageView: React.FC = () => {
    const { announcements, members, addAnnouncement, currentUser, ADMIN_ID } = useClubDataContext();
    return <AnnouncementsView
        announcements={announcements}
        members={members}
        onAddAnnouncement={addAnnouncement}
        currentUser={currentUser}
        adminId={ADMIN_ID}
    />;
};

const AICoachView: React.FC = () => {
    return <AICoach />;
};

const SurveysPageView: React.FC = () => {
    return <SurveysView />;
};

const MyAccountPageView: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    return <MyAccountView setCurrentView={setCurrentView} />;
};

const LearningCenterPageView: React.FC = () => {
    const { learningArticles } = useClubDataContext();
    return <LearningCenterView articles={learningArticles} />;
};

const SettingsPageView: React.FC = () => {
    return <SettingsView />;
};

const PrivacyPolicyPageView: React.FC = () => {
    return <PrivacyPolicyView />;
};


const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const { currentUser, notifications, markNotificationsAsRead, ADMIN_ID } = useClubDataContext();

    const renderView = () => {
        switch (currentView) {
            case View.DASHBOARD:
                return <DashboardView />;
            case View.MEMBERS:
                return <MembersView />;
            case View.BOOKING:
                return <CourtBookingView />;
            case View.AI_COACH:
                return <AICoachView />;
            case View.COMMUNITY:
                return <CommunityPageView />;
            case View.SURVEYS:
                return <SurveysPageView />;
            case View.LESSONS:
                return <LessonsPageView />;
            case View.GROUPS:
                return <GroupsPageView />;
            case View.LADDER:
                return <LadderPageView />;
            case View.FIND_PARTNER:
                return <FindPartnerPageView />;
            case View.ANNOUNCEMENTS:
                return <AnnouncementsPageView />;
            case View.MY_ACCOUNT:
                return <MyAccountPageView setCurrentView={setCurrentView} />;
            case View.LEARNING_CENTER:
                return <LearningCenterPageView />;
            case View.SETTINGS:
                return <SettingsPageView />;
            case View.PRIVACY_POLICY:
                return <PrivacyPolicyPageView />;
            default:
                return <DashboardView />;
        }
    };
    
    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-slate-800">No User Found</h1>
                    <p className="text-slate-600 mt-2">Could not load user data, or the last user was deleted. The app cannot continue.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <Header 
                currentView={currentView}
                setCurrentView={setCurrentView}
                notifications={notifications}
                onMarkNotificationsAsRead={markNotificationsAsRead}
                currentUser={currentUser}
                adminId={ADMIN_ID}
            />
            <main className="max-w-7xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
                {renderView()}
            </main>
        </div>
    );
};

export default App;