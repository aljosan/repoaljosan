

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
import { useClubData } from './hooks/useClubData';
import { View } from './types';
import SettingsView from './components/SettingsView';
import PrivacyPolicyView from './components/PrivacyPolicyView';

const DashboardView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { events, members, currentUser, updateAvailability } = clubData;
    const sortedEvents = useMemo(() => [...events].sort((a, b) => a.date.getTime() - b.date.getTime()), [events]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {sortedEvents.map(event => (
                <EventCard key={event.id} event={event} allMembers={members} currentUser={currentUser} onUpdateAvailability={updateAvailability} />
            ))}
        </div>
    );
};

const MembersView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { members } = clubData;
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

const CourtBookingView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { courts, bookings, members, currentUser, addBooking, lessonBookings, payForBooking } = clubData;
    return <CourtBooking courts={courts} bookings={bookings} lessonBookings={lessonBookings} members={members} currentUser={currentUser} onBookCourt={addBooking} onPayForBooking={payForBooking} />;
};

const CommunityPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { posts, members, currentUser, addPost } = clubData;
    return <CommunityView posts={posts} members={members} currentUser={currentUser} onAddPost={addPost} />;
};

const GroupsPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { 
        groups, groupMessages, sendGroupMessage, members, currentUser, coaches, 
        ADMIN_ID, createGroup, updateGroup, deleteGroup, moveMemberToGroup
    } = clubData;
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

const LessonsPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { coaches, lessonBookings, addLessonBooking, currentUser, courts, bookings, members, payForLessonBooking } = clubData;
    return <LessonsView coaches={coaches} lessonBookings={lessonBookings} addLessonBooking={addLessonBooking} currentUser={currentUser} courts={courts} regularBookings={bookings} members={members} onPayForLessonBooking={payForLessonBooking} />;
};

const LadderPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { ladderPlayers, members, challenges, currentUser, issueChallenge, respondToChallenge, reportMatchResult } = clubData;
    return <LadderView ladderPlayers={ladderPlayers} allMembers={members} challenges={challenges} currentUser={currentUser} onIssueChallenge={issueChallenge} onRespondToChallenge={respondToChallenge} onReportResult={reportMatchResult} />;
};

const FindPartnerPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { partnerRequests, members, currentUser, addPartnerRequest, closePartnerRequest } = clubData;
    return <FindPartnerView 
        requests={partnerRequests} 
        members={members} 
        currentUser={currentUser} 
        onAddRequest={addPartnerRequest} 
        onCloseRequest={closePartnerRequest} 
    />;
};

const AnnouncementsPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { announcements, members, addAnnouncement, currentUser, ADMIN_ID } = clubData;
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

const SurveysPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    return <SurveysView clubData={clubData} />;
};

const MyAccountPageView: React.FC<{ clubData: ReturnType<typeof useClubData>, setCurrentView: (view: View) => void }> = ({ clubData, setCurrentView }) => {
    return <MyAccountView clubData={clubData} setCurrentView={setCurrentView} />;
};

const LearningCenterPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    const { learningArticles } = clubData;
    return <LearningCenterView articles={learningArticles} />;
};

const SettingsPageView: React.FC<{ clubData: ReturnType<typeof useClubData> }> = ({ clubData }) => {
    return <SettingsView clubData={clubData} />;
};

const PrivacyPolicyPageView: React.FC = () => {
    return <PrivacyPolicyView />;
};


const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const clubData = useClubData();
    const { currentUser, notifications, markNotificationsAsRead, ADMIN_ID } = clubData;

    const renderView = () => {
        switch (currentView) {
            case View.DASHBOARD:
                return <DashboardView clubData={clubData} />;
            case View.MEMBERS:
                return <MembersView clubData={clubData} />;
            case View.BOOKING:
                return <CourtBookingView clubData={clubData} />;
            case View.AI_COACH:
                return <AICoachView />;
            case View.COMMUNITY:
                return <CommunityPageView clubData={clubData} />;
            case View.SURVEYS:
                return <SurveysPageView clubData={clubData} />;
            case View.LESSONS:
                return <LessonsPageView clubData={clubData} />;
            case View.GROUPS:
                return <GroupsPageView clubData={clubData} />;
            case View.LADDER:
                return <LadderPageView clubData={clubData} />;
            case View.FIND_PARTNER:
                return <FindPartnerPageView clubData={clubData} />;
            case View.ANNOUNCEMENTS:
                return <AnnouncementsPageView clubData={clubData} />;
            case View.MY_ACCOUNT:
                return <MyAccountPageView clubData={clubData} setCurrentView={setCurrentView} />;
            case View.LEARNING_CENTER:
                return <LearningCenterPageView clubData={clubData} />;
            case View.SETTINGS:
                return <SettingsPageView clubData={clubData} />;
            case View.PRIVACY_POLICY:
                return <PrivacyPolicyPageView />;
            default:
                return <DashboardView clubData={clubData} />;
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