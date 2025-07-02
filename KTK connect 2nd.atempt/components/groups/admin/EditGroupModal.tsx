import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { Group } from '../../../types';

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupDetails: { name: string, description: string }) => void;
  group: Partial<Group> | null;
}

const EditGroupModal: React.FC<EditGroupModalProps> = ({ isOpen, onClose, onSave, group }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDescription(group.description || '');
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name, description });
    }
  };
  
  const commonInputClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white";

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={group?.id ? 'Edit Group' : 'Create New Group'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            id="groupName"
            value={name}
            onChange={e => setName(e.target.value)}
            className={commonInputClasses}
            required
          />
        </div>
        <div>
          <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="groupDescription"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={commonInputClasses}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">{group?.id ? 'Save Changes' : 'Create Group'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGroupModal;