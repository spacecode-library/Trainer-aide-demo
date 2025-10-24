# Trainer Aide Demo - Complete Development Guide

**Project:** Standalone Trainer Aide Demo
**Client:** Wondrous Fitness Platform
**Purpose:** High-quality demo showcasing redesigned Trainer Aide features
**Timeline:** Immediate development
**Quality Bar:** Better than wellness-frontend and class-dash-demo

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Setup](#project-setup)
3. [Design System](#design-system)
4. [Data Models & Mock Data](#data-models--mock-data)
5. [Feature Specifications](#feature-specifications)
6. [Component Architecture](#component-architecture)
7. [Mobile Design Patterns](#mobile-design-patterns)
8. [Implementation Workflow](#implementation-workflow)
9. [Best Practices](#best-practices)

---

## Executive Summary

### Project Goals

Build a standalone, frontend-only demo of the Trainer Aide system that:

✅ **Showcases** a complete redesign with modern, clean UI
✅ **Demonstrates** all three user roles (Studio Owner, Trainer, Client)
✅ **Operates** entirely on mock data (no backend required)
✅ **Supports** flexible workout creation and three sign-off modes
✅ **Works** flawlessly on mobile with dedicated mobile UX
✅ **Exceeds** quality standards of reference projects

### Key Differentiators

1. **No Gradients**: Solid colors, clean design inspired by Apple/Airbnb
2. **Three Sign-Off Modes**: Full session, per block, per exercise tracking
3. **Flexible Workouts**: Both 3-block standard AND resistance-only templates
4. **Mobile-First**: Separate mobile interface optimized for on-the-go trainers
5. **Mock Data Driven**: Realistic data that demonstrates full functionality

---

## Project Setup

### Tech Stack

```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui_components": "shadcn/ui (Radix UI primitives)",
  "state_management": "React Context + Zustand",
  "forms": "React Hook Form + Zod validation",
  "icons": "Lucide React",
  "animations": "Framer Motion (minimal, subtle)",
  "data_storage": "LocalStorage (for demo state persistence)"
}
```

### Initialize Project

```bash
# Create project in parent directory
cd /Users/mukelakatungu
npx create-next-app@latest trainer-aide-demo --typescript --tailwind --app --no-src

cd trainer-aide-demo

# Install dependencies
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install @radix-ui/react-tabs @radix-ui/react-checkbox @radix-ui/react-slider
npm install lucide-react
npm install framer-motion
npm install react-hook-form zod @hookform/resolvers
npm install zustand
npm install clsx tailwind-merge
npm install class-variance-authority

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input select textarea tabs badge
npx shadcn-ui@latest add dialog dropdown-menu checkbox slider
```

### Project Structure

```
trainer-aide-demo/
├── app/
│   ├── layout.tsx                    # Root layout with sidebar
│   ├── page.tsx                      # Landing/dashboard
│   ├── studio-owner/
│   │   ├── page.tsx                  # Studio owner dashboard
│   │   ├── templates/
│   │   │   ├── page.tsx              # Template library
│   │   │   └── builder/page.tsx      # Template builder
│   │   └── sessions/page.tsx         # Session history (as owner)
│   ├── trainer/
│   │   ├── page.tsx                  # Trainer dashboard
│   │   ├── templates/page.tsx        # View assigned templates
│   │   ├── sessions/
│   │   │   ├── page.tsx              # Session list
│   │   │   ├── [id]/page.tsx         # Session runner
│   │   │   └── new/page.tsx          # Start new session
│   │   └── calendar/page.tsx         # Calendar view (mock)
│   └── client/
│       ├── page.tsx                  # Client dashboard
│       └── history/page.tsx          # Session history
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Main navigation sidebar
│   │   ├── MobileNav.tsx             # Mobile navigation
│   │   └── Header.tsx                # Page headers
│   ├── studio-owner/
│   │   ├── TemplateBuilder.tsx       # Workout template builder
│   │   ├── BlockBuilder.tsx          # Build individual blocks
│   │   ├── ExerciseLibrary.tsx       # Exercise selection
│   │   └── ExerciseCard.tsx          # Exercise display
│   ├── trainer/
│   │   ├── SessionRunner.tsx         # Main session interface
│   │   ├── SessionTimer.tsx          # 30-minute countdown
│   │   ├── ExerciseView.tsx          # Exercise display during session
│   │   ├── RPEPicker.tsx             # Rate of perceived exertion
│   │   └── ClientSelector.tsx        # Select client for session
│   ├── shared/
│   │   ├── SessionCard.tsx           # Reusable session card
│   │   ├── StatCard.tsx              # Dashboard stat cards
│   │   └── EmptyState.tsx            # Empty states
│   └── ui/
│       └── [shadcn components]       # Button, Card, Input, etc.
├── lib/
│   ├── mock-data/
│   │   ├── exercises.ts              # Exercise library
│   │   ├── templates.ts              # Workout templates
│   │   ├── sessions.ts               # Mock sessions
│   │   ├── clients.ts                # Mock clients
│   │   └── users.ts                  # Mock users (owner, trainers)
│   ├── stores/
│   │   ├── session-store.ts          # Session state (Zustand)
│   │   └── user-store.ts             # Current user context
│   ├── types/
│   │   └── index.ts                  # TypeScript types
│   └── utils/
│       ├── cn.ts                     # Class name utility
│       └── storage.ts                # LocalStorage helpers
├── public/
│   └── exercises/                    # Exercise images (if needed)
└── styles/
    └── globals.css                   # Global styles
```

---

## Design System

### Brand Colors

```css
/* Brand Colors - Wondrous Theme */
:root {
  --wondrous-primary: #a71075;      /* Magenta - Primary brand */
  --wondrous-cyan: #45f2ff;         /* Bright cyan - Accents */
  --wondrous-blue: #00bafc;         /* Sky blue - Interactive */
  --wondrous-dark-blue: #0085c4;    /* Dark blue - Headings */

  /* Adjusted for better UI */
  --wondrous-primary-hover: #8b0d5f;
  --wondrous-cyan-light: #e0fbff;
  --wondrous-blue-light: #e5f7ff;

  /* Neutral Grays */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        wondrous: {
          primary: '#a71075',
          'primary-hover': '#8b0d5f',
          cyan: '#45f2ff',
          'cyan-light': '#e0fbff',
          blue: '#00bafc',
          'blue-light': '#e5f7ff',
          'dark-blue': '#0085c4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### Typography Scale

```css
/* Typography System */
.text-heading-1 {
  @apply text-3xl font-bold text-wondrous-dark-blue font-heading;
}

.text-heading-2 {
  @apply text-2xl font-bold text-wondrous-dark-blue font-heading;
}

.text-heading-3 {
  @apply text-xl font-semibold text-gray-900;
}

.text-body {
  @apply text-base text-gray-700;
}

.text-body-sm {
  @apply text-sm text-gray-600;
}

.text-caption {
  @apply text-xs text-gray-500;
}
```

### Button System (NO GRADIENTS)

```css
/* Primary Button - Magenta */
.btn-primary {
  @apply px-4 py-2 bg-wondrous-primary text-white font-medium rounded-lg;
  @apply hover:bg-wondrous-primary-hover active:scale-[0.98];
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-wondrous-primary focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Secondary Button - Blue */
.btn-secondary {
  @apply px-4 py-2 bg-wondrous-blue text-white font-medium rounded-lg;
  @apply hover:bg-wondrous-dark-blue active:scale-[0.98];
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-wondrous-blue focus:ring-offset-2;
}

/* Outline Button */
.btn-outline {
  @apply px-4 py-2 bg-white text-wondrous-dark-blue font-medium rounded-lg;
  @apply border-2 border-wondrous-dark-blue;
  @apply hover:bg-wondrous-dark-blue hover:text-white;
  @apply transition-all duration-200;
}

/* Ghost Button */
.btn-ghost {
  @apply px-4 py-2 bg-transparent text-gray-700 font-medium rounded-lg;
  @apply hover:bg-gray-100;
  @apply transition-all duration-200;
}

/* Button Sizes */
.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.btn-lg {
  @apply px-6 py-3 text-lg;
}
```

### Card System (NO GRADIENTS)

```css
/* Base Card */
.card {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm;
  @apply transition-shadow duration-200;
}

.card:hover {
  @apply shadow-md;
}

/* Interactive Card */
.card-interactive {
  @apply card cursor-pointer;
  @apply hover:shadow-lg hover:-translate-y-1;
  @apply active:scale-[0.99];
}

/* Stat Card */
.card-stat {
  @apply card p-6;
}

/* Card with accent border */
.card-accent {
  @apply card border-l-4 border-l-wondrous-primary;
}
```

### Spacing System

```css
/* Consistent spacing tokens */
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 1.5rem;    /* 24px */
--spacing-lg: 2rem;      /* 32px */
--spacing-xl: 3rem;      /* 48px */
--spacing-2xl: 4rem;     /* 64px */
```

---

## Data Models & Mock Data

### TypeScript Types

```typescript
// lib/types/index.ts

export type MuscleGroup =
  | 'cardio'
  | 'chest'
  | 'back'
  | 'legs'
  | 'core'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'stretch';

export type ResistanceType = 'bodyweight' | 'weight';

export type SignOffMode = 'full_session' | 'per_block' | 'per_exercise';

// Exercise Library
export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  equipment?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  imageUrl?: string;
  startImageUrl?: string;
  endImageUrl?: string;
}

// Workout Template Exercise
export interface TemplateExercise {
  id: string;
  exerciseId: string;
  position: number;
  muscleGroup: MuscleGroup;
  resistanceType: ResistanceType;
  resistanceValue: number;
  repsMin: number;
  repsMax: number;
  sets: number;
  // For cardio
  cardioDuration?: number;  // seconds
  cardioIntensity?: number; // 1-10
}

// Workout Block (in template)
export interface WorkoutBlock {
  id: string;
  blockNumber: number;
  name: string;
  exercises: TemplateExercise[];
}

// Workout Template
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'resistance_only';  // standard = 3-block, resistance_only = no cardio
  createdBy: string;
  assignedStudios: string[];
  blocks: WorkoutBlock[];
  createdAt: string;
  updatedAt: string;
}

// Client
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string;
}

// Session Exercise (during session)
export interface SessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  resistanceType: ResistanceType;
  resistanceValue: number;
  repsMin: number;
  repsMax: number;
  sets: number;
  // For cardio
  cardioDuration?: number;
  cardioIntensity?: number;
  // Tracking
  completed: boolean;
  actualResistance?: number;
  actualReps?: number;
  actualDuration?: number;
}

// Session Block (during session)
export interface SessionBlock {
  id: string;
  blockNumber: number;
  name: string;
  exercises: SessionExercise[];
  rpe?: number;  // Rate of Perceived Exertion (1-10)
  completed: boolean;
}

// Session
export interface Session {
  id: string;
  trainerId: string;
  clientId?: string;
  client?: Client;
  templateId: string;
  template: WorkoutTemplate;
  sessionName: string;
  signOffMode: SignOffMode;
  blocks: SessionBlock[];
  startedAt: string;
  completedAt?: string;
  overallRpe?: number;
  notes?: string;
  trainerDeclaration: boolean;
  completed: boolean;
}

// User (for demo)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: 'studio_owner' | 'trainer' | 'client';
  email: string;
}
```

### Mock Data: Exercise Library

```typescript
// lib/mock-data/exercises.ts

export const MOCK_EXERCISES: Exercise[] = [
  // Cardio
  {
    id: 'ex_cardio_treadmill',
    name: 'Treadmill',
    category: 'cardio',
    equipment: 'Treadmill',
    level: 'beginner',
    instructions: [
      'Step onto the treadmill and hold the handrails if needed',
      'Start at a slow pace (3-4 mph)',
      'Gradually increase speed based on intensity level',
      'Maintain good posture with shoulders back'
    ],
  },
  {
    id: 'ex_cardio_bike',
    name: 'Stationary Bike',
    category: 'cardio',
    equipment: 'Bike',
    level: 'beginner',
    instructions: [
      'Adjust seat height so knees are slightly bent at full extension',
      'Start with moderate resistance',
      'Maintain a steady cadence (60-80 RPM)',
      'Keep core engaged throughout'
    ],
  },
  {
    id: 'ex_cardio_rower',
    name: 'Rowing Machine',
    category: 'cardio',
    equipment: 'Rowing Machine',
    level: 'intermediate',
    instructions: [
      'Secure feet in straps',
      'Start with arms extended, knees bent',
      'Drive with legs first, then lean back, then pull arms',
      'Return in reverse: arms, torso, legs'
    ],
  },
  {
    id: 'ex_cardio_burpees',
    name: 'Burpees',
    category: 'cardio',
    equipment: 'None',
    level: 'intermediate',
    instructions: [
      'Start standing',
      'Drop to plank position',
      'Perform a push-up',
      'Jump feet to hands',
      'Explosive jump up with arms overhead'
    ],
  },

  // Chest
  {
    id: 'ex_chest_db_press',
    name: 'Dumbbell Chest Press',
    category: 'chest',
    equipment: 'Dumbbells, Bench',
    level: 'beginner',
    instructions: [
      'Lie flat on bench with dumbbells at chest level',
      'Press dumbbells up until arms are extended',
      'Lower with control back to start position',
      'Keep core engaged and feet flat on floor'
    ],
  },
  {
    id: 'ex_chest_pushup',
    name: 'Push-Up',
    category: 'chest',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Start in high plank position',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep body in straight line throughout'
    ],
  },

  // Back
  {
    id: 'ex_back_bent_row',
    name: 'Bent Over Row',
    category: 'back',
    equipment: 'Dumbbells or Barbell',
    level: 'intermediate',
    instructions: [
      'Hinge at hips with slight knee bend',
      'Pull weight towards torso',
      'Squeeze shoulder blades together at top',
      'Lower with control'
    ],
  },
  {
    id: 'ex_back_lat_pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    equipment: 'Cable Machine',
    level: 'beginner',
    instructions: [
      'Sit at machine with thighs secured',
      'Grip bar slightly wider than shoulder width',
      'Pull bar down to upper chest',
      'Return with control'
    ],
  },

  // Legs
  {
    id: 'ex_legs_goblet_squat',
    name: 'Goblet Squat',
    category: 'legs',
    equipment: 'Dumbbell or Kettlebell',
    level: 'beginner',
    instructions: [
      'Hold weight at chest level',
      'Feet shoulder-width apart',
      'Lower into squat position',
      'Drive through heels to stand'
    ],
  },
  {
    id: 'ex_legs_lunges',
    name: 'Walking Lunges',
    category: 'legs',
    equipment: 'Dumbbells (optional)',
    level: 'beginner',
    instructions: [
      'Step forward with one leg',
      'Lower hips until both knees at 90 degrees',
      'Push through front heel to stand',
      'Alternate legs'
    ],
  },

  // Core
  {
    id: 'ex_core_plank',
    name: 'Plank',
    category: 'core',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Start in forearm plank position',
      'Keep body in straight line from head to heels',
      'Engage core and glutes',
      'Hold for specified duration'
    ],
  },
  {
    id: 'ex_core_russian_twist',
    name: 'Russian Twists',
    category: 'core',
    equipment: 'Medicine Ball (optional)',
    level: 'intermediate',
    instructions: [
      'Sit with knees bent, feet off floor',
      'Lean back slightly',
      'Rotate torso side to side',
      'Touch weight to floor on each side'
    ],
  },

  // Shoulders
  {
    id: 'ex_shoulders_db_press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand or sit with dumbbells at shoulder height',
      'Press weights overhead until arms extended',
      'Lower with control back to start',
      'Keep core engaged'
    ],
  },
  {
    id: 'ex_shoulders_lateral_raise',
    name: 'Lateral Raises',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides until parallel to floor',
      'Lower with control',
      'Keep slight bend in elbows'
    ],
  },

  // Biceps
  {
    id: 'ex_biceps_curl',
    name: 'Bicep Curl',
    category: 'biceps',
    equipment: 'Dumbbells or Barbell',
    level: 'beginner',
    instructions: [
      'Stand with weights at sides',
      'Curl weights towards shoulders',
      'Keep elbows close to body',
      'Lower with control'
    ],
  },

  // Triceps
  {
    id: 'ex_triceps_extension',
    name: 'Overhead Tricep Extension',
    category: 'triceps',
    equipment: 'Dumbbell',
    level: 'beginner',
    instructions: [
      'Hold weight overhead with both hands',
      'Lower weight behind head by bending elbows',
      'Extend arms back to start position',
      'Keep elbows pointed forward'
    ],
  },

  // Stretch
  {
    id: 'ex_stretch_hamstring',
    name: 'Seated Hamstring Stretch',
    category: 'stretch',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Sit with one leg extended, one bent',
      'Reach towards toes of extended leg',
      'Hold stretch for 20-30 seconds',
      'Switch legs and repeat'
    ],
  },
  {
    id: 'ex_stretch_quad',
    name: 'Standing Quad Stretch',
    category: 'stretch',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Stand on one leg',
      'Pull opposite foot towards glutes',
      'Hold for 20-30 seconds',
      'Switch legs'
    ],
  },
];
```

### Mock Data: Workout Templates

```typescript
// lib/mock-data/templates.ts

