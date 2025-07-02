import React, { useState } from 'react';
import { User, Group } from '../../../types';
import { useClub } from '../../../context/ClubContext';
import MemberCard from './MemberCard';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

interface GroupColumnProps {
  id: string;
  title: string;
  description?: string;
  members: User[];
  isDraggedOver: boolean;
  setDraggedOverColumn: (id: string | null) => void;
  onEdit?: () => void;
}

const GroupColumn: React.FC<GroupColumnProps> = ({ id, title, description, members, isDraggedOver, setDraggedOverColumn, onEdit }) => {
  const { moveUserToGroup, deleteGroup } = useClub();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const userId = e.dataTransfer.getData('userId');
    if (userId) {
      const targetGroupId = id === 'unassigned' ? null : id;
      moveUserToGroup(userId, targetGroupId);
    }
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDeleteConfirm = () => {
    if (id !== 'unassigned') {
        deleteGroup(id);
    }
    setDeleteModalOpen(false);
  }

  return (
    <>
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={() => setDraggedOverColumn(id)}
      onDragLeave={() => setDraggedOverColumn(null)}
      className={`w-80 flex-shrink-0 bg-gray-100 rounded-lg shadow-sm flex flex-col transition-colors ${isDraggedOver ? 'bg-primary-100' : ''}`}
    >
      <div className="p-4 border-b bg-white rounded-t-lg">
        <div className="flex justify-between items-center">
            <h3 className="text-md font-bold text-gray-800">{title}</h3>
            {id !== 'unassigned' && (
                <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="text-gray-400 hover:text-primary-600"><Icon name="pencil" className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteModalOpen(true)} className="text-gray-400 hover:text-red-500"><Icon name="trash" className="w-4 h-4" /></button>
                </div>
            )}
        </div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {members.map(user => (
          <MemberCard key={user.id} user={user} />
        ))}
        {members.length === 0 && (
            <div className="text-center text-sm text-gray-400 p-4">Drop members here</div>
        )}
      </div>
    </div>
    <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Group">
        <div className="space-y-2">
          <p>Are you sure you want to delete the group "<strong>{title}</strong>"? All members will become unassigned.</p>
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <strong>Warning:</strong> All future scheduled sessions for this group will also be cancelled. This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-4">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>Delete Group</Button>
        </div>
    </Modal>
    </>
  );
};

export default GroupColumn;