# Trainer Aide Demo - Validation Checklist

Use this checklist to verify the agent built everything correctly.

---

## 📁 Project Structure

### Core Files & Folders
- [ ] `app/` directory exists (Next.js App Router)
- [ ] `components/` directory with subdirectories (layout, studio-owner, trainer, client, shared, ui)
- [ ] `lib/` directory with subdirectories (mock-data, stores, types, utils)
- [ ] `styles/globals.css` exists
- [ ] `tailwind.config.ts` configured with Wondrous colors
- [ ] `package.json` with all required dependencies
- [ ] TypeScript configured (`tsconfig.json`)

### Mock Data Files
- [ ] `lib/mock-data/exercises.ts` - At least 20 exercises
- [ ] `lib/mock-data/templates.ts` - At least 3 templates
- [ ] `lib/mock-data/clients.ts` - At least 5 clients
- [ ] `lib/mock-data/sessions.ts` - Mock sessions
- [ ] `lib/mock-data/users.ts` - Mock users
- [ ] `lib/mock-data/index.ts` - Barrel export

### Type Definitions
- [ ] `lib/types/index.ts` - All TypeScript interfaces
- [ ] `Exercise` type defined
- [ ] `WorkoutTemplate` type defined
- [ ] `Session` type defined
- [ ] `Client` type defined
- [ ] `User` type defined
- [ ] `MuscleGroup` type defined
- [ ] `SignOffMode` type defined

### Zustand Stores
- [ ] `lib/stores/user-store.ts` - User/role management
- [ ] `lib/stores/session-store.ts` - Session state
- [ ] `lib/stores/template-store.ts` - Template state

---

## 🎨 Design System

