

import React, { useState } from 'react';
import { Group, Member, Coach } from '../types';
import GroupEditModal from './GroupEditModal';
import MemberAvatar from './MemberAvatar';

interface AdminGroupsManagementProps {
    groups: Group[];
    allMembers: Member[];
    coaches: Coach[];
    adminId: string;
    onGoBack: () => void;
    onCreateGroup: (data: { name: string, description: string, coachId?: string }) => void;
    onUpdateGroup: (id: string, data: { name: string, description: string, coachId?: string }) => void;
    onDeleteGroup: (id: string) => void;
    onMoveMember: (memberId: string, targetGroupId: string | null) => void;
}

const DraggableMemberCard: React.FC<{
    member: Member;
    onDragStart: (e: React.DragEvent, memberId: string) => void;
}> = ({ member, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, member.id)}
        className="p-2 bg-white rounded-md shadow-sm border border-slate-200 flex items-center space-x-2 cursor-grab active:cursor-grabbing"
    >
        <MemberAvatar member={member} size="sm" />
        <span className="text-sm font-medium text-slate-700">{member.name}</span>
    </div>
);

const AdminGroupsManagement: React.FC<AdminGroupsManagementProps> = ({
    groups, allMembers, coaches, adminId, onGoBack, onCreateGroup, onUpdateGroup, onDeleteGroup, onMoveMember
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

    const handleCreateClick = () => {
        setEditingGroup(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (group: Group) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleSubmit = (groupData: { name: string, description: string, coachId?: string }) => {
        if (editingGroup) {
            onUpdateGroup(editingGroup.id, groupData);
        } else {
            onCreateGroup(groupData);
        }
    };

    const handleDragStart = (e: React.DragEvent, memberId: string) => {
        e.dataTransfer.setData('memberId', memberId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };
    
    const handleDragEnter = (_e: React.DragEvent, targetId: string | null) => {
        setDragOverTarget(targetId);
    };

    const handleDrop = (e: React.DragEvent, targetGroupId: string | null) => {
        e.preventDefault();
        const memberId = e.dataTransfer.getData('memberId');
        if (memberId) {
            onMoveMember(memberId, targetGroupId);
        }
        setDragOverTarget(null);
    };

    const allAssignedMemberIds = new Set(groups.flatMap(g => g.memberIds));
    const unassignedMembers = allMembers.filter(m => !allAssignedMemberIds.has(m.id) && m.id !== adminId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button onClick={onGoBack} className="text-sm font-semibold text-club-primary hover:text-club-primary-dark flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to My Groups
                </button>
                <button onClick={handleCreateClick} className="px-5 py-2 bg-club-primary text-white font-semibold rounded-md hover:bg-club-primary-dark transition-colors">
                    Create New Group
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unassigned Members */}
                <div 
                    className={`bg-slate-100 rounded-lg p-4 space-y-2 transition-all border-2 ${dragOverTarget === 'unassigned' ? 'border-club-primary' : 'border-transparent'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, null)}
                    onDragEnter={(e) => handleDragEnter(e, 'unassigned')}
                    onDragLeave={() => setDragOverTarget(null)}
                >
                    <h3 className="font-bold text-slate-700 px-2">Unassigned Members ({unassignedMembers.length})</h3>
                    <div className="space-y-2 h-[60vh] overflow-y-auto p-1">
                        {unassignedMembers.map(member => (
                            <DraggableMemberCard key={member.id} member={member} onDragStart={handleDragStart} />
                        ))}
                    </div>
                </div>

                {/* Groups */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(60vh+48px)] overflow-y-auto p-1">
                    {groups.map(group => {
                        const coach = coaches.find(c => c.id === group.coachId);
                        const groupMembers = group.memberIds.map(id => allMembers.find(m => m.id === id)).filter((m): m is Member => !!m);

                        return (
                            <div
                                key={group.id}
                                className={`bg-slate-100 rounded-lg p-4 space-y-2 transition-all border-2 flex flex-col ${dragOverTarget === group.id ? 'border-club-primary' : 'border-transparent'}`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, group.id)}
                                onDragEnter={(e) => handleDragEnter(e, group.id)}
                                onDragLeave={() => setDragOverTarget(null)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-slate-700">{group.name}</h3>
                                        <p className="text-xs text-slate-500">{coach ? `Coach: ${coach.name}` : "No coach"}</p>
                                    </div>
                                    <button onClick={() => handleEditClick(group)} className="text-xs font-semibold text-club-primary hover:underline">Edit</button>
                                </div>
                                <div className="space-y-2 flex-grow overflow-y-auto p-1 bg-white/50 rounded-md">
                                    {groupMembers.length > 0 ? groupMembers.map(member => (
                                        <DraggableMemberCard key={member.id} member={member} onDragStart={handleDragStart} />
                                    )) : <p className="text-center text-sm text-slate-400 p-4">Drop members here</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <GroupEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialGroup={editingGroup}
                allCoaches={coaches}
                onDeleteGroup={onDeleteGroup}
            />
        </div>
    );
};

export default AdminGroupsManagement;