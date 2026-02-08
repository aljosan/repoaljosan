# KTK Connect

KTK Connect is a modern tennis club management platform for court booking, team organization,
training planning, attendance tracking, and internal communications. The application is designed
for growth with modular feature areas, role-based access control, and clean separation between UI,
state, and services.

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS
- React Router
- React Context + hooks
- DnD Kit for drag-and-drop training planning
- Firebase Auth + Firestore

## Local Development
**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file at the project root:
   ```bash
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Folder Structure
```
src/
  app/                # App shell + routes
  components/         # Reusable UI components
  contexts/           # React Context providers
  hooks/              # Custom hooks
  pages/              # Feature pages
  services/           # Firebase integration + API helpers
  types/              # Strong TypeScript models
  utils/              # Shared utilities
```

## Database Schema (Firestore Collections)
| Collection | Purpose | Key Fields |
| --- | --- | --- |
| users | Auth profiles + role assignments | `role`, `linkedPlayerIds`, `coachGroupIds` |
| courts | Court inventory | `name`, `surface`, `isIndoor` |
| bookingRules | Booking constraints | `maxDurationMinutes`, `priorityRoleIds`, `isActive` |
| bookings | Court reservations | `courtId`, `userId`, `startTime`, `endTime`, `status` |
| groups | Training groups | `coachId`, `level`, `ageBand`, `playerIds` |
| sessions | Training sessions | `groupId`, `courtId`, `startTime`, `durationMinutes`, `focus` |
| attendance | Attendance per session | `sessionId`, `playerId`, `status` |
| announcements | Message board posts | `title`, `message`, `authorId`, `groupId` |
| notifications | In-app alerts | `userId`, `title`, `description`, `isRead` |

## Role-Based Access Logic
- **Admin:** Full access to all modules, data, and overrides.
- **Coach:** Sees only groups and sessions linked to their profile.
- **Player:** Sees personal bookings, attendance, and announcements.
- **Parent:** Read-only visibility into linked players.

## Notes
- All dynamic content should be sourced from Firestore. UI placeholders describe where data will
  be connected without hard-coded mock data in production paths.
- Notifications should trigger email delivery via Firebase Extensions or Cloud Functions.
