# CLAUDE.md - Team Ride Pro (Little Brave Schedule管理Pro)

## Project Overview

A Japanese-language team scheduling and car allocation web application for youth sports teams. Manages event calendars, team member participation, and ride-sharing coordination.

**Tech Stack:**
- React 19.2 + TypeScript
- Vite 7.x (dev server on port 5177)
- TailwindCSS 3.x for styling
- Firebase Realtime Database for cloud storage
- Lucide React for icons

## Quick Reference

```bash
# Development
npm run dev      # Start dev server at http://localhost:5177
npm run build    # TypeScript check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Project Structure

```
team-ride-pro/
├── src/
│   ├── App.tsx          # Main application (monolithic, ~1500 lines)
│   ├── Login.jsx        # Login component with passcode auth
│   ├── firebase.js      # Firebase configuration
│   ├── main.tsx         # React entry point
│   ├── index.css        # Tailwind + custom animations
│   ├── firebase.d.ts    # Type declarations
│   └── Login.d.ts       # Type declarations
├── public/              # Static assets
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript config
├── eslint.config.js     # ESLint configuration
└── database.rules.json  # Firebase security rules
```

## Key Features

1. **Calendar Management** - Create/edit single and multi-day events with recurring options
2. **Car Allocation** - Drag-and-drop assignment of members to vehicles
3. **Member Management** - Track team members and participation status
4. **Report Generation** - Copy-to-clipboard formatted reports for sharing
5. **Role-Based Access** - Admin (edit) vs Viewer (read-only) modes
6. **Offline Support** - LocalStorage backup when Firebase unavailable

## Data Models

### Member
```typescript
{
  id: number,           // Unique ID (Date.now())
  name: string,         // Japanese name
  participating: boolean // Active participation status
}
```

### Car
```typescript
{
  id: number,
  owner: string,        // Car owner name
  capacity: number,     // Max passengers (including driver)
  note: string,         // Optional notes
  driver: string,       // Driver name
  familyMembers: string[] // Additional family passengers
}
```

### Calendar Event
```typescript
{
  id: number,
  title: string,
  date: string,          // YYYY-MM-DD format
  endDate?: string,      // For multi-day events
  startTime?: string,
  endTime?: string,
  type: 'practice' | 'tournament' | 'other',
  isRecurring: boolean,
  recurringDays: number[], // 0-6 (Sunday-Saturday)
  note: string,
  cars: Car[],           // Event-specific cars
  assignments: { [carId: string]: number[] }, // Member IDs per car
  scheduleItems: { id: number, time: string, content: string }[],
  eventNotes: string,
  eventItems: string     // Items to bring
}
```

## Firebase Structure

```
teamData/
├── members/          # Array of Member objects
├── cars/             # Array of Car objects
└── calendarEvents/   # Array of Event objects
```

## Authentication

Simple passcode-based authentication stored in session:
- **Admin passcode**: `1234` (full edit access)
- **Viewer passcode**: `5678` (read-only access)

Role stored in `sessionStorage.userRole`.

## Important Conventions

### Language
- All UI text is in Japanese
- Comments and code use English variable names

### TypeScript
- App.tsx uses `// @ts-nocheck` directive (type checking disabled)
- Type declarations exist for Login and firebase modules
- `tsconfig.app.json` has `strict: false`

### Date Handling
- Use `formatLocalDate(date)` utility for consistent YYYY-MM-DD formatting
- Dates stored as strings in Firebase

### Styling
- Use Tailwind utility classes exclusively
- Custom animation class: `.animate-fadeIn`
- Color scheme: Blue/Indigo primary, Purple for calendar, Green for success

### State Management
- React useState hooks (no external state library)
- Data auto-syncs to Firebase on changes (admin only)
- LocalStorage backup at `teamRideDataPro` key

## Common Tasks

### Adding New Member
1. Navigate to Settings tab
2. Enter name in input field
3. Click add button or press Enter

### Creating Event
1. Go to Calendar tab
2. Click "イベントを追加" button
3. Fill form (title and date required)
4. For recurring: check isRecurring and select days

### Car Allocation
1. Edit an event from calendar
2. Add cars to the event
3. Drag members to cars (respects capacity limits)
4. Member assignments saved per-event

### Sharing Reports
1. Go to Share tab
2. Future events displayed in list
3. Click "テキストをコピー" to copy formatted report

## Development Notes

### Monolithic App.tsx
The main App.tsx file contains all application logic including:
- SVG car icons (mini-van, sedan, k-car)
- All state management
- Firebase sync logic
- All UI components
- Drag-and-drop handlers
- Report generation

Consider refactoring into separate components if adding significant features.

### Firebase Real-time Sync
- `onValue` listeners set up on login
- Auto-save on state changes (debouncing not implemented)
- Cleanup on component unmount

### Touch Support
- Touch events implemented for mobile drag-and-drop
- Modal-based car selection for mobile devices
