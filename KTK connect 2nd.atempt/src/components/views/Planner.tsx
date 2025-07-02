import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { useClub } from '../../context/ClubContext';
import { UserRole, Booking, Group, User, ConflictCheckResult } from '../../types';
import GroupSidebar from '../planner/GroupSidebar';
import PlannerGrid from '../planner/PlannerGrid';
import Icon from '../ui/Icon';
import CreateSessionModal from '../planner/CreateSessionModal';
import EditSessionModal from '../planner/EditSessionModal';
import EditRecurrenceModal from '../planner/EditRecurrenceModal';
import TemplateModal from '../planner/TemplateModal';
import BlockSlotModal from '../planner/BlockSlotModal';
import PlannerFilters from '../planner/PlannerFilters';
import PlannerWeekGrid from '../planner/PlannerWeekGrid';
import { ALL_COURTS, BOOKING_END_HOUR, BOOKING_START_HOUR } from '../../constants';
import BulkActionsToolbar from '../planner/BulkActionsToolbar';
import { printSchedule } from '../../utils/print';
import AnalyticsModal from '../planner/AnalyticsModal';


type CreateSessionInfo = {
    groupId: string;
    courtId: number;
    startTime: Date;
}

type EditTarget = {
    booking: Booking;
    isRecurring: boolean;
}