### Colors
- [ ] Wondrous Primary (#a71075) configured in Tailwind
- [ ] Wondrous Cyan (#45f2ff) configured
- [ ] Wondrous Blue (#00bafc) configured
- [ ] Wondrous Dark Blue (#0085c4) configured
- [ ] **ZERO gradients** anywhere in the code
- [ ] Gray scale colors (50-900) configured

### Typography
- [ ] Inter font loaded (body text)
- [ ] Montserrat font loaded (headings)
- [ ] `.text-heading-1` utility exists
- [ ] `.text-heading-2` utility exists
- [ ] `.text-heading-3` utility exists
- [ ] `.text-body` utility exists
- [ ] `.text-caption` utility exists

### Buttons
- [ ] `.btn-primary` class exists (solid magenta, no gradient)
- [ ] `.btn-secondary` class exists (solid blue, no gradient)
- [ ] `.btn-outline` class exists
- [ ] `.btn-ghost` class exists
- [ ] Button sizes (sm, md, lg) exist
- [ ] All buttons have hover states
- [ ] All buttons have focus states

### Cards
- [ ] `.card` class exists (white background, border, shadow)
- [ ] `.card-interactive` class exists (hover effect)
- [ ] `.card-stat` class exists
- [ ] **NO gradient backgrounds** on cards

---

## 🏗️ Layout & Navigation

### Sidebar
- [ ] Sidebar component exists (`components/layout/Sidebar.tsx`)
- [ ] Logo displays at top
- [ ] Navigation links change based on user role
- [ ] Active link highlighting works
- [ ] User info displays at bottom
- [ ] Clean styling (no gradients)

### Mobile Navigation
- [ ] Mobile nav component exists (`components/layout/MobileNav.tsx`)
- [ ] Hamburger menu icon on mobile
- [ ] Slide-out drawer works
- [ ] Responsive breakpoint triggers correctly (< 768px)

### Root Layout
- [ ] Sidebar shows on desktop (> 768px)
- [ ] Mobile nav shows on mobile (< 768px)
- [ ] Fonts load correctly
- [ ] Metadata set properly

---

## 👔 Studio Owner Features

### Dashboard (`app/studio-owner/page.tsx`)
- [ ] Page exists and loads
- [ ] Welcome header with user name
- [ ] 4 stat cards display:
  - [ ] Total Templates
  - [ ] Active Templates
  - [ ] Total Sessions
  - [ ] Average RPE
- [ ] Recent templates list
- [ ] "Create New Template" button
- [ ] Clean layout (no gradients)

### Template Library (`app/studio-owner/templates/page.tsx`)
- [ ] Page exists and loads
- [ ] Lists all templates from mock data
- [ ] Search functionality works
- [ ] Filter functionality works
- [ ] Template cards show:
  - [ ] Name
  - [ ] Description
  - [ ] Type (Standard/Resistance Only)
  - [ ] Number of blocks
  - [ ] Last updated
- [ ] Actions available:
  - [ ] Edit (goes to builder)
  - [ ] Duplicate
  - [ ] Delete
  - [ ] View usage stats
- [ ] Empty state when no templates

### Template Builder (`app/studio-owner/templates/builder/page.tsx`)
- [ ] Page exists and loads
- [ ] Template details form:
  - [ ] Name input
  - [ ] Description textarea
  - [ ] Type selector (Standard vs Resistance Only)
- [ ] Block builder for each block:
  - [ ] Add block button
  - [ ] Remove block button
  - [ ] Exercise list per block
  - [ ] Add exercise button opens library
  - [ ] Remove exercise button
  - [ ] Reorder exercises (up/down or drag)
  - [ ] Configure resistance per exercise
  - [ ] Configure reps per exercise
  - [ ] Configure sets per exercise
  - [ ] Cardio duration/intensity for cardio exercises
- [ ] Exercise library modal opens:
  - [ ] Search exercises
  - [ ] Filter by muscle group
  - [ ] Display exercise cards
  - [ ] Click to select
- [ ] Validation before save:
  - [ ] Template name required
  - [ ] At least 1 block required
  - [ ] Cardio first for standard templates
- [ ] Save button works
- [ ] Cancel button works
- [ ] Data persists to LocalStorage

---

## 💪 Trainer Features

### Trainer Dashboard (`app/trainer/page.tsx`)
- [ ] Page exists and loads
- [ ] Welcome header with trainer name
- [ ] 4 stat cards display:
  - [ ] Templates Assigned
  - [ ] Sessions Today
  - [ ] Sessions This Week
  - [ ] Average RPE
- [ ] "Start New Session" button
- [ ] Today's scheduled sessions (mock)
- [ ] Recent completed sessions
- [ ] Clean layout (no gradients)

### Templates View (`app/trainer/templates/page.tsx`)
- [ ] Page exists and loads
- [ ] Lists assigned templates (read-only)
- [ ] Template cards show:
  - [ ] Name
  - [ ] Description
  - [ ] Number of blocks
  - [ ] Duration estimate
- [ ] Preview button works (expand details)
- [ ] Start Session button works
- [ ] **CANNOT edit templates**
- [ ] **CANNOT create templates**
- [ ] **CANNOT delete templates**

### Start New Session (`app/trainer/sessions/new/page.tsx`)
- [ ] Page exists and loads
- [ ] Template selector (dropdown or cards)
- [ ] Client selector (dropdown or search)
- [ ] Sign-off mode selector with 3 options:
  - [ ] Full Session option
  - [ ] Per Block option (marked as recommended)
  - [ ] Per Exercise option
- [ ] Clear descriptions for each mode
- [ ] Start button begins session
- [ ] Navigates to session runner

### Session Runner (`app/trainer/sessions/[id]/page.tsx`) ⭐ MOST CRITICAL
- [ ] Page exists and loads
- [ ] Session timer displays (30:00 countdown)
- [ ] Timer counts down correctly
- [ ] Timer shows warning at < 5 minutes
- [ ] Timer auto-completes session at 0:00
- [ ] Client name displays
- [ ] Template name displays
- [ ] Progress indicator shows (Block X of Y)

#### Full Session Mode
- [ ] All blocks expanded
- [ ] All exercises visible
- [ ] Can view all blocks at once
- [ ] Complete button at bottom
- [ ] Completion modal shows:
  - [ ] Overall RPE picker
  - [ ] Notes textarea
  - [ ] Declaration checkbox
  - [ ] Save button

#### Per Block Mode
- [ ] Current block expanded
- [ ] Other blocks collapsed (can expand)
- [ ] Exercises listed for current block
- [ ] "Complete Block" button
- [ ] Block completion modal shows:
  - [ ] Block RPE picker
  - [ ] Continue to next block button
- [ ] After all blocks, session completion modal shows:
  - [ ] Overall RPE picker
  - [ ] Notes textarea
  - [ ] Declaration checkbox
  - [ ] Save button

#### Per Exercise Mode (Mobile-Optimized)
- [ ] ONE exercise displayed at a time
- [ ] Large exercise image(s) shown
- [ ] Exercise name displayed
- [ ] Exercise instructions visible
- [ ] Target weight/reps shown
- [ ] Inputs for:
  - [ ] Actual weight used
  - [ ] Actual reps completed
- [ ] Checkbox to mark exercise complete
- [ ] Navigation buttons (Previous/Next)
- [ ] Swipe gestures work (if implemented)
- [ ] Progress bar shows completion
- [ ] After block complete, RPE modal
- [ ] After all blocks, session completion modal

### Session Components
- [ ] `SessionTimer.tsx` - Timer component works
- [ ] `RPEPicker.tsx` - RPE selection works (1-10 scale)
- [ ] `ExerciseView.tsx` - Exercise display works
- [ ] `SessionCompleteModal.tsx` - Completion modal works
- [ ] `ClientSelector.tsx` - Client selection works

### My Sessions (`app/trainer/sessions/page.tsx`)
- [ ] Page exists and loads
- [ ] Tabs: "In Progress" | "Completed"
- [ ] In Progress tab shows active sessions
- [ ] Completed tab shows finished sessions
- [ ] Session cards display:
  - [ ] Client name
  - [ ] Template name
  - [ ] Date/time
  - [ ] Duration
  - [ ] Overall RPE
  - [ ] Notes preview
- [ ] Click to view full details
- [ ] Resume button for in-progress sessions
- [ ] Detail view shows all exercises, weights, reps

---

## 👥 Client Features

### Client Dashboard (`app/client/page.tsx`)
- [ ] Page exists and loads
- [ ] Welcome message
- [ ] Next session card (mock):
  - [ ] Trainer name
  - [ ] Date/time
  - [ ] Location
- [ ] Stats cards:
  - [ ] Sessions this month
  - [ ] Average RPE
  - [ ] Consistency streak
- [ ] Recent sessions (last 3-5)
- [ ] Clean layout (no gradients)

### Session History (`app/client/history/page.tsx`)
- [ ] Page exists and loads
- [ ] Chronological list of sessions
- [ ] Session cards display:
  - [ ] Date
  - [ ] Trainer name
  - [ ] Template name
  - [ ] Duration
  - [ ] Overall RPE
- [ ] Click to expand/view details
- [ ] Detail view shows:
  - [ ] All blocks
  - [ ] All exercises completed
  - [ ] Weights used
  - [ ] Reps completed
  - [ ] Block RPEs
  - [ ] Overall RPE
  - [ ] Trainer notes
  - [ ] Recommendations

---

## 📱 Mobile Responsiveness

### Breakpoints
- [ ] Works at 320px (small mobile)
- [ ] Works at 375px (iPhone SE)
- [ ] Works at 414px (iPhone Pro Max)
- [ ] Works at 768px (tablet)
- [ ] Works at 1024px (desktop)
- [ ] Works at 1920px (large desktop)

### Touch Targets
- [ ] All buttons are at least 44x44px on mobile
- [ ] Form inputs are at least 44px height
- [ ] Checkbox/radio buttons are 44x44px touch area
- [ ] Navigation links are 44x44px touch area

### Mobile-Specific
- [ ] Sidebar hidden on mobile (< 768px)
- [ ] Mobile nav shows on mobile
- [ ] Forms are usable on mobile
- [ ] No horizontal scrolling
- [ ] Text is readable (min 16px body)
- [ ] Spacing is appropriate for touch
- [ ] Swipe gestures work (if implemented)

---

## 💾 Data Persistence

### LocalStorage
- [ ] Sessions persist across page refresh
- [ ] Templates persist across page refresh
- [ ] User role selection persists
- [ ] Active session recovers after refresh
- [ ] Completed sessions saved
- [ ] Created templates saved
- [ ] Edited templates saved
- [ ] Deleted templates removed

### Data Integrity
- [ ] No data loss on refresh
- [ ] Sessions maintain correct structure
- [ ] RPE values save correctly
- [ ] Notes save correctly
- [ ] Exercise data saves correctly

---

## ♿ Accessibility

### Keyboard Navigation
- [ ] Tab key navigates through interactive elements
- [ ] Enter key activates buttons/links
- [ ] Escape key closes modals
- [ ] Arrow keys work where appropriate
- [ ] Focus visible on all elements

### ARIA Labels
- [ ] Buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Navigation has aria-label
- [ ] Modals have aria-labelledby
- [ ] Interactive elements have roles

### Screen Readers
- [ ] All images have alt text
- [ ] Form labels associated correctly
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Page titles set correctly

### Color Contrast
- [ ] Text on white background passes WCAG AA
- [ ] Text on colored backgrounds passes WCAG AA
- [ ] Button text readable
- [ ] Links distinguishable

---

## ⚡ Performance

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] Navigation between pages < 500ms
- [ ] Modals open instantly
- [ ] Forms submit instantly (LocalStorage)

### Optimization
- [ ] Images optimized (Next.js Image component)
- [ ] Heavy components lazy loaded
- [ ] Expensive computations memoized
- [ ] Re-renders minimized

### Bundle Size
- [ ] No console errors
- [ ] No console warnings (besides expected)
- [ ] JavaScript bundle reasonable size
- [ ] CSS bundle reasonable size

---

## 🐛 Error Handling

### Form Validation
- [ ] Template name required
- [ ] Client selection required
- [ ] Sign-off mode selection required
- [ ] RPE selection required before completion
- [ ] Declaration checkbox required
- [ ] Error messages clear and helpful

### Graceful Failures
- [ ] Missing data shows empty state
- [ ] LocalStorage errors handled
- [ ] Missing images show fallback
- [ ] Network errors (if any) handled

---

## 🎯 Critical Features Validation

### Template Builder
- [x] Can create Standard 3-Block template
- [x] Can create Resistance-Only template
- [x] Can add exercises from library
- [x] Can remove exercises
- [x] Can reorder exercises
- [x] Cardio locked first for Standard templates
- [x] Can configure resistance/reps/sets
- [x] Can save template
- [x] Can edit existing template
- [x] Can delete template

### Session Runner - Full Session Mode
- [x] All exercises visible
- [x] Timer works
- [x] Can complete session
- [x] RPE picker works
- [x] Notes save
- [x] Declaration required

### Session Runner - Per Block Mode
- [x] Current block visible
- [x] Can complete each block
- [x] Block RPE required
- [x] Moves to next block
- [x] Overall RPE after all blocks
- [x] Notes save
- [x] Declaration required

### Session Runner - Per Exercise Mode
- [x] One exercise at a time
- [x] Exercise images display
- [x] Can input actual weight/reps
- [x] Can mark exercise complete
- [x] Navigation works (Next/Previous)
- [x] Block RPE after block complete
- [x] Overall RPE after all blocks
- [x] Notes save
- [x] Declaration required

### Timer
- [x] Counts down from 30:00
- [x] Updates every second
- [x] Shows warning at < 5 minutes
- [x] Auto-completes at 0:00
- [x] Can manually complete before timer ends

---

## ✅ Final Quality Check

### Visual Quality
- [ ] Looks professional and modern
- [ ] Better than wellness-frontend
- [ ] Better than class-dash-demo
- [ ] Consistent spacing throughout
- [ ] Clean typography hierarchy
- [ ] **ZERO gradients anywhere**
- [ ] Color palette used correctly

### User Experience
- [ ] Intuitive navigation
- [ ] Clear call-to-actions
- [ ] Helpful empty states
- [ ] Clear loading states
- [ ] Helpful error messages
- [ ] Smooth transitions
- [ ] Fast and responsive

### Functionality
- [ ] All features work without bugs
- [ ] No console errors
- [ ] Data persists correctly
- [ ] Forms validate properly
- [ ] All three sign-off modes work
- [ ] Timer works correctly
- [ ] RPE picker works
- [ ] Session completion works

### Mobile Experience
- [ ] Perfect on iPhone
- [ ] Perfect on Android
- [ ] Touch targets sized correctly
- [ ] Forms easy to use
- [ ] No horizontal scroll
- [ ] Gestures work (if implemented)

---

## 🎬 End-to-End Test

Run through this complete flow:

1. [ ] Open app → See role selector
2. [ ] Select "Studio Owner"
3. [ ] Create new template:
   - [ ] Enter name: "Test Workout"
   - [ ] Select Standard 3-Block
   - [ ] Add cardio to Block 1
   - [ ] Add 4 resistance exercises to Block 1
   - [ ] Add cardio to Block 2
   - [ ] Add 4 resistance exercises to Block 2
   - [ ] Add cardio to Block 3
   - [ ] Add 4 resistance exercises to Block 3
   - [ ] Save template
4. [ ] Switch to "Trainer"
5. [ ] View templates → See "Test Workout"
6. [ ] Start new session:
   - [ ] Select "Test Workout"
   - [ ] Select client "Tom Phillips"
   - [ ] Choose "Per Block" mode
   - [ ] Start session
7. [ ] Run session:
   - [ ] See timer counting down
   - [ ] See Block 1 exercises
   - [ ] Complete Block 1
   - [ ] Enter Block 1 RPE: 7
   - [ ] See Block 2 exercises
   - [ ] Complete Block 2
   - [ ] Enter Block 2 RPE: 8
   - [ ] See Block 3 exercises
   - [ ] Complete Block 3
   - [ ] Enter Block 3 RPE: 6
   - [ ] Enter overall RPE: 7
   - [ ] Add notes: "Great session!"
   - [ ] Check declaration
   - [ ] Complete session
8. [ ] Go to My Sessions → See completed session
9. [ ] Switch to "Client"
10. [ ] Go to History → See the session
11. [ ] Click session → See full details
12. [ ] Verify all data is correct

**If all steps work perfectly → PROJECT COMPLETE! 🎉**

---

## 📝 Notes

- Check off each item as you verify it
- If something is missing, note it and request fixes
- If something doesn't work, note the specific issue
- Use this checklist before accepting the project as complete

---

**Project is only complete when ALL items are checked!** ✅