export const MOCK_TEMPLATES: WorkoutTemplate[] = [
  // Standard 3-Block Template
  {
    id: 'template_results_first',
    name: '=Results First Session',
    description: 'Go-to workout for new clients. Balanced full-body routine.',
    type: 'standard',
    createdBy: 'studio_owner_1',
    assignedStudios: ['studio_1', 'studio_2', 'studio_3'],
    blocks: [
      {
        id: 'block_1',
        blockNumber: 1,
        name: 'Block 1',
        exercises: [
          {
            id: 'te_1_1',
            exerciseId: 'ex_cardio_treadmill',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 180, // 3 minutes
            cardioIntensity: 7,
          },
          {
            id: 'te_1_2',
            exerciseId: 'ex_chest_db_press',
            position: 2,
            muscleGroup: 'chest',
            resistanceType: 'weight',
            resistanceValue: 25,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_1_3',
            exerciseId: 'ex_back_bent_row',
            position: 3,
            muscleGroup: 'back',
            resistanceType: 'weight',
            resistanceValue: 20,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_1_4',
            exerciseId: 'ex_legs_goblet_squat',
            position: 4,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 20,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_1_5',
            exerciseId: 'ex_core_plank',
            position: 5,
            muscleGroup: 'core',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 2,
            cardioDuration: 30,
            cardioIntensity: 5,
          },
        ],
      },
      {
        id: 'block_2',
        blockNumber: 2,
        name: 'Block 2',
        exercises: [
          {
            id: 'te_2_1',
            exerciseId: 'ex_cardio_bike',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 180,
            cardioIntensity: 6,
          },
          {
            id: 'te_2_2',
            exerciseId: 'ex_chest_pushup',
            position: 2,
            muscleGroup: 'chest',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_2_3',
            exerciseId: 'ex_back_lat_pulldown',
            position: 3,
            muscleGroup: 'back',
            resistanceType: 'weight',
            resistanceValue: 30,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_2_4',
            exerciseId: 'ex_legs_lunges',
            position: 4,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 15,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_2_5',
            exerciseId: 'ex_core_russian_twist',
            position: 5,
            muscleGroup: 'core',
            resistanceType: 'weight',
            resistanceValue: 10,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
        ],
      },
      {
        id: 'block_3',
        blockNumber: 3,
        name: 'Block 3',
        exercises: [
          {
            id: 'te_3_1',
            exerciseId: 'ex_cardio_rower',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 180,
            cardioIntensity: 8,
          },
          {
            id: 'te_3_2',
            exerciseId: 'ex_shoulders_db_press',
            position: 2,
            muscleGroup: 'shoulders',
            resistanceType: 'weight',
            resistanceValue: 15,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_3_3',
            exerciseId: 'ex_biceps_curl',
            position: 3,
            muscleGroup: 'biceps',
            resistanceType: 'weight',
            resistanceValue: 12,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_3_4',
            exerciseId: 'ex_triceps_extension',
            position: 4,
            muscleGroup: 'triceps',
            resistanceType: 'weight',
            resistanceValue: 10,
            repsMin: 10,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_3_5',
            exerciseId: 'ex_stretch_hamstring',
            position: 5,
            muscleGroup: 'stretch',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 30,
            cardioIntensity: 2,
          },
        ],
      },
    ],
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-15T14:30:00Z',
  },

  // Resistance-Only Template (NO CARDIO)
  {
    id: 'template_resistance_only',
    name: 'Resistance Only Power Hour',
    description: 'Pure strength training - no cardio, all resistance.',
    type: 'resistance_only',
    createdBy: 'studio_owner_1',
    assignedStudios: ['studio_1'],
    blocks: [
      {
        id: 'block_r1',
        blockNumber: 1,
        name: 'Upper Body Focus',
        exercises: [
          {
            id: 'te_r1_1',
            exerciseId: 'ex_chest_db_press',
            position: 1,
            muscleGroup: 'chest',
            resistanceType: 'weight',
            resistanceValue: 30,
            repsMin: 8,
            repsMax: 12,
            sets: 3,
          },
          {
            id: 'te_r1_2',
            exerciseId: 'ex_back_bent_row',
            position: 2,
            muscleGroup: 'back',
            resistanceType: 'weight',
            resistanceValue: 25,
            repsMin: 8,
            repsMax: 12,
            sets: 3,
          },
          {
            id: 'te_r1_3',
            exerciseId: 'ex_shoulders_db_press',
            position: 3,
            muscleGroup: 'shoulders',
            resistanceType: 'weight',
            resistanceValue: 20,
            repsMin: 8,
            repsMax: 12,
            sets: 3,
          },
        ],
      },
      {
        id: 'block_r2',
        blockNumber: 2,
        name: 'Lower Body Focus',
        exercises: [
          {
            id: 'te_r2_1',
            exerciseId: 'ex_legs_goblet_squat',
            position: 1,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 30,
            repsMin: 8,
            repsMax: 12,
            sets: 3,
          },
          {
            id: 'te_r2_2',
            exerciseId: 'ex_legs_lunges',
            position: 2,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 20,
            repsMin: 8,
            repsMax: 12,
            sets: 3,
          },
          {
            id: 'te_r2_3',
            exerciseId: 'ex_core_plank',
            position: 3,
            muscleGroup: 'core',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 3,
            cardioDuration: 45,
            cardioIntensity: 6,
          },
        ],
      },
    ],
    createdAt: '2025-10-10T09:00:00Z',
    updatedAt: '2025-10-18T16:00:00Z',
  },

  // Advanced HIIT Template
  {
    id: 'template_advanced_hiit',
    name: 'Advanced HIIT Blast',
    description: 'High-intensity interval training for experienced clients.',
    type: 'standard',
    createdBy: 'studio_owner_1',
    assignedStudios: ['studio_1', 'studio_2'],
    blocks: [
      {
        id: 'block_h1',
        blockNumber: 1,
        name: 'Block 1 - Explosive',
        exercises: [
          {
            id: 'te_h1_1',
            exerciseId: 'ex_cardio_burpees',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 120,
            cardioIntensity: 9,
          },
          {
            id: 'te_h1_2',
            exerciseId: 'ex_chest_pushup',
            position: 2,
            muscleGroup: 'chest',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 15,
            repsMax: 20,
            sets: 2,
          },
          {
            id: 'te_h1_3',
            exerciseId: 'ex_back_bent_row',
            position: 3,
            muscleGroup: 'back',
            resistanceType: 'weight',
            resistanceValue: 30,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h1_4',
            exerciseId: 'ex_legs_goblet_squat',
            position: 4,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 25,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h1_5',
            exerciseId: 'ex_core_russian_twist',
            position: 5,
            muscleGroup: 'core',
            resistanceType: 'weight',
            resistanceValue: 15,
            repsMin: 15,
            repsMax: 20,
            sets: 2,
          },
        ],
      },
      {
        id: 'block_h2',
        blockNumber: 2,
        name: 'Block 2 - Power',
        exercises: [
          {
            id: 'te_h2_1',
            exerciseId: 'ex_cardio_rower',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 120,
            cardioIntensity: 8,
          },
          {
            id: 'te_h2_2',
            exerciseId: 'ex_chest_db_press',
            position: 2,
            muscleGroup: 'chest',
            resistanceType: 'weight',
            resistanceValue: 30,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h2_3',
            exerciseId: 'ex_back_lat_pulldown',
            position: 3,
            muscleGroup: 'back',
            resistanceType: 'weight',
            resistanceValue: 35,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h2_4',
            exerciseId: 'ex_legs_lunges',
            position: 4,
            muscleGroup: 'legs',
            resistanceType: 'weight',
            resistanceValue: 20,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h2_5',
            exerciseId: 'ex_core_plank',
            position: 5,
            muscleGroup: 'core',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 2,
            cardioDuration: 45,
            cardioIntensity: 7,
          },
        ],
      },
      {
        id: 'block_h3',
        blockNumber: 3,
        name: 'Block 3 - Finisher',
        exercises: [
          {
            id: 'te_h3_1',
            exerciseId: 'ex_cardio_bike',
            position: 1,
            muscleGroup: 'cardio',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 120,
            cardioIntensity: 9,
          },
          {
            id: 'te_h3_2',
            exerciseId: 'ex_shoulders_lateral_raise',
            position: 2,
            muscleGroup: 'shoulders',
            resistanceType: 'weight',
            resistanceValue: 10,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h3_3',
            exerciseId: 'ex_biceps_curl',
            position: 3,
            muscleGroup: 'biceps',
            resistanceType: 'weight',
            resistanceValue: 15,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h3_4',
            exerciseId: 'ex_triceps_extension',
            position: 4,
            muscleGroup: 'triceps',
            resistanceType: 'weight',
            resistanceValue: 12,
            repsMin: 12,
            repsMax: 15,
            sets: 2,
          },
          {
            id: 'te_h3_5',
            exerciseId: 'ex_stretch_quad',
            position: 5,
            muscleGroup: 'stretch',
            resistanceType: 'bodyweight',
            resistanceValue: 0,
            repsMin: 0,
            repsMax: 0,
            sets: 1,
            cardioDuration: 30,
            cardioIntensity: 2,
          },
        ],
      },
    ],
    createdAt: '2025-10-12T11:00:00Z',
    updatedAt: '2025-10-20T09:15:00Z',
  },
];
```

### Mock Data: Clients

```typescript
// lib/mock-data/clients.ts

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client_1',
    firstName: 'Tom',
    lastName: 'Phillips',
    email: 'tom.phillips@example.com',
    joinedAt: '2025-08-15T10:00:00Z',
  },
  {
    id: 'client_2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    joinedAt: '2025-07-20T14:30:00Z',
  },
  {
    id: 'client_3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.j@example.com',
    joinedAt: '2025-09-01T09:00:00Z',
  },
  {
    id: 'client_4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    joinedAt: '2025-08-10T16:45:00Z',
  },
  {
    id: 'client_5',
    firstName: 'Alex',
    lastName: 'Brown',
    email: 'alex.brown@example.com',
    joinedAt: '2025-09-15T11:20:00Z',
  },
];
```

### Mock Data: Sessions

```typescript
// lib/mock-data/sessions.ts

