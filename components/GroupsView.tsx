

import React, { useState } from 'react';
import { Group, GroupMessage, Member, Coach } from '../types';
import MemberAvatar from './MemberAvatar';
import GroupChatView from './GroupChatView';
import AdminGroupsManagement from './AdminGroupsManagement';

interface GroupsViewProps {
    groups: Group[];
    messages: GroupMessage[];
    onSendMessage: (groupId: string, authorId: string, textContent: string) => void;
    allMembers: Member[];
    currentUser: Member;
    coaches: Coach[];
    adminId: string;
    onCreateGroup: (data: { name: string, description: string, coachId?: string }) => void;
    onUpdateGroup: (id: string, data: { name: string, description: string, coachId?: string }) => void;
    onDeleteGroup: (id: string) => void;
    onMoveMember: (memberId: string, targetGroupId: string | null) => void;
}

const GroupListItem: React.FC<{
    group: Group;
    members: Member[];
    onSelect: () => void;
}> = ({ group, members, onSelect }) => {
    const groupMembers = members.filter(m => group.memberIds.includes(m.id));

    return (
        <div
            onClick={onSelect}
            className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
        >
            <div className="flex-shrink-0 flex -space-x-3">
                {groupMembers.slice(0, 3).map(member => (
                    <MemberAvatar key={member.id} member={member} size="md" />
                ))}
                {groupMembers.length > 3 && (
                     <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold border-2 border-white">
                        +{groupMembers.length - 3}
                    </div>
                )}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">{group.name}</h3>
                <p className="text-slate-600 text-sm">{group.description}</p>
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
        </div>
    );
};

const GroupsView: React.FC<GroupsViewProps> = (props) => {
    const { groups, messages, onSendMessage, allMembers, currentUser, coaches, adminId, onCreateGroup, onUpdateGroup, onDeleteGroup, onMoveMember } = props;
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isManaging, setIsManaging] = useState(false);

    const isAdmin = currentUser.id === adminId;

    // Admins can see all groups. Regular users only see groups they are in (as member or coach).
    const userGroups = isAdmin
      ? groups
      : groups.filter(g => (g.memberIds.includes(currentUser.id) || g.coachId === currentUser.id));

    if (selectedGroup) {
        const groupMessages = messages.filter(m => m.groupId === selectedGroup.id);

        return (
            <GroupChatView
                group={selectedGroup}
                messages={groupMessages}
                onSendMessage={onSendMessage}
                allMembers={allMembers}
                currentUser={currentUser}
                coaches={coaches}
                onBack={() => setSelectedGroup(null)}
            />
        );
    }
    
    if (isAdmin && isManaging) {
        return (
            <AdminGroupsManagement 
                groups={groups}
                allMembers={allMembers}
                coaches={coaches}
                adminId={adminId}
                onGoBack={() => setIsManaging(false)}
                onCreateGroup={onCreateGroup}
                onUpdateGroup={onUpdateGroup}
                onDeleteGroup={onDeleteGroup}
                onMoveMember={onMoveMember}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="md:flex md:justify-between md:items-center">
                <div className='text-center md:text-left'>
                    <h1 className="text-3xl font-bold text-slate-800">Group Conversations</h1>
                    <p className="mt-2 text-slate-600">Connect with your teams and fellow players.</p>
                </div>
                {isAdmin && (
                     <button 
                        onClick={() => setIsManaging(true)}
                        className="mt-4 w-full md:w-auto md:mt-0 px-5 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors"
                    >
                        Manage Groups
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {userGroups.length > 0 ? userGroups.map(group => (
                    <GroupListItem
                        key={group.id}
                        group={group}
                        members={allMembers}
                        onSelect={() => setSelectedGroup(group)}
                    />
                )) : (
                    <div className="text-center p-8 bg-white rounded-lg shadow-md">
                        <p className="text-slate-500">{isAdmin ? "There are no active groups to display." : "You are not a member of any active groups."}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupsView;