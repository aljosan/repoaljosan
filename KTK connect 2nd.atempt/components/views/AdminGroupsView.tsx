import React, { useState, useMemo } from 'react';
import { useClub } from '../../context/ClubContext';
import MembersSidebar from '../groups/admin/MembersSidebar';
import GroupColumn from '../groups/admin/GroupColumn';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import EditGroupModal from '../groups/admin/EditGroupModal';
import { Group, User } from '../../types';

const AdminGroupsView: React.FC = () => {
    const { users, groups, addGroup, updateGroup } = useClub();
    const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Partial<Group> | null>(null);

    const unassignedMembers = useMemo(() => {
        const assignedUserIds = new Set(groups.flatMap(g => g.members));
        return users.filter(u => !assignedUserIds.has(u.id));
    }, [users, groups]);

    const handleOpenCreateModal = () => {
        setEditingGroup({}); // Empty object for creation
        setEditModalOpen(true);
    };
    
    const handleOpenEditModal = (group: Group) => {
        setEditingGroup(group);
        setEditModalOpen(true);
    };

    const handleSaveGroup = (groupDetails: { name: string; description: string }) => {
        if (editingGroup?.id) {
            // Editing existing group
            updateGroup(editingGroup.id, groupDetails);
        } else {
            // Creating new group
            addGroup(groupDetails);
        }
        setEditModalOpen(false);
        setEditingGroup(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manage Groups</h1>
                <Button onClick={handleOpenCreateModal} >
                    <Icon name="plus" className="w-5 h-5 mr-2"/>
                    Create Group
                </Button>
            </div>
            <div className="flex gap-6 h-[calc(100vh-12rem)]">
                <MembersSidebar allUsers={users} />
                <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                    {/* Unassigned Column */}
                    <GroupColumn
                        id="unassigned"
                        title="Unassigned Members"
                        members={unassignedMembers}
                        isDraggedOver={draggedOverColumn === 'unassigned'}
                        setDraggedOverColumn={setDraggedOverColumn}
                    />

                    {/* Group Columns */}
                    {groups.map(group => (
                         <GroupColumn
                            key={group.id}
                            id={group.id}
                            title={group.name}
                            description={group.description}
                            members={users.filter(u => group.members.includes(u.id))}
                            isDraggedOver={draggedOverColumn === group.id}
                            setDraggedOverColumn={setDraggedOverColumn}
                            onEdit={() => handleOpenEditModal(group)}
                        />
                    ))}
                </div>
            </div>
            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveGroup}
                group={editingGroup}
            />
        </div>
    );
};

export default AdminGroupsView;