export const MOCK_SESSIONS: Session[] = [
  {
    id: 'session_1',
    trainerId: 'trainer_1',
    clientId: 'client_1',
    templateId: 'template_results_first',
    sessionName: '=Results First Session with Tom',
    signOffMode: 'per_block',
    startedAt: '2025-10-20T10:00:00Z',
    completedAt: '2025-10-20T10:32:00Z',
    overallRpe: 7,
    notes: 'Great session! Tom showed improvement in form.',
    trainerDeclaration: true,
    completed: true,
    // ... blocks populated from template
  },
  {
    id: 'session_2',
    trainerId: 'trainer_1',
    clientId: 'client_2',
    templateId: 'template_advanced_hiit',
    sessionName: 'Advanced HIIT with Jane',
    signOffMode: 'per_exercise',
    startedAt: '2025-10-21T14:00:00Z',
    overallRpe: undefined,
    notes: '',
    trainerDeclaration: false,
    completed: false,
    // ... blocks in progress
  },
];
```

---

## Feature Specifications

### 1. Studio Owner Features

#### 1.1 Dashboard

**Purpose:** Overview of template library and usage statistics

**Components:**
- **Header**: "Studio Owner Dashboard"
- **Stats Cards**:
  - Total Templates Created
  - Active Templates
  - Total Sessions Completed (across all trainers)
  - Average Session RPE
- **Quick Actions**:
  - Create New Template
  - View All Sessions
- **Recent Activity**: List of recent sessions using templates

**UI Mockup:**
```
┌─────────────────────────────────────────────────────┐
│  Studio Owner Dashboard                    [+ New]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Templates│  │  Active  │  │ Sessions │         │
│  │    12    │  │    8     │  │   248    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  Recent Templates                                  │
│  ┌─────────────────────────────────────────────┐  │
│  │ =Results First Session          ✓ 3 studios │  │
│  │ Resistance Only Power Hour      ✓ 1 studio  │  │
│  │ Advanced HIIT Blast             ✓ 2 studios │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### 1.2 Template Builder

