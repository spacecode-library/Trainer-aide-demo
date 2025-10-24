# Agent Development Instructions - Trainer Aide Demo

## 🎯 Mission Brief

You are tasked with building a **standalone, high-quality frontend demo** of the Trainer Aide feature for the Wondrous fitness platform. This is a **complete redesign** that must showcase modern, clean UI and intuitive workflows for three user roles: Studio Owner, Trainer, and Client.

**Important Context:** A previous agent has already analyzed the existing Wondrous Trainer Aide implementation (located at `/Users/mukelakatungu/wondrous-store-platform/src/`) and created comprehensive requirements for this demo. Your job is to build the demo from scratch following those requirements.

---

## 📚 Required Reading (Do This First!)

**BEFORE writing any code, you MUST:**

1. **Read the complete requirements document:**
   - Location: `./TRAINER_AIDE_DEMO_REQUIREMENTS.md` (in this directory)
   - This is an 82KB document with EVERYTHING you need
   - Contains: tech stack, design system, data models, mock data, component specs, mobile patterns, and a 7-day workflow

2. **Understand the reference projects:**
   - **wellness-frontend**: Located at `/Users/mukelakatungu/wellness-frontend/src`
     - Good: Component organization, clean dashboards, proper spacing
     - Learn from: Layout structure, consistent spacing, error handling
   - **class-dash-demo**: Located at `/Users/mukelakatungu/class-dash-demo/src/app/demo`
     - Good: Clean hero section, Airbnb-style cards, no gradient buttons, professional typography
     - Learn from: Simple, modern UI, smart filtering, mobile-first design
   - **Your goal:** Build something BETTER than both of these

3. **Understand what you're replacing:**
   - Current implementation: `/Users/mukelakatungu/wondrous-store-platform/src/app/trainer-aide/`
   - Current problems: Heavy gradients, cluttered UI, inconsistent design
   - Study the existing types: `/Users/mukelakatungu/wondrous-store-platform/src/types/trainer-aide.ts`
   - Study the existing data models to understand the structure

---

## 🎨 Design Mandate (CRITICAL)

### ✅ YOU MUST:
- Use **SOLID COLORS ONLY** - No gradients anywhere
- Follow the **Wondrous brand colors** exactly:
  - Primary Magenta: `#a71075`
  - Cyan: `#45f2ff`
  - Blue: `#00bafc`
  - Dark Blue: `#0085c4`
