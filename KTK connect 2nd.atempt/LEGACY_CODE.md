# Legacy Code

The active KTK Connect app is loaded through:

1. `index.html`
2. `src/main.tsx`
3. `src/app/App.tsx`

Use the active `src/` app path for normal feature work.

## Quarantined Root-Level App Tree

These root-level files and folders are likely legacy or inactive for the current Vite runtime:

- `App.tsx`
- `index.tsx`
- `components/`
- `context/`
- `hooks/`
- `services/`
- `types.ts`
- `utils/`
- `constants.ts`

Do not delete, move, or refactor these files during unrelated work. Edit them only when a task explicitly targets legacy cleanup, migration, or a test that imports them.

## Notes

- `index.html` currently points to `/src/main.tsx`, not root `index.tsx`.
- `src/main.tsx` mounts `src/app/App.tsx`.
- New active app code should live under `src/`.
- Compatibility re-export files under `src/` may reference root legacy modules to keep older copied code importable.

## Quarantined Copied Planner Tree

The active `/planner` route renders `src/pages/PlannerPage.tsx`.

These copied planner files are not reached from the active app path:

- `src/components/views/Planner.tsx`
- `src/components/planner/AnalyticsModal.tsx`
- `src/components/planner/BlockSlotModal.tsx`
- `src/components/planner/BulkActionsToolbar.tsx`
- `src/components/planner/CreateSessionModal.tsx`
- `src/components/planner/DraggableGroupCard.tsx`
- `src/components/planner/EditRecurrenceModal.tsx`
- `src/components/planner/EditSessionModal.tsx`
- `src/components/planner/GroupSidebar.tsx`
- `src/components/planner/PlannerFilters.tsx`
- `src/components/planner/PlannerGrid.tsx`
- `src/components/planner/PlannerWeekGrid.tsx`
- `src/components/planner/ResizableSessionCard.tsx`
- `src/components/planner/TemplateModal.tsx`

Do not edit or wire these files into the active route unless the task explicitly asks to migrate the copied planner experience. Keep normal planner feature work in `src/pages/PlannerPage.tsx` and active `src` components.