**Purpose:** Create standardized workout templates for trainers to use

**Key Features:**
- **Template Type Selection**:
  - Standard 3-Block (cardio first in each block)
  - Resistance Only (no cardio requirement)
- **Block Management**:
  - Add/Remove blocks
  - Reorder exercises within blocks
  - Cardio MUST be first in standard templates
- **Exercise Selection**:
  - Search/filter exercise library
  - Drag-and-drop or click to add
  - Configure parameters (resistance, reps, sets)
- **Studio Assignment**:
  - Select which studios can access this template
  - Multi-select checkboxes

**Workflow:**
1. Click "Create New Template"
2. Enter template name and description
3. Select template type (Standard vs Resistance Only)
4. Build Block 1:
   - Add cardio (required for standard, optional for resistance-only)
   - Add 4 resistance exercises
   - Set parameters for each
5. Repeat for Block 2 and Block 3
6. Assign to studios
7. Save template

**Validation Rules:**
- Standard templates: Cardio must be first in each block
- Minimum 1 exercise per block
- Maximum 5 exercises per block (recommended)
- All exercises must have valid resistance/rep ranges

**Mobile Considerations:**
- Collapsible exercise library sidebar
- Swipe to reorder exercises
- Bottom sheet for exercise selection

#### 1.3 Template Library

