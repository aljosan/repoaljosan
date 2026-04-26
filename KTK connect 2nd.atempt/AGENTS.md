# AGENTS.md

## Project Overview

KTK Connect is a tennis club management app for Kristiansand Tennisklubb. The app should support the club's daily operations for admins, coaches, players, and parents.

Core product areas:

- Court booking
- Group and team organization
- Coach planning
- Player and parent communication
- Reports and analytics

Target stack:

- React 19+
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Context plus custom hooks
- DnD Kit for drag-and-drop
- Mock data for v1
- Backend-ready architecture for later Firebase or Supabase integration

## Current Repository Structure

This GitHub repository contains the KTK Connect app inside:

- `KTK connect 2nd.atempt/`

Current project-level structure observed from GitHub:

- `package.json` - project scripts and dependencies
- `index.html` - Vite HTML entry; currently loads `/src/main.tsx`
- `vite.config.ts` - Vite config with `@` mapped to `./src`
- `jest.config.ts` - Jest test configuration
- `firestore.rules` - Firestore security rules
- `App.tsx` and `index.tsx` - older root-level app entry files; not the active Vite entrypoint while `index.html` points to `/src/main.tsx`
- `components/` - existing component folder at the project root
- `context/` - existing React Context folder at the project root
- `hooks/` - existing custom hooks folder at the project root
- `services/` - existing service layer folder at the project root
- `src/app/` - active React Router route tree in `src/app/App.tsx`
- `src/components/` - newer reusable components used by the active `src` app
- `src/contexts/` - newer React Context providers, including auth
- `src/data/` - mock data
- `src/hooks/` - newer custom hooks
- `src/pages/` - active route-level pages
- `src/services/` - Firebase-backed service modules
- `src/types/` - newer domain and role types
- `src/utils/` - newer shared utilities
- `src/__tests__/` and `src/test/` - Jest tests and test setup
- `utils/` - existing shared utility folder at the project root

Recommended direction without moving files:

- Keep using the current structure unless a task explicitly asks for a migration.
- Treat `src/main.tsx` and `src/app/App.tsx` as the active application path.
- Treat root `App.tsx`, root `index.tsx`, root `components/`, root `context/`, root `hooks/`, root `services/`, root `types.ts`, and root `utils/` as legacy or shared code until a task intentionally consolidates them.
- Put route-level React screens under `src/pages/` when adding new pages.
- Put active app shell and routing changes in `src/app/App.tsx`.
- Prefer `src/components/`, `src/contexts/`, `src/hooks/`, `src/services/`, `src/types/`, `src/utils/`, and `src/data/` for new active app code.
- Edit root-level folders only when the existing feature or test already imports them.
- Add mock data in `src/data/` or a feature-local data file instead of embedding large fixtures inside components.

## Active App Path And Legacy Code

The active Vite app path is:

1. `index.html`
2. `src/main.tsx`
3. `src/app/App.tsx`

Future agents should treat this path as the source of truth for runtime behavior. Do not edit root-level legacy files when implementing active app features unless the task explicitly asks for a legacy migration or a test imports that file.

Likely inactive root-level legacy app files and folders:

- `App.tsx`
- `index.tsx`
- `components/`
- `context/`
- `hooks/`
- `services/`
- `types.ts`
- `utils/`
- `constants.ts`

Some `src/` compatibility files re-export root-level modules so older copied code can still resolve imports. These are compatibility shims, not a signal to add new active code outside `src/`.

The active `/planner` route currently renders `src/pages/PlannerPage.tsx`. Do not treat `src/components/views/Planner.tsx` or `src/components/planner/` as active planner code unless a task explicitly asks to migrate that copied planner tree.

See `LEGACY_CODE.md` for the concise quarantine list.

## Available Commands

The real scripts currently defined in `KTK connect 2nd.atempt/package.json` are:

- `npm run dev` - start the Vite development server
- `npm run build` - build the Vite app
- `npm run typecheck` - type-check the active `src/main.tsx` app graph with `tsconfig.typecheck.json`
- `npm run preview` - preview the production build locally
- `npm run test` - run Jest tests

Use these scripts from the `KTK connect 2nd.atempt/` directory.

Do not invent new commands in documentation or automation unless `package.json` is updated in the same task.

## Architecture Rules