const Planner: React.FC = () => {
    const { 
        currentUser, allBookings, groups, users, blockedSlots, createGroupBooking, updateBooking, cancelBooking, addRecurringBooking, blockSlot, getBookingConflicts,
        moveMultipleBookings, cancelMultipleBookings 
    } = useClub();
    
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filters, setFilters] = useState<{ courtType: 'All' | 'Indoor' | 'Outdoor', coachId: string | 'All', groupId: string | 'All' }>({ courtType: 'All', coachId: 'All', groupId: 'All' });
    
    const [createSessionInfo, setCreateSessionInfo] = useState<CreateSessionInfo | null>(null);
    const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
    const [isEditRecurrenceModalOpen, setEditRecurrenceModalOpen] = useState(false);
    const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
    const [isBlockSlotModalOpen, setBlockSlotModalOpen] = useState(false);
    const [isAnalyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    
    const [potentialConflicts, setPotentialConflicts] = useState<Map<string, ConflictCheckResult>>(new Map());
    const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );


    useEffect(() => {
        setEditTarget(null);
        setSelectedBookingIds(new Set()); 
    }, [selectedDate, viewMode, filters]);


    if (currentUser.role !== UserRole.Admin && currentUser.role !== UserRole.Coach) {
        return <div className="text-center py-16"><Icon name="close" /> Access Denied</div>;
    }

    const filteredBookingsAndSlots = useMemo(() => {
        const coachFilter = (b: Booking) => {
            if (filters.coachId === 'All') return true;
            const group = groups.find(g => g.id === b.groupId);
            return group?.members.includes(filters.coachId) ?? false;
        };

        const groupFilter = (b: Booking) => filters.groupId === 'All' || b.groupId === filters.groupId;

        const courtTypeFilter = (courtId: number) => {
            if (filters.courtType === 'All') return true;
            const isIndoor = [1,2,3].includes(courtId);
            return (filters.courtType === 'Indoor' && isIndoor) || (filters.courtType === 'Outdoor' && !isIndoor);
        };

        const filteredB = allBookings.filter(b => coachFilter(b) && groupFilter(b) && courtTypeFilter(b.courtId));
        const filteredS = blockedSlots.filter(s => courtTypeFilter(s.courtId));

        return { filteredBookings: filteredB, filteredBlockedSlots: filteredS };

    }, [allBookings, blockedSlots, filters, groups]);

    const getBookingsForDateRange = (startDate: Date, endDate: Date) => {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        const bookingsInRange = filteredBookingsAndSlots.filteredBookings.filter(b => {
            const bStart = new Date(b.startTime);
            return bStart >= start && bStart <= end;
        });
        const slotsInRange = filteredBookingsAndSlots.filteredBlockedSlots.filter(s => {
            const sStart = new Date(s.startTime);
            return sStart >= start && sStart <= end;
        })
        return { bookingsInRange, slotsInRange };
    };
    
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (selectedBookingIds.has(active.id as string) && selectedBookingIds.size > 1) {
            return;
        }

        if (active.data.current?.type === 'group') {
            const groupId = active.id as string;
            const newConflicts = new Map<string, ConflictCheckResult>();
            
            const durationMs = 60 * 60 * 1000; 

            const timeSlots = Array.from({ length: (BOOKING_END_HOUR - BOOKING_START_HOUR) * 2 }, (_, i) => {
                const time = new Date(selectedDate);
                time.setHours(BOOKING_START_HOUR, 0, 0, 0);
                time.setMinutes(i * 30);
                return time;
            });
            
            ALL_COURTS.forEach(courtId => {
                timeSlots.forEach(startTime => {
                    const endTime = new Date(startTime.getTime() + durationMs);
                    const conflict = getBookingConflicts(courtId, startTime, endTime, { groupId });
                    if (conflict.conflict) {
                        newConflicts.set(`droppable-${courtId}-${startTime.getTime()}`, conflict);
                    }
                });
            });
            setPotentialConflicts(newConflicts);
        }
    };
    
    const handleDragEnd = (event: DragEndEvent) => {
        setPotentialConflicts(new Map()); 
        const { active, over } = event;
        if (!over?.data.current) return;
        
        const overData = over.data.current as { courtId: number, startTime: Date };
        
        if (active.data.current?.type === 'group') {
            setCreateSessionInfo({ groupId: active.id as string, courtId: overData.courtId, startTime: overData.startTime });
        } else if (active.data.current?.type === 'session') {
            const isBulkMove = selectedBookingIds.has(active.id as string);

            if (isBulkMove) {
                moveMultipleBookings(selectedBookingIds, active.id as string, overData.startTime);
            } else {
                 const movedBooking = active.data.current?.booking as Booking;
                 const durationMs = new Date(movedBooking.endTime).getTime() - new Date(movedBooking.startTime).getTime();
                 const newStartTime = new Date(overData.startTime);
                 const newEndTime = new Date(newStartTime.getTime() + durationMs);
                 handleEdit(movedBooking, { courtId: overData.courtId, startTime: newStartTime, endTime: newEndTime });
            }
        }
    };
    
    const handleSessionSelect = (bookingId: string, e: React.MouseEvent) => {
        const newSelection = new Set(selectedBookingIds);
        if (e.ctrlKey || e.metaKey) {
            if (newSelection.has(bookingId)) {
                newSelection.delete(bookingId);
            } else {
                newSelection.add(bookingId);
            }
        } else {
            if (newSelection.has(bookingId) && newSelection.size === 1) {
                newSelection.clear();
            } else {
                newSelection.clear();
                newSelection.add(bookingId);
            }
        }
        setSelectedBookingIds(newSelection);
    };

    const handleBulkDelete = () => {
        if(window.confirm(`Are you sure you want to delete ${selectedBookingIds.size} sessions? This action cannot be undone.`)) {
            cancelMultipleBookings(Array.from(selectedBookingIds));
            setSelectedBookingIds(new Set());
        }
    };

    const handleCreateSession = ({ durationMinutes, notes }: { durationMinutes: number, notes: string }) => {
        if (!createSessionInfo) return;
        const { groupId, courtId, startTime } = createSessionInfo;
        const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
        createGroupBooking(groupId, courtId, startTime, endTime, notes);
        setCreateSessionInfo(null);
    };

    const handleEdit = (booking: Booking, updates: Partial<Booking>) => {
        if (booking.recurringRuleId && !booking.isException) {
            setEditTarget({ booking: {...booking, ...updates}, isRecurring: true });
            setEditRecurrenceModalOpen(true);
        } else {
            // It's a single booking or an exception, so open the main edit modal directly
            setEditTarget({ booking: {...booking, ...updates}, isRecurring: false });
        }
    };
    
    const handleDoubleClickEdit = (booking: Booking) => {
        setSelectedBookingIds(new Set());
        // This is the entry point for editing, check for recurrence here.
        if (booking.recurringRuleId && !booking.isException) {
             setEditTarget({booking: booking, isRecurring: true});
             setEditRecurrenceModalOpen(true);
        } else {
            setEditTarget({booking: booking, isRecurring: !!booking.recurringRuleId});
        }
    }

    const handleConfirmRecurrenceEdit = (editSeries: boolean) => {
        if (!editTarget) return;
        // If they choose to edit only this one, we open the main modal
        if (!editSeries) {
            setEditRecurrenceModalOpen(false); // Close this modal, main edit modal will be open because editTarget is still set
        } else { // If they choose to edit the series, we can do it with the info we have
            updateBooking(editTarget.booking.id, editTarget.booking, true);
            setEditRecurrenceModalOpen(false);
            setEditTarget(null);
        }
    };

    const handleSaveFromEditModal = (updates: Partial<Booking>) => {
        if (!editTarget) return;
        // The editSeries flag is now determined by what the user chose previously
        updateBooking(editTarget.booking.id, updates, false);
        setEditTarget(null);
    };

    const handleDelete = (booking: Booking) => {
        cancelBooking(booking.id);
        setEditTarget(null);
    };

    const coaches: User[] = useMemo(() => users.filter(u => u.role === UserRole.Coach), [users]);
    const weekStartDate = new Date(selectedDate);
    weekStartDate.setDate(weekStartDate.getDate() - (weekStartDate.getDay() === 0 ? 6 : weekStartDate.getDay() - 1));

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setPotentialConflicts(new Map())} collisionDetection={closestCenter}>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Group Session Planner</h1>
                    
                    <PlannerFilters 
                        filters={filters}
                        setFilters={setFilters}
                        coaches={coaches}
                        groups={groups}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onBlockSlotClick={() => setBlockSlotModalOpen(true)}
                        onTemplatesClick={() => setTemplateModalOpen(true)}
                        onPrintClick={() => {
                            const rangeEnd = new Date(weekStartDate);
                            rangeEnd.setDate(weekStartDate.getDate() + 6);
                            const { bookingsInRange, slotsInRange } = getBookingsForDateRange(weekStartDate, rangeEnd);
                            printSchedule(bookingsInRange, slotsInRange, groups, users, weekStartDate, rangeEnd);
                        }}
                        onAnalyticsClick={() => setAnalyticsModalOpen(true)}
                    />

                    {selectedBookingIds.size > 0 && viewMode === 'day' && (
                         <BulkActionsToolbar
                            selectedCount={selectedBookingIds.size}
                            onDelete={handleBulkDelete}
                            onClear={() => setSelectedBookingIds(new Set())}
                        />
                    )}
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-4 min-h-0">
                    {viewMode === 'day' && <div className="lg:w-72 flex-shrink-0"><GroupSidebar selectedDate={selectedDate} /></div>}
                    <div className="flex-1 bg-white rounded-lg shadow-md p-2 sm:p-4 min-w-0 overflow-auto">
                        {viewMode === 'day' ? (
                            <PlannerGrid 
                                selectedDate={selectedDate} 
                                onEditSession={handleDoubleClickEdit}
                                onSessionSelect={handleSessionSelect}
                                selectedBookingIds={selectedBookingIds}
                                bookings={getBookingsForDateRange(selectedDate, selectedDate).bookingsInRange}
                                blockedSlots={getBookingsForDateRange(selectedDate, selectedDate).slotsInRange}
                                potentialConflicts={potentialConflicts}
                            />
                        ) : (
                            <PlannerWeekGrid 
                                startDate={weekStartDate}
                                bookings={getBookingsForDateRange(weekStartDate, new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)).bookingsInRange}
                                blockedSlots={getBookingsForDateRange(weekStartDate, new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000)).slotsInRange}
                            />
                        )}
                    </div>
                </div>
            </div>

            <CreateSessionModal isOpen={!!createSessionInfo} onClose={() => setCreateSessionInfo(null)} onSubmit={handleCreateSession} />
            
            {editTarget && (
                 <EditSessionModal
                    key={editTarget.booking.id}
                    isOpen={!!editTarget && !isEditRecurrenceModalOpen}
                    onClose={() => setEditTarget(null)}
                    onSave={handleSaveFromEditModal}
                    onDelete={() => handleDelete(editTarget.booking)}
                    booking={editTarget.booking}
                    onAddRecurring={addRecurringBooking}
                />
            )}
            
            <EditRecurrenceModal isOpen={isEditRecurrenceModalOpen} onClose={() => setEditRecurrenceModalOpen(false)} onConfirm={handleConfirmRecurrenceEdit} />
            <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setTemplateModalOpen(false)} />
            <BlockSlotModal isOpen={isBlockSlotModalOpen} onClose={() => setBlockSlotModalOpen(false)} onBlock={blockSlot} />
            <AnalyticsModal 
                isOpen={isAnalyticsModalOpen} 
                onClose={() => setAnalyticsModalOpen(false)}
                allBookings={allBookings}
                users={users}
                groups={groups}
            />
        </DndContext>
    );
};

export default Planner;