**Purpose:** View, edit, duplicate, and manage all templates

**Features:**
- **List View**: All templates with key info
- **Search/Filter**: By name, type, assigned studios
- **Actions**:
  - Edit template
  - Duplicate template
  - Delete template (with confirmation)
  - View usage statistics
- **Template Card Info**:
  - Template name
  - Type (Standard / Resistance Only)
  - Number of blocks
  - Assigned studios
  - Last updated
  - Sessions completed using this template

---

### 2. Trainer Features

#### 2.1 Trainer Dashboard

**Purpose:** Quick access to assigned templates and session history

**Components:**
- **Header**: "Trainer Dashboard - Welcome [Name]"
- **Stats Cards**:
  - Templates Assigned
  - Sessions Today
  - Sessions This Week
  - Average Client RPE
- **Quick Actions**:
  - Start New Session
  - View Calendar (mock)
- **Upcoming Sessions**: Today's scheduled sessions (mock data)
- **Recent Sessions**: Last 5 completed sessions

#### 2.2 Templates (Read-Only View)

**Purpose:** View templates assigned by studio owner

**Features:**
- **Template Cards**: Show template details
- **Preview**: Expand to see full workout structure
- **Start Session**: Button to begin session with this template
- **Cannot**:
  - Edit templates
  - Create templates
  - Delete templates

**UI:**
```
┌─────────────────────────────────────────────────┐
│  My Templates                                   │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐ │
│  │ =Results First Session                    │ │
│  │ 3 blocks • 30 min • Full body            │ │
│  │                                           │ │
│  │ [Preview]  [Start Session]              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Resistance Only Power Hour                │ │
│  │ 2 blocks • 30 min • Strength focused      │ │
│  │                                           │ │
│  │ [Preview]  [Start Session]              │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

#### 2.3 Start New Session

**Purpose:** Begin a training session with a client

**Workflow:**
1. **Select Template**: Choose from assigned templates
2. **Select Client**: Pick from client list or create new
3. **Choose Sign-Off Mode**:
   - **Full Session**: Mark entire session complete at end
   - **Per Block**: Mark each block complete after finishing
   - **Per Exercise**: Check off each exercise as you go
4. **Start Timer**: 30-minute countdown begins
5. **Begin Workout**

**UI - Mode Selection:**
```
┌─────────────────────────────────────────────────┐
│  Start New Session                              │
├─────────────────────────────────────────────────┤
│  Template: =Results First Session               │
│  Client: Tom Phillips                  [Change] │
│                                                 │
│  Choose Sign-Off Mode:                          │
│                                                 │
│  ○  Full Session                                │
│     Complete entire workout at once             │
│                                                 │
│  ●  Per Block                                   │
│     Sign off after each block (recommended)     │
│                                                 │
│  ○  Per Exercise                                │
│     Check off each exercise individually        │
│                                                 │
│  [Cancel]                  [Start Session]      │
└─────────────────────────────────────────────────┘
```

#### 2.4 Session Runner

**Purpose:** Run the workout session with real-time tracking

**Key Features:**

##### **A. Full Session Mode**
- Show all exercises across all blocks
- Timer counts down from 30:00
- At end of timer (or manual finish):
  - Enter overall RPE
  - Add notes
  - Sign declaration
  - Complete session

##### **B. Per Block Mode**
- Show current block exercises
- Expand/collapse other blocks
- After completing block:
  - Enter block RPE
  - Move to next block
- At end:
  - Enter overall RPE
  - Add notes
  - Sign declaration
  - Complete session

##### **C. Per Exercise Mode**
- Show exercises one at a time
- Swipe or tap to move between exercises
- Checkbox to mark each exercise complete
- Record actual resistance/reps used
- At end of block:
  - Enter block RPE
- At end of session:
  - Enter overall RPE
  - Add notes
  - Sign declaration
  - Complete session

**Common UI Elements (All Modes):**
- **Session Timer**: Large, prominent countdown (30:00)
- **Progress Bar**: Visual indicator of completion
- **Client Name**: Always visible
- **Template Name**: Always visible
- **Block Indicator**: "Block 2 of 3"
- **Exercise Counter**: "Exercise 3 of 5"

**Exercise Display:**
```
┌─────────────────────────────────────────────────┐
│  ⏱ 18:32              Block 2 of 3              │
│  Tom Phillips                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Dumbbell Chest Press                           │
│  ────────────────────────────────────────       │
│                                                 │
│  [Image: Start Position]  [Image: End Position]│
│                                                 │
│  Target: 25kg • 10-15 reps • 2 sets            │
│                                                 │
│  Instructions:                                  │
│  1. Lie flat on bench with dumbbells...        │
│  2. Press dumbbells up until...                 │
│  3. Lower with control...                       │
│                                                 │
│  ─── Set 1 ───                                  │
│  Weight: [25kg ▼]  Reps: [12 ▼]  ☐ Complete   │
│                                                 │
│  ─── Set 2 ───                                  │
│  Weight: [25kg ▼]  Reps: [__ ▼]  ☐ Complete   │
│                                                 │
│  [◀ Previous]                    [Next ▶]       │
└─────────────────────────────────────────────────┘
```

**RPE Picker (Per Block):**
```
┌─────────────────────────────────────────────────┐
│  Block 1 Complete!                              │
├─────────────────────────────────────────────────┤
│  How hard was this block?                       │
│                                                 │
│  RPE: Rate of Perceived Exertion (1-10)        │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  1   2   3   4   5   6   7   8   9   10 │   │
│  │  ○   ○   ○   ○   ○   ●   ○   ○   ○   ○  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  6 - Moderate intensity                         │
│                                                 │
│  [Continue to Block 2]                          │
└─────────────────────────────────────────────────┘
```

**Session Completion:**
```
┌─────────────────────────────────────────────────┐
│  Session Complete! 🎉                          │
├─────────────────────────────────────────────────┤
│  Client: Tom Phillips                           │
│  Template: =Results First Session               │
│  Duration: 32 minutes                           │
│                                                 │
│  Block RPEs:                                    │
│  • Block 1: 7/10                                │
│  • Block 2: 8/10                                │
│  • Block 3: 6/10                                │
│                                                 │
│  Overall Workout RPE: [7 ▼] /10                │
│                                                 │
│  Performance Notes:                             │
│  ┌───────────────────────────────────────────┐ │
│  │ Tom showed great form today...            │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Recommendations for next session:              │
│  ┌───────────────────────────────────────────┐ │
│  │ Increase weight on chest press to 27.5kg │ │
│  │                                           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ☑ I confirm this workout was completed        │
│     as prescribed                               │
│                                                 │
│  [Cancel]                  [Save & Complete]    │
└─────────────────────────────────────────────────┘
```

#### 2.5 My Sessions

**Purpose:** View session history and in-progress sessions

**Features:**
- **Tabs**:
  - In Progress (0)
  - Completed (24)
- **Session Cards**:
  - Client name
  - Template used
  - Date/time
  - Duration
  - Overall RPE
  - Notes preview
- **Actions**:
  - View details (expand to see full breakdown)
  - Resume (for in-progress)

---

### 3. Client Features

#### 3.1 Client Dashboard

**Purpose:** Simple view of upcoming sessions and history

**Components:**
- **Welcome Header**: "Welcome back, [Client Name]!"
- **Next Session**: Large card with:
  - Trainer name
  - Date/time
  - Location (studio name)
- **Recent Sessions**: Last 3-5 completed sessions
- **Progress Stats**:
  - Sessions this month
  - Average RPE
  - Consistency streak

#### 3.2 Session History

**Purpose:** View all past training sessions

**Features:**
- **List View**: Chronological list of sessions
- **Session Details**:
  - Date
  - Trainer name
  - Template used
  - Duration
  - Overall RPE
  - Trainer notes
  - Exercises completed
- **Filters**:
  - By month
  - By trainer
  - By template

**Session Detail View:**
```
┌─────────────────────────────────────────────────┐
│  September 4, 2025 • 10:30 AM                   │
│  Trainer: Sarah Johnson                         │
├─────────────────────────────────────────────────┤
│  =Results First Session                         │
│  Duration: 32 minutes                           │
│  Overall RPE: 7/10                              │
│                                                 │
│  ─── Block 1 ───  RPE: 7/10                     │
│  ✓ Treadmill (3 min, intensity 7)              │
│  ✓ Dumbbell Chest Press (25kg, 12 reps × 2)   │
│  ✓ Bent Over Row (20kg, 15 reps × 2)          │
│  ✓ Goblet Squat (20kg, 12 reps × 2)           │
│  ✓ Plank (30s × 2)                             │
│                                                 │
│  ─── Block 2 ───  RPE: 8/10                     │
│  ✓ Stationary Bike (3 min, intensity 6)       │
│  ✓ Push-ups (Bodyweight, 15 reps × 2)         │
│  ...                                            │
│                                                 │
│  Trainer Notes:                                 │
│  "Great session! Tom showed improvement in      │
│   form on chest press. Ready to increase       │
│   weight next time."                            │
│                                                 │
│  [Close]                                        │
└─────────────────────────────────────────────────┘
```

---

## Component Architecture

### Core Components

#### 1. Layout Components

##### **Sidebar.tsx**

```typescript
// components/layout/Sidebar.tsx