- Keep the app frontend-first for v1, but respect the existing Firebase Auth, Firestore services, and `firestore.rules` already in the repo.
- Use `src/data/mockData.ts` or local mock state where live persistence is not required.
- Keep backend integrations behind service modules. React components should not import Firebase, Supabase, or database SDKs directly.
- Keep service APIs backend-ready: return typed data, isolate persistence details, and avoid leaking mock implementation details into UI code.
- Use React Router for app navigation and protected routes. The active routes currently live in `src/app/App.tsx`.
- Use React Context for shared app or feature state that must be available across multiple screens.
- Prefer custom hooks for reusable UI state, data access orchestration, filtering, sorting, and derived data.
- Use DnD Kit for drag-and-drop workflows such as coach planning, group assignment, court scheduling, and roster ordering.
- Keep route files, page components, services, hooks, and types small enough to understand without cross-file guesswork.
- Model tennis club concepts explicitly: courts, bookings, groups, teams, coaches, players, parents, sessions, attendance, evaluations, messages, and reports.
- Keep Firebase or Supabase readiness as an architectural boundary, not as a reason to add backend code before it is needed.

## Coding Conventions

- Use TypeScript for app code.
- Use `PascalCase` for React components and type-like constructs.
- Use `camelCase` for functions, variables, service methods, and hooks.
- Prefix React hooks with `use`.
- Prefer named exports for components, hooks, services, utilities, and types unless the surrounding file already uses a different convention.
- Keep components focused on rendering, local interactions, and composition.
- Move reusable business logic into hooks, services, or utilities.
- Keep domain types close to existing type definitions or add a clear shared type location if one already exists.
- Use Tailwind CSS utilities consistently for styling.
- Prefer clear operational UI labels such as "Book court", "Assign coach", "Attendance", "Evaluate player", and "Message parents".
- Avoid broad abstractions until there are at least two concrete uses.
- Add comments only for non-obvious domain behavior, permission rules, or implementation tradeoffs.

## Role Model

Design features around these roles:

- Admin: manages club setup, courts, groups, schedules, users, permissions, and reports.
- Coach: plans sessions, manages attendance, evaluates players, communicates with groups, and reviews player progress.
- Player: views schedule, bookings, group information, messages, and personal progress.
- Parent: views child schedules, group messages, attendance, evaluations, and coach or admin communication.

Role rules:

- Keep authorization decisions explicit in route guards, service boundaries, or role-aware hooks.
- Do not bury role assumptions inside presentational components.
- Use role-specific actions and navigation when screens become crowded.
- Mock role permissions in v1 in a way that can later map to Firebase or Supabase auth claims.

## Feature Priorities

Build in this order unless the task says otherwise:

1. Authentication shell and protected app layout
2. Groups and teams overview
3. Player profiles and parent links
4. Coach session planner
5. Attendance and player evaluation flow
6. Court booking calendar
7. Group and parent communication
8. Reports and analytics
9. Backend integration hardening

For v1, prefer complete mock-data user flows over partial live backend integration.

## Validation Rules

- Inspect the current files before editing.
- Keep changes scoped to the requested feature or fix.
- Do not move files just to match an ideal structure.
- Run lightweight validation first.
- Use the real scripts from `package.json` when validation is needed.
- For app changes, `npm run build` is the main production validation.
- Run `npm run typecheck` for active-app TypeScript validation before broadening checks to legacy files.
- For testable behavior, run `npm run test` or the narrowest available test command.
- Do not assume `npm run build` performs a separate TypeScript type-check; the current script is `vite build`.
- For UI work, verify the relevant screen in a browser when a dev server is available.
- For routing changes, check affected paths and protected-route behavior.
- For DnD Kit work, verify pointer and keyboard interactions where practical.
- For reports and analytics, verify calculations against simple known examples.

## Do Not Rules

- Do not install dependencies unless the task explicitly asks for it.
- Do not introduce backend code or database schema changes for frontend-only tasks.
- Do not import Firebase or Supabase directly into UI components.
- Do not replace mock data with live persistence unless requested.
- Do not reorganize folders during unrelated tasks.
- Do not create large global state containers for narrow feature state.
- Do not hard-code role behavior in scattered components.
- Do not add unrelated formatting churn.
- Do not commit secrets, API keys, `.env` files, or local machine paths.
- Do not run heavy commands, migrations, dependency installs, or broad test suites unless necessary for the task.