- Use **clean white cards** with subtle shadows
- Maintain **consistent spacing** throughout (use Tailwind's spacing scale)
- Create a **mobile-first** responsive design
- Ensure **44x44px minimum touch targets** on mobile
- Follow **Apple/Airbnb design principles**: Simple, clean, functional

### ❌ YOU MUST NOT:
- Use gradient backgrounds (`bg-gradient-to-*`)
- Use gradient buttons
- Use animated gradients
- Use heavy shadows or effects
- Create cluttered layouts
- Copy the old Wondrous design (it's what we're replacing!)

---

## 🏗️ Project Structure & Tech Stack

### Technology Requirements

```json
{
  "framework": "Next.js 14 with App Router",
  "language": "TypeScript (strict mode)",
  "styling": "Tailwind CSS",
  "ui_library": "shadcn/ui (Radix UI primitives)",
  "state_management": "Zustand for global state, React Context for theme",
  "forms": "React Hook Form + Zod validation",
  "icons": "Lucide React",
  "animations": "Framer Motion (minimal, subtle only)",
  "storage": "LocalStorage for demo persistence"
}
```

### Expected File Structure

```
trainer-aide-demo/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Landing page (role selector for demo)
│   ├── studio-owner/
│   │   ├── page.tsx                  # Dashboard
│   │   ├── templates/
│   │   │   ├── page.tsx              # Template library
│   │   │   └── builder/page.tsx      # Template builder
│   │   └── sessions/page.tsx         # All sessions view
│   ├── trainer/
│   │   ├── page.tsx                  # Trainer dashboard
│   │   ├── templates/page.tsx        # View assigned templates (READ-ONLY)
│   │   ├── sessions/
│   │   │   ├── page.tsx              # Session list (in progress + completed)
│   │   │   ├── new/page.tsx          # Start new session
│   │   │   └── [id]/page.tsx         # Session runner (THE MOST IMPORTANT PAGE)
│   │   └── calendar/page.tsx         # Calendar view (mock data)
│   └── client/
│       ├── page.tsx                  # Client dashboard
│       └── history/page.tsx          # Session history
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Main navigation
│   │   ├── MobileNav.tsx             # Mobile menu
│   │   └── Header.tsx                # Page headers
│   ├── studio-owner/
│   │   ├── TemplateBuilder.tsx       # Main builder component
│   │   ├── BlockBuilder.tsx          # Individual block builder
│   │   ├── ExerciseLibrary.tsx       # Exercise picker modal
│   │   ├── ExerciseCard.tsx          # Exercise display card
│   │   └── ExerciseRow.tsx           # Exercise in template
│   ├── trainer/
│   │   ├── SessionRunner.tsx         # Main session interface
│   │   ├── SessionTimer.tsx          # 30-minute countdown
│   │   ├── FullSessionView.tsx       # Sign-off mode: Full session
│   │   ├── PerBlockView.tsx          # Sign-off mode: Per block
│   │   ├── PerExerciseView.tsx       # Sign-off mode: Per exercise
│   │   ├── ExerciseView.tsx          # Exercise display during session
│   │   ├── RPEPicker.tsx             # Rate of perceived exertion picker
│   │   ├── ClientSelector.tsx        # Client selection modal
│   │   └── SessionCompleteModal.tsx  # Completion screen
│   ├── client/
│   │   ├── SessionDetailView.tsx     # Detailed session view
│   │   └── SessionCard.tsx           # Session history card
│   ├── shared/
│   │   ├── StatCard.tsx              # Dashboard stat cards
│   │   ├── EmptyState.tsx            # Empty states
│   │   └── LoadingSpinner.tsx        # Loading states
│   └── ui/
│       └── [shadcn components]       # Button, Card, Input, etc.
├── lib/
│   ├── mock-data/
│   │   ├── index.ts                  # Barrel export
│   │   ├── exercises.ts              # 20+ exercises with full details
│   │   ├── templates.ts              # 3 complete templates
│   │   ├── clients.ts                # 5 mock clients
│   │   ├── sessions.ts               # Mock session data
│   │   └── users.ts                  # Mock users (owner, trainers)
│   ├── stores/
│   │   ├── session-store.ts          # Active session state (Zustand)
│   │   ├── user-store.ts             # Current user/role (Zustand)
│   │   └── template-store.ts         # Templates state (Zustand)
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   └── utils/
│       ├── cn.ts                     # Tailwind class merger
│       ├── storage.ts                # LocalStorage helpers
│       └── generators.ts             # ID generation, etc.
├── styles/
│   └── globals.css                   # Global styles, custom utilities
├── public/
│   └── exercises/                    # Exercise images (optional)
├── .gitignore
├── README.md
├── TRAINER_AIDE_DEMO_REQUIREMENTS.md # Complete requirements (READ THIS FIRST!)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Step-by-Step Development Workflow

### Phase 1: Initial Setup (Start Here!)

1. **Navigate to the project directory:**
   ```bash
   cd /Users/mukelakatungu/trainer-aide-demo
   ```

2. **Initialize Next.js:**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app
   ```
   - When prompted:
     - ✅ TypeScript: Yes
     - ✅ ESLint: Yes
     - ✅ Tailwind CSS: Yes
     - ✅ `src/` directory: No (use app router at root)
     - ✅ App Router: Yes
     - ✅ Import alias: Yes (@/*)

3. **Install all dependencies:**
   ```bash
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
   npm install @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-slider
   npm install @radix-ui/react-avatar @radix-ui/react-tooltip
   npm install lucide-react
   npm install framer-motion
   npm install react-hook-form zod @hookform/resolvers
   npm install zustand
   npm install clsx tailwind-merge
   npm install class-variance-authority
   npm install date-fns
   ```

4. **Install shadcn/ui:**
   ```bash
   npx shadcn-ui@latest init
   ```
   - Choose: Default style, Zinc slate color

   Then add components:
   ```bash
   npx shadcn-ui@latest add button card input select textarea tabs badge
   npx shadcn-ui@latest add dialog dropdown-menu checkbox slider
   npx shadcn-ui@latest add avatar tooltip progress separator
   ```

5. **Configure Tailwind with Wondrous colors:**
   - Edit `tailwind.config.ts`
   - Add the Wondrous color palette (see requirements doc)
   - Add custom font families (Inter, Montserrat)

6. **Create globals.css with custom utilities:**
   - Remove gradient styles
   - Add button utilities (.btn-primary, .btn-secondary, etc.)
   - Add card utilities (.card, .card-interactive, etc.)
   - Add typography utilities (.text-heading-1, .text-heading-2, etc.)

### Phase 2: Data Foundation (Do This Before Any UI!)

1. **Create TypeScript types** (`lib/types/index.ts`):
   - Copy the complete type definitions from the requirements doc
   - Includes: Exercise, WorkoutTemplate, Session, Client, User, etc.

2. **Create mock data files** (in `lib/mock-data/`):
   - `exercises.ts`: 20+ exercises with categories, instructions, equipment
   - `templates.ts`: 3 complete templates (standard 3-block, resistance-only, advanced HIIT)
   - `clients.ts`: 5 mock clients
   - `sessions.ts`: Mock completed sessions
   - `users.ts`: Mock studio owner, trainers
   - `index.ts`: Barrel export for clean imports

3. **Create Zustand stores** (in `lib/stores/`):
   - `user-store.ts`: Current user and role (for demo switching)
   - `session-store.ts`: Active session state with persistence
   - `template-store.ts`: Template management

4. **Create utility functions** (`lib/utils/`):
   - `cn.ts`: Tailwind class name merger
   - `storage.ts`: LocalStorage helpers with error handling
   - `generators.ts`: UUID generation, slug creation

### Phase 3: Layout & Navigation

1. **Create root layout** (`app/layout.tsx`):
   - Set up HTML structure
   - Include Wondrous fonts (Inter, Montserrat)
   - Add metadata

2. **Build Sidebar component** (`components/layout/Sidebar.tsx`):
   - Logo at top
   - Dynamic navigation based on role
   - User info at bottom
   - Active link highlighting
   - Clean, professional styling (NO gradients!)

3. **Build Mobile Navigation** (`components/layout/MobileNav.tsx`):
   - Mobile header with hamburger menu
   - Slide-out drawer
   - Full-screen on mobile

4. **Create landing page** (`app/page.tsx`):
   - Role selector for demo purposes
   - Buttons to switch between Studio Owner, Trainer, Client views
   - Clean, centered layout

### Phase 4: Studio Owner Features

1. **Studio Owner Dashboard** (`app/studio-owner/page.tsx`):
   - Welcome header
   - 4 stat cards (Total Templates, Active Templates, Total Sessions, Avg RPE)
   - Recent templates list
   - Quick action buttons
   - Clean grid layout

2. **Template Library** (`app/studio-owner/templates/page.tsx`):
   - List all templates
   - Search/filter functionality
   - Template cards with key info
   - Actions: Edit, Duplicate, Delete, View Usage
   - Empty state when no templates

3. **Template Builder** (`app/studio-owner/templates/builder/page.tsx`):
   - **THIS IS CRITICAL - MOST COMPLEX FEATURE**
   - Template details form (name, description, type)
   - Template type selector (Standard vs Resistance Only)
   - Block builder for each block:
     - Add/remove blocks
     - Exercise library modal
     - Drag-to-reorder exercises (or up/down arrows)
     - Configure resistance, reps, sets per exercise
     - Cardio MUST be first for standard templates
   - Studio assignment (multi-select)
   - Save/Cancel buttons
   - Validation before save

4. **Exercise Library Modal** (`components/studio-owner/ExerciseLibrary.tsx`):
   - Search by name
   - Filter by muscle group
   - Display exercise cards with:
     - Name
     - Category
     - Equipment
     - Level
     - Preview button
   - Click to select and add to template

### Phase 5: Trainer Features (MOST IMPORTANT!)

1. **Trainer Dashboard** (`app/trainer/page.tsx`):
   - Welcome with trainer name
   - Stats: Templates Assigned, Sessions Today, This Week, Avg RPE
   - Quick start session button
   - Today's scheduled sessions (mock)
   - Recent completed sessions

2. **Templates View** (`app/trainer/templates/page.tsx`):
   - **READ-ONLY** view of assigned templates
   - Template cards showing:
     - Name, description
     - Number of blocks
     - Duration estimate
   - Preview button (expand to see exercises)
   - Start Session button
   - **Cannot edit or create templates**

3. **Start New Session** (`app/trainer/sessions/new/page.tsx`):
   - Select template from assigned templates
   - Select client from list
   - **Choose sign-off mode** (CRITICAL):
     - ⭐ Full Session: Complete all at once
     - ⭐ Per Block: Sign off after each block (recommended)
     - ⭐ Per Exercise: Check off each exercise individually
   - Start button begins session and starts 30-min timer

4. **Session Runner** (`app/trainer/sessions/[id]/page.tsx`):
   - **THIS IS THE MOST CRITICAL PAGE - MUST BE PERFECT**
   - **Three different rendering modes based on sign-off mode:**

   **A. Full Session Mode:**
   - Show ALL blocks expanded at once
   - List all exercises
   - 30-minute timer at top
   - At end (or manual finish):
     - Overall RPE picker
     - Notes textarea
     - Declaration checkbox
     - Complete button

   **B. Per Block Mode:**
   - Show current block exercises
   - Other blocks collapsed (expandable)
   - Progress indicator (Block 2 of 3)
   - After completing each block:
     - Block RPE picker modal
     - Continue to next block
   - After all blocks:
     - Overall RPE
     - Notes
     - Declaration
     - Complete

   **C. Per Exercise Mode (MOBILE-OPTIMIZED):**
   - Show ONE exercise at a time (full screen)
   - Large exercise images (start/end positions)
   - Exercise instructions
   - Input for actual resistance used
   - Input for actual reps
   - Checkbox to mark complete
   - Swipe or buttons to navigate (Previous/Next)
   - Progress bar showing exercise completion
   - After block complete: Block RPE
   - After all blocks: Overall RPE, notes, declaration

5. **Session Timer** (`components/trainer/SessionTimer.tsx`):
   - Large, visible countdown from 30:00
   - Progress bar
   - Warning when < 5 minutes
   - Auto-complete when timer reaches 0:00

6. **RPE Picker** (`components/trainer/RPEPicker.tsx`):
   - Visual scale 1-10
   - Large touch-friendly buttons/slider
   - Descriptions for each level:
     - 1-2: Very easy
     - 3-4: Easy
     - 5-6: Moderate
     - 7-8: Hard
     - 9-10: Very hard
   - Selected value highlighted

7. **Session Completion** (`components/trainer/SessionCompleteModal.tsx`):
   - Session summary (client, template, duration)
   - Block RPEs listed
   - Overall RPE dropdown
   - Notes textarea (performance notes)
   - Recommendations textarea (optional)
   - **Declaration checkbox** (required): "I confirm this workout was completed as prescribed"
   - Save & Complete button (disabled until declaration checked)

8. **My Sessions** (`app/trainer/sessions/page.tsx`):
   - Tabs: In Progress | Completed
   - Session cards showing:
     - Client name
     - Template used
     - Date/time
     - Duration
     - Overall RPE
     - Notes preview
   - Click to view details or resume (if in progress)

### Phase 6: Client Features

1. **Client Dashboard** (`app/client/page.tsx`):
   - Welcome message
   - Next session card (mock data):
     - Trainer name
     - Date/time
     - Location
   - Stats:
     - Sessions this month
     - Average RPE
     - Consistency streak
   - Recent sessions (last 3-5)

2. **Session History** (`app/client/history/page.tsx`):
   - Chronological list of all sessions
   - Session cards:
     - Date
     - Trainer
     - Template
     - Duration
     - RPE
   - Click to expand and see full details
   - **Detailed view shows:**
     - All blocks
     - All exercises completed
     - Weights/resistance used
     - Reps completed
     - Block RPEs
     - Overall RPE
     - Trainer notes
     - Recommendations

### Phase 7: Mobile Optimization

1. **Responsive breakpoints:**
   ```css
   /* Mobile: < 640px */
   /* Tablet: 640px - 1024px */
   /* Desktop: > 1024px */
   ```

2. **Mobile-specific features:**
   - Bottom navigation (alternative to sidebar)
   - Swipe gestures for exercise navigation
   - Large touch targets (44x44px minimum)
   - Optimized forms (larger inputs, better keyboards)
   - Pull-to-refresh on session list

3. **Test on mobile:**
   - Resize browser to 375px (iPhone SE)
   - Test all interactions
   - Ensure nothing is cut off
   - Check touch target sizes

### Phase 8: Polish & Testing

1. **Loading states:**
   - Skeleton loaders for lists
   - Spinner for async operations

2. **Empty states:**
   - No templates: "Create your first template"
   - No sessions: "Start your first session"
   - No clients: Helpful message

3. **Error handling:**
   - Form validation with clear messages
   - Graceful failures
   - User-friendly error messages

4. **LocalStorage persistence:**
   - Save sessions across refreshes
   - Save templates
   - Save user role selection

5. **Accessibility:**
   - Keyboard navigation
   - ARIA labels
   - Focus indicators
   - Screen reader support

6. **Performance:**
   - Lazy load heavy components
   - Optimize images
   - Memoize expensive computations

---

## 🎯 Critical Success Factors

### 1. Design Quality
- **NO GRADIENTS** anywhere
- Solid Wondrous brand colors only
- Clean white cards with subtle shadows
- Consistent spacing (use Tailwind scale)
- Professional typography hierarchy

### 2. Session Runner (MOST IMPORTANT!)
- Must support all 3 sign-off modes perfectly
- Timer must work correctly (30 minutes, auto-complete)
- Exercise images must display properly
- RPE picker must be intuitive
- Mobile experience must be excellent
- Swipe gestures for per-exercise mode

### 3. Template Builder
- Flexible (both standard and resistance-only)
- Easy to add/remove exercises
- Clear validation
- Intuitive exercise library
- Reorder exercises easily

### 4. Mobile Experience
- Touch-friendly (44x44px targets)
- Swipe navigation works
- Forms are easy to use
- No horizontal scrolling
- Looks great on iPhone and Android

### 5. Data Integrity
- Mock data is realistic
- Sessions persist in LocalStorage
- Templates can be created/edited/deleted
- No data loss on refresh

---

## 📊 Quality Checklist

Before marking this project complete, verify:

### Design
- [ ] Zero gradient backgrounds
- [ ] Zero gradient buttons
- [ ] All buttons use solid Wondrous colors
- [ ] Consistent spacing throughout
- [ ] Clean white cards with subtle shadows
- [ ] Professional typography hierarchy
- [ ] Looks better than wellness-frontend
- [ ] Looks better than class-dash-demo

### Functionality
- [ ] Studio owner can create templates
- [ ] Studio owner can edit/delete templates
- [ ] Trainers can view templates (read-only)
- [ ] Trainers can start sessions
- [ ] All 3 sign-off modes work perfectly
- [ ] Timer counts down from 30:00
- [ ] Timer auto-completes session at 0:00
- [ ] RPE picker works on all screens
- [ ] Sessions save with all data
- [ ] Session history shows correctly
- [ ] Client view shows all past sessions

### Mobile
- [ ] Responsive on all sizes (320px to 1920px)
- [ ] Touch targets are 44x44px minimum
- [ ] Swipe gestures work in per-exercise mode
- [ ] Mobile navigation works
- [ ] Forms are usable on mobile
- [ ] No horizontal scroll
- [ ] Tested on actual mobile device

### Technical
- [ ] TypeScript strict mode with no errors
- [ ] All components properly typed
- [ ] No console errors
- [ ] LocalStorage persistence works
- [ ] Data survives page refresh
- [ ] Proper loading states
- [ ] Proper empty states
- [ ] Good error handling

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels on interactive elements
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Works with screen readers

### Performance
- [ ] Fast load times (< 2 seconds)
- [ ] Smooth animations (60fps)
- [ ] No layout shift
- [ ] Images optimized
- [ ] Bundle size reasonable

---

## 🚨 Common Pitfalls to Avoid

1. **DON'T copy the old Wondrous design** - it has gradients everywhere, that's what we're replacing!

2. **DON'T skip the requirements doc** - it has everything you need, including exact mock data

3. **DON'T make up your own colors** - use the exact Wondrous brand colors specified

4. **DON'T forget mobile** - trainers use this in the gym on phones, mobile is CRITICAL

5. **DON'T overcomplicate the session runner** - it should be clean and simple, not cluttered

6. **DON'T forget the three sign-off modes** - this is a key differentiator

7. **DON'T skip the timer** - 30-minute countdown with auto-complete is required

8. **DON'T forget LocalStorage** - data should persist across refreshes

9. **DON'T use heavy animations** - keep it subtle and professional

10. **DON'T forget validation** - forms should validate before saving

---

## 📁 Reference Material Locations

### Current Wondrous Implementation (Study but DON'T Copy):
- Types: `/Users/mukelakatungu/wondrous-store-platform/src/types/trainer-aide.ts`
- Components: `/Users/mukelakatungu/wondrous-store-platform/src/components/trainer-aide/`
- Pages: `/Users/mukelakatungu/wondrous-store-platform/src/app/trainer-aide/`
- Mock data: `/Users/mukelakatungu/wondrous-store-platform/src/modules/trainer-aide/data/`

### Good Reference Projects (Learn From):
- **wellness-frontend**: `/Users/mukelakatungu/wellness-frontend/src`
  - Study: Component organization, layout structure, spacing
- **class-dash-demo**: `/Users/mukelakatungu/class-dash-demo/src/app/demo`
  - Study: Clean design, card layouts, mobile UX

### Your Project:
- Location: `/Users/mukelakatungu/trainer-aide-demo/`
- Requirements: `./TRAINER_AIDE_DEMO_REQUIREMENTS.md`
- This file: `./AGENT_INSTRUCTIONS.md`

---

## 🎬 Demo Flow (Test This at the End)

1. **Open the app** → See role selector
2. **Select "Studio Owner"** → See dashboard
3. **Click "Create Template"** → Build a new template
   - Enter name: "Test Workout"
   - Select type: Standard 3-Block
   - Add exercises to each block
   - Save template
4. **Switch to "Trainer"** → See dashboard
5. **Go to Templates** → See the template you just created (read-only)
6. **Click "Start Session"**:
   - Select template
   - Select client: "Tom Phillips"
   - Choose sign-off mode: "Per Block"
   - Start session
7. **Run through the session**:
   - See timer counting down
   - Complete Block 1
   - Enter Block 1 RPE: 7
   - Complete Block 2
   - Enter Block 2 RPE: 8
   - Complete Block 3
   - Enter Block 3 RPE: 6
   - Enter overall RPE: 7
   - Add notes: "Great session!"
   - Check declaration
   - Complete session
8. **Go to "My Sessions"** → See completed session
9. **Switch to "Client"** → See dashboard
10. **Go to History** → See the session you just completed
11. **Click session** → See full details with all exercises, weights, RPEs

**If all of this works perfectly, you're done!** 🎉

---

## 💬 Communication Style

As you work:
- **Ask questions** if the requirements are unclear
- **Show progress** at the end of each phase
- **Report issues** if you encounter blockers
- **Suggest improvements** if you see opportunities
- **Test thoroughly** before saying you're done

---

## 🎯 Success Definition

This project is successful when:

1. ✅ All features work without bugs
2. ✅ Design is clean, modern, and gradient-free
3. ✅ Mobile experience is excellent
4. ✅ All three sign-off modes work perfectly
5. ✅ Timer works correctly
6. ✅ Data persists in LocalStorage
7. ✅ Client is impressed and says "This is exactly what I wanted!"

---

## 🚀 Ready to Start?

### Your First Steps:

1. **Read the requirements doc** (`TRAINER_AIDE_DEMO_REQUIREMENTS.md`)
2. **Navigate to the project**: `cd /Users/mukelakatungu/trainer-aide-demo`
3. **Initialize Next.js**: `npx create-next-app@latest . --typescript --tailwind --app`
4. **Install dependencies** (see Phase 1 above)
5. **Create the type definitions** (copy from requirements doc)
6. **Create the mock data** (copy from requirements doc)
7. **Build the layout and navigation**
8. **Start with Studio Owner features**
9. **Build Trainer features** (especially Session Runner)
10. **Add Client features**
11. **Optimize for mobile**
12. **Polish and test**

### Expected Timeline:

- **Day 1-2**: Setup, layout, navigation, mock data
- **Day 3**: Studio Owner features
- **Day 4-5**: Trainer features (Session Runner is complex!)
- **Day 6**: Client features
- **Day 7**: Mobile optimization, polish, testing

---

**Let's build something amazing!** 💪

Remember: **Clean design, solid colors, mobile-first, better than the references.**

If you have questions, ask. If you're stuck, explain where. If you need clarification on requirements, reference the specific section in `TRAINER_AIDE_DEMO_REQUIREMENTS.md`.

**Good luck, and ship something great!** 🚀