interface SidebarProps {
  currentRole: 'studio_owner' | 'trainer' | 'client';
}

export function Sidebar({ currentRole }: SidebarProps) {
  const studioOwnerLinks = [
    { href: '/studio-owner', icon: '📊', label: 'Dashboard' },
    { href: '/studio-owner/templates', icon: '📋', label: 'Templates' },
    { href: '/studio-owner/sessions', icon: '💪', label: 'All Sessions' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const trainerLinks = [
    { href: '/trainer', icon: '📊', label: 'Dashboard' },
    { href: '/trainer/templates', icon: '📋', label: 'Templates' },
    { href: '/trainer/sessions', icon: '💪', label: 'My Sessions' },
    { href: '/trainer/calendar', icon: '📅', label: 'Calendar' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const clientLinks = [
    { href: '/client', icon: '🏠', label: 'Home' },
    { href: '/client/history', icon: '📖', label: 'History' },
    { href: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const links =
    currentRole === 'studio_owner' ? studioOwnerLinks :
    currentRole === 'trainer' ? trainerLinks :
    clientLinks;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-10 h-10 bg-wondrous-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
          W
        </div>
        <span className="text-xl font-bold text-wondrous-dark-blue font-heading">
          Wondrous
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>

      {/* User Info (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500 capitalize">{currentRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ href, icon, label, active = false }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${active
          ? 'bg-wondrous-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
}
```

##### **MobileNav.tsx**

```typescript
// components/layout/MobileNav.tsx

export function MobileNav({ currentRole }: { currentRole: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-wondrous-primary rounded-lg flex items-center justify-center text-white font-bold">
              W
            </div>
            <span className="text-lg font-bold text-wondrous-dark-blue">Wondrous</span>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-20" onClick={() => setIsOpen(false)}>
          <div
            className="fixed left-0 top-0 bottom-0 w-64 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar currentRole={currentRole} />
          </div>
        </div>
      )}
    </>
  );
}
```

#### 2. Studio Owner Components

##### **TemplateBuilder.tsx**

```typescript
// components/studio-owner/TemplateBuilder.tsx

export function TemplateBuilder() {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<'standard' | 'resistance_only'>('standard');
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([
    createEmptyBlock(1),
    createEmptyBlock(2),
    createEmptyBlock(3),
  ]);

  const handleAddBlock = () => {
    setBlocks([...blocks, createEmptyBlock(blocks.length + 1)]);
  };

  const handleRemoveBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const handleUpdateBlock = (blockId: string, updatedBlock: WorkoutBlock) => {
    setBlocks(blocks.map(b => b.id === blockId ? updatedBlock : b));
  };

  const handleSave = () => {
    // Save template logic
    const template: WorkoutTemplate = {
      id: generateId(),
      name: templateName,
      description,
      type: templateType,
      createdBy: 'studio_owner_1',
      assignedStudios: [], // Set via assignment modal
      blocks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    saveTemplate(template);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">Create Workout Template</h1>
        <p className="text-body-sm">Build a standardized workout for your trainers to use</p>
      </div>

      {/* Template Details */}
      <div className="card p-6 mb-6">
        <h2 className="text-heading-3 mb-4">Template Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., =Results First Session"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wondrous-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this workout template"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wondrous-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="standard"
                  checked={templateType === 'standard'}
                  onChange={(e) => setTemplateType(e.target.value as any)}
                  className="w-4 h-4 text-wondrous-primary"
                />
                <span className="text-sm">Standard 3-Block (with cardio)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="resistance_only"
                  checked={templateType === 'resistance_only'}
                  onChange={(e) => setTemplateType(e.target.value as any)}
                  className="w-4 h-4 text-wondrous-primary"
                />
                <span className="text-sm">Resistance Only (no cardio)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-6 mb-6">
        {blocks.map((block, index) => (
          <BlockBuilder
            key={block.id}
            block={block}
            blockIndex={index}
            templateType={templateType}
            onUpdate={(updatedBlock) => handleUpdateBlock(block.id, updatedBlock)}
            onRemove={() => handleRemoveBlock(block.id)}
            canRemove={blocks.length > 1}
          />
        ))}
      </div>

      {/* Add Block Button */}
      <button
        onClick={handleAddBlock}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-wondrous-blue hover:text-wondrous-blue transition-colors"
      >
        + Add Another Block
      </button>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-4">
        <button className="btn-outline">Cancel</button>
        <button onClick={handleSave} className="btn-primary">
          Save Template
        </button>
      </div>
    </div>
  );
}

function createEmptyBlock(blockNumber: number): WorkoutBlock {
  return {
    id: `block_${blockNumber}`,
    blockNumber,
    name: `Block ${blockNumber}`,
    exercises: [],
  };
}
```

##### **BlockBuilder.tsx**

```typescript
// components/studio-owner/BlockBuilder.tsx

interface BlockBuilderProps {
  block: WorkoutBlock;
  blockIndex: number;
  templateType: 'standard' | 'resistance_only';
  onUpdate: (block: WorkoutBlock) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function BlockBuilder({
  block,
  blockIndex,
  templateType,
  onUpdate,
  onRemove,
  canRemove
}: BlockBuilderProps) {
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: TemplateExercise = {
      id: generateId(),
      exerciseId: exercise.id,
      position: block.exercises.length + 1,
      muscleGroup: exercise.category,
      resistanceType: 'weight',
      resistanceValue: 20,
      repsMin: 10,
      repsMax: 15,
      sets: 2,
    };

    onUpdate({
      ...block,
      exercises: [...block.exercises, newExercise],
    });

    setShowExerciseLibrary(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    onUpdate({
      ...block,
      exercises: block.exercises.filter(e => e.id !== exerciseId),
    });
  };

  const handleUpdateExercise = (exerciseId: string, updates: Partial<TemplateExercise>) => {
    onUpdate({
      ...block,
      exercises: block.exercises.map(e =>
        e.id === exerciseId ? { ...e, ...updates } : e
      ),
    });
  };

  return (
    <div className="card p-6">
      {/* Block Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-heading-3">Block {blockIndex + 1}</h3>
          <p className="text-caption">{block.exercises.length} exercises</p>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 text-sm"
          >
            Remove Block
          </button>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-3 mb-4">
        {block.exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            exerciseNumber={index + 1}
            isCardio={exercise.muscleGroup === 'cardio'}
            isFirstInBlock={index === 0}
            templateType={templateType}
            onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
            onRemove={() => handleRemoveExercise(exercise.id)}
          />
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setShowExerciseLibrary(true)}
        className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-wondrous-blue hover:text-wondrous-blue transition-colors text-sm"
      >
        + Add Exercise
      </button>

      {/* Exercise Library Modal */}
      {showExerciseLibrary && (
        <ExerciseLibrary
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseLibrary(false)}
          filterCardio={templateType === 'standard' && block.exercises.length === 0}
        />
      )}
    </div>
  );
}
```

#### 3. Trainer Components

##### **SessionRunner.tsx**

```typescript
// components/trainer/SessionRunner.tsx

interface SessionRunnerProps {
  sessionId: string;
}

export function SessionRunner({ sessionId }: SessionRunnerProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  useEffect(() => {
    // Load session from localStorage or mock data
    const loadedSession = loadSession(sessionId);
    setSession(loadedSession);

    // Start timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleAutoComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId]);

  if (!session) return <div>Loading...</div>;

  const currentBlock = session.blocks[currentBlockIndex];
  const currentExercise = currentBlock?.exercises[currentExerciseIndex];

  // Render based on sign-off mode
  if (session.signOffMode === 'full_session') {
    return <FullSessionView session={session} timeRemaining={timeRemaining} />;
  }

  if (session.signOffMode === 'per_block') {
    return (
      <PerBlockView
        session={session}
        currentBlockIndex={currentBlockIndex}
        setCurrentBlockIndex={setCurrentBlockIndex}
        timeRemaining={timeRemaining}
      />
    );
  }

  // Per exercise mode
  return (
    <PerExerciseView
      session={session}
      currentBlockIndex={currentBlockIndex}
      currentExerciseIndex={currentExerciseIndex}
      setCurrentBlockIndex={setCurrentBlockIndex}
      setCurrentExerciseIndex={setCurrentExerciseIndex}
      timeRemaining={timeRemaining}
    />
  );
}
```

##### **SessionTimer.tsx**

```typescript
// components/trainer/SessionTimer.tsx

export function SessionTimer({ timeRemaining }: { timeRemaining: number }) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const progress = ((30 * 60 - timeRemaining) / (30 * 60)) * 100;

  return (
    <div className="card p-6 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Session Timer</span>
        <span className={`text-2xl font-bold font-mono ${timeRemaining < 300 ? 'text-red-500' : 'text-wondrous-dark-blue'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-wondrous-blue transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

---

## Mobile Design Patterns

### Mobile-Specific Considerations

#### 1. **Touch Targets**
- Minimum 44x44px for all interactive elements
- Larger tap areas for primary actions (48x48px or more)
- Generous spacing between tappable elements

#### 2. **Navigation**
- Bottom navigation for quick access (alternative to sidebar)
- Swipe gestures for moving between exercises
- Pull-to-refresh for session list

#### 3. **Forms**
- Large input fields (min height 44px)
- Numeric keyboards for number inputs
- Dropdowns optimized for mobile selection

#### 4. **Session Runner Mobile**

**Full-Screen Exercise View:**
```
┌─────────────────────────────────┐
│  ⏱ 18:32         Block 2/3      │
│  Tom Phillips                   │
├─────────────────────────────────┤
│                                 │
│                                 │
│        [Exercise Image]         │
│                                 │
│                                 │
│  Dumbbell Chest Press           │
│  25kg • 10-15 reps • 2 sets    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Set 1: 25kg × 12 reps  ✓      │
│  Set 2: 25kg × __      ☐       │
│                                 │
│  [Tap to mark complete]         │
│                                 │
├─────────────────────────────────┤
│  [◀ Prev]  [Instructions]  [Next ▶] │
└─────────────────────────────────┘
```

**Swipe Gestures:**
- Swipe left → Next exercise
- Swipe right → Previous exercise
- Tap exercise image → View full-screen instructions

**Mobile RPE Picker:**
```
┌─────────────────────────────────┐
│  Rate This Block                │
├─────────────────────────────────┤
│                                 │
│  How hard was Block 1?          │
│                                 │
│  ┌─────────────────────────┐   │
│  │      1  2  3  4  5       │   │
│  │      ○  ○  ○  ○  ○       │   │
│  │      6  7  8  9  10      │   │
│  │      ○  ●  ○  ○  ○       │   │
│  └─────────────────────────┘   │
│                                 │
│  7 - Hard                       │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Continue to Block 2    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

#### 5. **Responsive Breakpoints**

```css
/* Mobile First */
@media (min-width: 640px) {
  /* Small tablets */
}

@media (min-width: 768px) {
  /* Tablets */
  /* Show sidebar instead of mobile nav */
}

@media (min-width: 1024px) {
  /* Desktop */
  /* Multi-column layouts */
}

@media (min-width: 1280px) {
  /* Large desktop */
}
```

---

## Implementation Workflow

### Phase 1: Project Setup (Day 1)

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest trainer-aide-demo --typescript --tailwind --app
   ```

2. **Install Dependencies**
   - shadcn/ui components
   - Zustand for state management
   - React Hook Form + Zod
   - Lucide React for icons

3. **Set Up Design System**
   - Configure Tailwind with Wondrous colors
   - Create global CSS utilities
   - Set up font families

4. **Create Mock Data Files**
   - `lib/mock-data/exercises.ts`
   - `lib/mock-data/templates.ts`
   - `lib/mock-data/clients.ts`
   - `lib/mock-data/sessions.ts`

### Phase 2: Layout & Navigation (Day 1-2)

1. **Create Root Layout**
   - Sidebar component
   - Mobile navigation
   - Role switcher (for demo purposes)

2. **Build Core Layout Components**
   - `Sidebar.tsx`
   - `MobileNav.tsx`
   - `Header.tsx`

3. **Set Up Routing Structure**
   - Studio owner routes
   - Trainer routes
   - Client routes

### Phase 3: Studio Owner Features (Day 2-3)

1. **Dashboard**
   - Stat cards
   - Template list
   - Quick actions

2. **Template Builder**
   - Template details form
   - Block builder
   - Exercise library
   - Save/edit functionality

3. **Template Library**
   - List view
   - Search/filter
   - Edit/delete/duplicate

### Phase 4: Trainer Features (Day 3-4)

1. **Trainer Dashboard**
   - Assigned templates
   - Session stats
   - Quick start

2. **Session Runner**
   - Client selection
   - Sign-off mode selection
   - Timer implementation
   - Three rendering modes:
     - Full session view
     - Per block view
     - Per exercise view

3. **Session Completion**
   - RPE picker
   - Notes form
   - Declaration checkbox

4. **Session History**
   - In progress sessions
   - Completed sessions
   - Detail views

### Phase 5: Client Features (Day 4-5)

1. **Client Dashboard**
   - Next session card
   - Recent history

2. **Session History**
   - Detailed session view
   - Exercise breakdown
   - Trainer notes

### Phase 6: Mobile Optimization (Day 5-6)

1. **Responsive Layouts**
   - Test all views on mobile
   - Adjust spacing and sizing
   - Optimize touch targets

2. **Mobile-Specific UI**
   - Bottom navigation
   - Swipe gestures
   - Mobile exercise view
   - Mobile RPE picker

3. **Testing**
   - Test on actual devices
   - iOS Safari
   - Android Chrome

### Phase 7: Polish & Testing (Day 6-7)

1. **Visual Polish**
   - Consistent spacing
   - Smooth transitions
   - Loading states
   - Empty states

2. **Data Persistence**
   - LocalStorage for demo state
   - Session recovery
   - Template saving

3. **Testing**
   - All user flows
   - Edge cases
   - Performance

4. **Documentation**
   - README with demo instructions
   - User guide
   - Feature walkthrough

---

## Best Practices

### Code Organization

```typescript
// Use barrel exports for cleaner imports
// lib/mock-data/index.ts
export * from './exercises';
export * from './templates';
export * from './clients';
export * from './sessions';

// Import like this:
import { MOCK_EXERCISES, MOCK_TEMPLATES } from '@/lib/mock-data';
```

### State Management

```typescript
// Use Zustand for global session state
// lib/stores/session-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  activeSessionId: string | null;
  sessions: Session[];
  startSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  completeSession: (sessionId: string, completion: SessionCompletion) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      sessions: [],

      startSession: (session) => set((state) => ({
        activeSessionId: session.id,
        sessions: [...state.sessions, session],
      })),

      updateSession: (sessionId, updates) => set((state) => ({
        sessions: state.sessions.map(s =>
          s.id === sessionId ? { ...s, ...updates } : s
        ),
      })),

      completeSession: (sessionId, completion) => set((state) => ({
        activeSessionId: null,
        sessions: state.sessions.map(s =>
          s.id === sessionId
            ? {
                ...s,
                ...completion,
                completed: true,
                completedAt: new Date().toISOString()
              }
            : s
        ),
      })),
    }),
    {
      name: 'session-storage',
    }
  )
);
```

### Component Patterns

```typescript
// Always type your props
interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  isSelected?: boolean;
}

export function ExerciseCard({ exercise, onSelect, isSelected = false }: ExerciseCardProps) {
  // Component implementation
}

// Use composition for complex components
function SessionRunner() {
  return (
    <div className="session-runner">
      <SessionHeader />
      <SessionTimer />
      <SessionContent />
      <SessionControls />
    </div>
  );
}
```

### Styling Best Practices

```typescript
// Use Tailwind's @apply for reusable styles
// styles/globals.css

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-wondrous-primary text-white font-medium rounded-lg;
    @apply hover:bg-wondrous-primary-hover active:scale-[0.98];
    @apply transition-all duration-200;
  }

  .card {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm;
    @apply transition-shadow duration-200;
  }
}

// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<button className={cn(
  "btn-primary",
  isLoading && "opacity-50 cursor-not-allowed",
  isLarge && "btn-lg"
)}>
  Submit
