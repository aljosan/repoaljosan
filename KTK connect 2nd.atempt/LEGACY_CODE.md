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
