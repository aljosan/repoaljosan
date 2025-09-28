import React from 'react';
import { Group, User } from '@/types';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface PlannerFiltersProps {
    filters: {
        courtType: 'All' | 'Indoor' | 'Outdoor';
        coachId: string | 'All';
        groupId: string | 'All';
    };
    setFilters: React.Dispatch<React.SetStateAction<PlannerFiltersProps['filters']>>;
    coaches: User[];
    groups: Group[];
    viewMode: 'day' | 'week';
    setViewMode: (mode: 'day' | 'week') => void;
    onBlockSlotClick: () => void;
    onTemplatesClick: () => void;
    onPrintClick: () => void;
    onAnalyticsClick: () => void;
}

const PlannerFilters: React.FC<PlannerFiltersProps> = ({
    filters,
    setFilters,
    coaches,
    groups,
    viewMode,
    setViewMode,
    onBlockSlotClick,
    onTemplatesClick,
    onPrintClick,
    onAnalyticsClick
}) => {
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const commonSelectClasses = "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5";

    return (
        <div className="bg-gray-50 p-3 rounded-lg border flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-200 rounded-lg p-1">
                <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'day' ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Day</button>
                <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-primary-600 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Week</button>
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Court Type Filter */}
                <select name="courtType" value={filters.courtType} onChange={handleFilterChange} className={commonSelectClasses}>
                    <option value="All">All Court Types</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                </select>

                {/* Coach Filter */}
                <select name="coachId" value={filters.coachId} onChange={handleFilterChange} className={commonSelectClasses}>
                    <option value="All">All Coaches</option>
                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                {/* Group Filter */}
                <select name="groupId" value={filters.groupId} onChange={handleFilterChange} className={commonSelectClasses}>
                    <option value="All">All Groups</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                 <Button variant="secondary" onClick={onAnalyticsClick} className="!p-2.5" title="View Analytics">
                    <Icon name="chart-bar" className="w-5 h-5"/>
                </Button>
                <Button variant="secondary" onClick={onBlockSlotClick} className="!p-2.5" title="Block a time slot">
                    <Icon name="lock-closed" className="w-5 h-5"/>
                </Button>
                <Button variant="secondary" onClick={onTemplatesClick} className="!p-2.5" title="Manage Templates">
                    <Icon name="template" className="w-5 h-5"/>
                </Button>
                <Button variant="secondary" onClick={onPrintClick} className="!p-2.5" title="Print Schedule">
                    <Icon name="printer" className="w-5 h-5"/>
                </Button>
            </div>
        </div>
    );
};

export default PlannerFilters;