</button>
```

### Accessibility

```typescript
// Always include proper ARIA labels
<button
  aria-label="Mark exercise as complete"
  onClick={handleComplete}
>
  ✓
</button>

// Use semantic HTML
<nav aria-label="Main navigation">
  {/* Navigation links */}
</nav>

<main>
  {/* Main content */}
</main>

// Ensure keyboard navigation
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Interactive element
</div>
```

### Performance

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const ExerciseLibrary = dynamic(
  () => import('@/components/studio-owner/ExerciseLibrary'),
  { loading: () => <div>Loading exercise library...</div> }
);

// Memoize expensive computations
const totalExercises = useMemo(() => {
  return blocks.reduce((total, block) => total + block.exercises.length, 0);
}, [blocks]);

// Use React.memo for expensive components
export const ExerciseCard = React.memo(function ExerciseCard({ exercise }) {
  // Component implementation
});
```

---

## Final Notes

### Demo Flow for Presentation

1. **Studio Owner View**
   - Show dashboard with templates
   - Create a new template (demonstrate builder)
   - Assign to studios

2. **Switch to Trainer View**
   - Show assigned templates
   - Start a new session
   - Choose sign-off mode
   - Run through a session (demonstrate all three modes)
   - Complete session with RPE and notes

3. **Switch to Client View**
   - Show dashboard
   - View session history
   - Drill into completed session details

