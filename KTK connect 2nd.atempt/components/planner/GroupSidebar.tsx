import React, { useState, useMemo } from 'react';
import { useBookings, useGroups } from '../../context/ClubContext';
import DraggableGroupCard from './DraggableGroupCard';
import Icon from '../ui/Icon';
import { Group } from '../../types';

interface GroupSidebarProps {
    selectedDate: Date;
}

const GroupSidebar: React.FC<GroupSidebarProps> = ({ selectedDate }) => {
    const { groups } = useGroups();
    const { allBookings } = useBookings();
    const [isUnscheduledOpen, setUnscheduledOpen] = useState(true);
    const [isScheduledOpen, setScheduledOpen] = useState(true);

    const { scheduledGroups, unscheduledGroups } = useMemo(() => {
        const scheduledGroupIds = new Set(
            allBookings
                .filter(b => {
                    const bookingDate = new Date(b.startTime);
                    return b.groupId &&
                           bookingDate.getFullYear() === selectedDate.getFullYear() &&
                           bookingDate.getMonth() === selectedDate.getMonth() &&
                           bookingDate.getDate() === selectedDate.getDate();
                })
                .map(b => b.groupId)
        );

        const scheduled: Group[] = [];
        const unscheduled: Group[] = [];

        groups.forEach(group => {
            if (scheduledGroupIds.has(group.id)) {
                scheduled.push(group);
            } else {
                unscheduled.push(group);
            }
        });

        return { scheduledGroups: scheduled, unscheduledGroups: unscheduled };
    }, [groups, allBookings, selectedDate]);

    const SectionToggle: React.FC<{title: string, count: number, isOpen: boolean, onToggle: () => void}> = ({ title, count, isOpen, onToggle }) => (
         <button onClick={onToggle} className="w-full flex justify-between items-center text-left p-2 rounded hover:bg-gray-100">
            <span className="font-semibold text-gray-600 text-sm">{title} ({count})</span>
            <Icon name="chevron-down" className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
    );

    return (
        <div className="bg-white rounded-lg shadow-md flex flex-col h-full max-h-[calc(100vh-12rem)]">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Icon name="users" className="w-6 h-6 text-primary-600" />
                    <span>Club Groups</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Drag a group to the planner to schedule a session.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <div>
                    <SectionToggle title="Not Scheduled Today" count={unscheduledGroups.length} isOpen={isUnscheduledOpen} onToggle={() => setUnscheduledOpen(!isUnscheduledOpen)} />
                    {isUnscheduledOpen && (
                        <div className="space-y-2 mt-2">
                            {unscheduledGroups.map(group => (
                                <DraggableGroupCard key={group.id} group={group} />
                            ))}
                            {unscheduledGroups.length === 0 && <p className="text-xs text-gray-400 text-center py-2">All groups are scheduled!</p>}
                        </div>
                    )}
                </div>
                <div className="mt-2 border-t pt-2">
                    <SectionToggle title="Scheduled Today" count={scheduledGroups.length} isOpen={isScheduledOpen} onToggle={() => setScheduledOpen(!isScheduledOpen)} />
                     {isScheduledOpen && (
                        <div className="space-y-2 mt-2">
                            {scheduledGroups.map(group => (
                                <DraggableGroupCard key={group.id} group={group} />
                            ))}
                             {scheduledGroups.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No groups scheduled yet.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupSidebar;
