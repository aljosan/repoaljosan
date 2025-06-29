

import React, { useState, useEffect } from 'react';
import { Group, Member, Coach } from '../types';

interface GroupEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (groupData: { name: string, description: string, coachId?: string }) => void;
    initialGroup?: Group;
    allCoaches: Coach[];
    onDeleteGroup: (id: string) => void;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({ isOpen, onClose, onSubmit, initialGroup, allCoaches, onDeleteGroup }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [coachId, setCoachId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            if (initialGroup) {
                setName(initialGroup.name);
                setDescription(initialGroup.description);
                setCoachId(initialGroup.coachId || '');
            } else {
                // Reset form for "Create"
                setName('');
                setDescription('');
                setCoachId('');
            }
        }
    }, [initialGroup, isOpen]);

    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            description,
            coachId: coachId || undefined,
        });
        onClose();
    };
    
    const handleDelete = () => {
        if (initialGroup && onDeleteGroup) {
            if (window.confirm("Are you sure you want to permanently delete this group and all its messages? This action is irreversible.")) {
                onDeleteGroup(initialGroup.id);
                onClose();
            }
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg mx-4 flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex-shrink-0">{initialGroup ? 'Edit Group' : 'Create New Group'}</h2>
                
                {/* Form Content */}
                <div className="space-y-6 flex-grow">
                    <div>
                        <label htmlFor="group-name" className="block text-sm font-medium text-slate-700">Group Name</label>
                        <input type="text" id="group-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <div>
                        <label htmlFor="group-description" className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea id="group-description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3"/>
                    </div>
                     <div>
                        <label htmlFor="group-coach" className="block text-sm font-medium text-slate-700">Assign Coach</label>
                        <select id="group-coach" value={coachId} onChange={e => setCoachId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 rounded-md">
                            <option value="">No Coach</option>
                            {allCoaches.map(coach => <option key={coach.id} value={coach.id}>{coach.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="flex justify-between items-center pt-6 flex-shrink-0 border-t border-slate-200 mt-6">
                    <div>
                        {initialGroup && (
                            <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 text-sm">
                                Delete Group
                            </button>
                        )}
                    </div>
                    <div className="flex space-x-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 rounded-md font-semibold hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-club-primary text-white rounded-md font-semibold hover:bg-club-primary-dark">{initialGroup ? 'Save Changes' : 'Create Group'}</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GroupEditModal;