4. **Mobile Demonstration**
   - Resize browser to mobile view
   - Show mobile navigation
   - Run session on mobile
   - Demonstrate swipe gestures

### Quality Checklist

Before considering the demo complete, ensure:

- [ ] All buttons use solid colors (NO gradients)
- [ ] Consistent spacing throughout
- [ ] Responsive on all screen sizes (320px → 1920px)
- [ ] Touch targets are at least 44x44px on mobile
- [ ] All forms have proper validation
- [ ] Loading states for async operations
- [ ] Empty states for lists
- [ ] Error handling with user-friendly messages
- [ ] Timer works correctly (30-minute countdown)
- [ ] All three sign-off modes work
- [ ] RPE picker is intuitive
- [ ] Session completion saves correctly
- [ ] Data persists in localStorage
- [ ] Keyboard navigation works
- [ ] ARIA labels for accessibility
- [ ] No console errors
- [ ] Smooth animations (60fps)

### Success Criteria

This demo is successful when:

1. **Visually Stunning**: Clean, modern design that impresses on first view
2. **Fully Functional**: All features work without bugs
3. **Mobile Excellence**: Perfect mobile experience, not just "responsive"
4. **Better Than References**: Clearly superior to wellness-frontend and class-dash-demo
5. **Client Delight**: Client sees their vision come to life

---

## Appendix: Quick Reference

### Brand Colors

```css
Primary: #a71075
Cyan: #45f2ff
Blue: #00bafc
Dark Blue: #0085c4
```

### Common CSS Classes

```css
.btn-primary      /* Magenta button */
.btn-secondary    /* Blue button */
.btn-outline      /* Outlined button */
.card             /* White card with shadow */
.card-interactive /* Clickable card with hover */
.text-heading-1   /* Page headings */
.text-heading-2   /* Section headings */
.text-body        /* Body text */
```

### Key Routes

```
/studio-owner          → Studio Owner Dashboard
/studio-owner/templates → Template Library
/studio-owner/templates/builder → Template Builder

/trainer               → Trainer Dashboard
/trainer/templates     → Assigned Templates
/trainer/sessions      → Session History
/trainer/sessions/new  → Start New Session
/trainer/sessions/[id] → Session Runner

/client                → Client Dashboard
/client/history        → Session History
```

---

**END OF REQUIREMENTS DOCUMENT**

This document provides everything needed to build a world-class Trainer Aide demo. Follow the specifications carefully, maintain the design system consistently, and deliver an exceptional user experience across all devices.

Good luck, and build something amazing! 💪
