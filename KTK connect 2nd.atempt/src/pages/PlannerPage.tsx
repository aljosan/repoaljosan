import React, { useMemo, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SortableItem from '../components/common/SortableItem';

interface DraftSession {
  id: string;
  title: string;
  focus: 'technical' | 'tactical' | 'physical' | 'mental';
}

const PlannerPage: React.FC = () => {
  const [drafts, setDrafts] = useState<DraftSession[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const oldIndex = drafts.findIndex((draft) => draft.id === active.id);
    const newIndex = drafts.findIndex((draft) => draft.id === over.id);
    setDrafts((items) => arrayMove(items, oldIndex, newIndex));
  };

  const handleAddDraft = () => {
    const newDraft: DraftSession = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      title: 'New session',
      focus: 'technical',
    };
    setDrafts((items) => [...items, newDraft]);
  };

  const ids = useMemo(() => drafts.map((draft) => draft.id), [drafts]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Training Planner</h2>
        <p className="mt-2 text-sm text-slate-500">
          Coaches build weekly plans per group and drag sessions to reorder the schedule.
        </p>
      </div>

      <Card title="Weekly plan">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Draft sessions are local until you publish them to Firestore.
          </p>
          <Button variant="secondary" onClick={handleAddDraft}>
            Add draft session
          </Button>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-4">
          {drafts.length === 0 ? (
            <p className="text-sm text-slate-500">
              No draft sessions yet. Add a draft session to start dragging.
            </p>
          ) : (
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {drafts.map((draft) => (
                    <SortableItem key={draft.id} id={draft.id}>
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                        <p className="font-semibold text-slate-800">{draft.title}</p>
                        <p className="mt-1 text-xs uppercase text-slate-500">Focus: {draft.focus}</p>
                      </div>
                    </SortableItem>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Session details">
          <form className="grid gap-4 text-sm">
            <label className="grid gap-2">
              Group
              <select className="rounded-lg border border-slate-200 px-3 py-2">
                <option>Select group</option>
              </select>
            </label>
            <label className="grid gap-2">
              Court
              <select className="rounded-lg border border-slate-200 px-3 py-2">
                <option>Select court</option>
              </select>
            </label>
            <label className="grid gap-2">
              Date & time
              <input type="datetime-local" className="rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="grid gap-2">
              Focus
              <select className="rounded-lg border border-slate-200 px-3 py-2">
                <option value="technical">Technical</option>
                <option value="tactical">Tactical</option>
                <option value="physical">Physical</option>
                <option value="mental">Mental</option>
              </select>
            </label>
            <label className="grid gap-2">
              Notes
              <textarea className="min-h-[100px] rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <Button type="button">Save session</Button>
          </form>
        </Card>
        <Card title="Coach access">
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-lg border border-dashed border-slate-200 p-3">
              Coaches only see the groups linked to their user profile.
            </div>
            <div className="rounded-lg border border-dashed border-slate-200 p-3">
              Admins can view and edit every plan across the club.
            </div>
            <div className="rounded-lg border border-dashed border-slate-200 p-3">
              Drag and drop updates the order before publishing.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlannerPage;
