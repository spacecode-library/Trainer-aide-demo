# Phase 5: AI Program Generator UI Implementation Plan

**Status:** 📋 PLANNING COMPLETE
**Based On:** Comprehensive UI review of existing design system
**Theme Compliance:** ✅ Matches Wondrous brand colors, typography, and patterns

---

## Design System Reference

### Colors (from existing UI)
```typescript
// Wondrous Brand Colors
--wondrous-primary: #A71075    // Vivid Magenta (main brand)
--wondrous-blue: #12229D       // Deep Blue
--wondrous-blue-light: #E8EAFF // Light Blue tint
--wondrous-orange: #F4B324     // Accent Orange

// Tailwind Config Usage
bg-wondrous-primary
text-wondrous-magenta
border-wondrous-magenta
hover:border-wondrous-magenta
dark:bg-purple-900/20
```

### Typography
- **Body Text:** Lato (font-sans)
- **Headings:** Montserrat (font-heading)
- **Logo Only:** Bodoni Moda (font-display)

### Component Patterns
- Multi-step wizard (from `/app/trainer/sessions/new/page.tsx`)
- Selection cards with radio indicators
- Step progress indicators
- Responsive mobile-first design
- Dark mode support via `dark:` classes

---

## 1. AI Program Generator Wizard

### Route Structure
```
/app/trainer/programs/new/page.tsx  → Main wizard page
/app/trainer/programs/[id]/page.tsx → Program viewer/editor
/app/trainer/programs/page.tsx      → Programs list
```

### Wizard Flow (4 Steps)

#### Step 1: Choose Method
**Pattern:** Selection cards with radio indicators (matches session creation wizard)

```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 → 2 → 3 → 4         │
├─────────────────────────────────────────┤
│                                         │
│  How would you like to create your      │
│  training program?                      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [●] 🤖 AI-Generated Program       │ │
│  │                                   │ │
│  │  Let Claude Sonnet 4.5 create a  │ │
│  │  personalized, science-backed     │ │
│  │  program based on client goals    │ │
│  │  and available equipment.         │ │
│  │                                   │ │
│  │  • Takes ~2 minutes              │ │
│  │  • Fully customizable after      │ │
│  │  • Includes movement balance     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [ ] 📝 Manual Program             │ │
│  │                                   │ │
│  │  Build a program from scratch    │ │
│  │  with full control over every    │ │
│  │  exercise, set, and rep.         │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [Cancel]  [Continue →]          │
└─────────────────────────────────────────┘
```

**Components:**
- `Card` with hover/selected states
- Radio indicator (circular border with dot)
- Icon from `lucide-react` (Sparkles for AI, FileText for Manual)
- Wondrous magenta for selected state

---

#### Step 2: Select Client (if AI chosen)

```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 → 3 → 4       │
├─────────────────────────────────────────┤
│                                         │
│  Who is this program for?               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [Search clients...]               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [ ] Sarah Johnson                 │ │
│  │     Beginner • Muscle Gain        │ │
│  │     Equipment: Dumbbells, Bench   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ [ ] Mike Chen                     │ │
│  │     Intermediate • Strength       │ │
│  │     Equipment: Full Gym           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  OR                                     │
│                                         │
│  [ ] Use custom parameters (no client) │
│                                         │
│         [← Back]  [Continue →]          │
└─────────────────────────────────────────┘
```

**Components:**
- Search input with debouncing
- Client selection cards (radio style)
- Client profile preview (name, level, goal, equipment)
- Option to skip client selection

---

#### Step 3: Configure Program Parameters

**If Client Selected:**
```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 ✓ → 3 → 4     │
├─────────────────────────────────────────┤
│                                         │
│  Program Details                        │
│                                         │
│  Client Profile (from Sarah Johnson)   │
│  ┌───────────────────────────────────┐ │
│  │ Goal: Muscle Gain                 │ │
│  │ Experience: Beginner              │ │
│  │ Equipment: Dumbbells, Bench       │ │
│  │ Injuries: None                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Program Structure                      │
│  ┌───────────────────────────────────┐ │
│  │ Program Name*                     │ │
│  │ [Sarah's 8-Week Muscle Builder]  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Duration*    │  │ Frequency*   │   │
│  │ [8 weeks ▼]  │  │ [3x/week ▼]  │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Session Duration*                 │ │
│  │ [45 minutes ▼]                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Optional Preferences                   │
│  ┌───────────────────────────────────┐ │
│  │ [✓] Include nutrition guidance    │ │
│  │ [ ] Focus on specific exercises   │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [← Back]  [Generate Program →]  │
└─────────────────────────────────────────┘
```

**If No Client (Custom Parameters):**
```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 ✓ → 3 → 4     │
├─────────────────────────────────────────┤
│                                         │
│  Program Configuration                  │
│                                         │
│  Client Details                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Goal*        │  │ Experience*  │   │
│  │ [Select ▼]   │  │ [Select ▼]   │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  Available Equipment* (multi-select)    │
│  ┌───────────────────────────────────┐ │
│  │ [✓] Dumbbells                     │ │
│  │ [✓] Barbell                       │ │
│  │ [✓] Bench                         │ │
│  │ [ ] Pull-up Bar                   │ │
│  │ [ ] Cables                        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Injuries/Restrictions (optional)       │
│  ┌───────────────────────────────────┐ │
│  │ [Add restriction...]              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Program Structure                      │
│  ┌───────────────────────────────────┐ │
│  │ Program Name*                     │ │
│  │ [8-Week Strength Program]         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Duration*    │  │ Frequency*   │   │
│  │ [8 weeks ▼]  │  │ [4x/week ▼]  │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Session Duration*                 │ │
│  │ [60 minutes ▼]                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [← Back]  [Generate Program →]  │
└─────────────────────────────────────────┘
```

**Form Validation:**
- All required fields marked with *
- Real-time validation feedback
- Helpful tooltips for each field

---

#### Step 4: Generating & Results

**During Generation (Loading State):**
```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 ✓ → 3 ✓ → 4   │
├─────────────────────────────────────────┤
│                                         │
│         🤖 Generating Your Program      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │      [Animated spinner/dots]      │ │
│  │                                   │ │
│  │  Claude Sonnet 4.5 is creating   │ │
│  │  your personalized program...     │ │
│  │                                   │ │
│  │  This typically takes 1-2 minutes │ │
│  │                                   │ │
│  │  Progress:                        │ │
│  │  ✓ Filtering exercises            │ │
│  │  ✓ Analyzing movement patterns    │ │
│  │  → Generating workouts...         │ │
│  │    Saving to database...          │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Do not close this window              │
└─────────────────────────────────────────┘
```

**Success State:**
```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 ✓ → 3 ✓ → 4 ✓ │
├─────────────────────────────────────────┤
│                                         │
│         ✅ Program Generated!           │
│                                         │
│  Sarah's 8-Week Muscle Builder          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  📊 Program Summary               │ │
│  │                                   │ │
│  │  Duration: 8 weeks                │ │
│  │  Frequency: 3 workouts/week       │ │
│  │  Total Workouts: 24               │ │
│  │  Total Exercises: 120             │ │
│  │                                   │ │
│  │  Movement Balance:                │ │
│  │  • Push (Horizontal): 18          │ │
│  │  • Pull (Horizontal): 18          │ │
│  │  • Push (Vertical): 12            │ │
│  │  • Squat: 12                      │ │
│  │  • Lunge: 12                      │ │
│  │  • Core: 24                       │ │
│  │  • Mobility: 24                   │ │
│  │                                   │ │
│  │  Generation Cost: $0.18           │ │
│  │  Generation Time: 95s             │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  AI Rationale:                    │ │
│  │                                   │ │
│  │  "This program is designed for a  │ │
│  │  beginner trainee with muscle     │ │
│  │  gain goals using limited         │ │
│  │  equipment. The structure follows │ │
│  │  a 3-day full-body split to       │ │
│  │  maximize frequency..."           │ │
│  └───────────────────────────────────┘ │
│                                         │
│    [← Create Another]  [View Program →] │
└─────────────────────────────────────────┘
```

**Error State:**
```
┌─────────────────────────────────────────┐
│  Step Indicator: 1 ✓ → 2 ✓ → 3 ✓ → 4 ✗ │
├─────────────────────────────────────────┤
│                                         │
│         ❌ Generation Failed            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Something went wrong             │ │
│  │                                   │ │
│  │  Error: Insufficient exercise     │ │
│  │  variety for selected equipment   │ │
│  │                                   │ │
│  │  Suggestion: Try adding more      │ │
│  │  equipment options or reducing    │ │
│  │  program duration.                │ │
│  └───────────────────────────────────┘ │
│                                         │
│         [← Back]  [Try Again]           │
└─────────────────────────────────────────┘
```

---

## 2. Program Viewer/Editor

### Route: `/app/trainer/programs/[id]/page.tsx`

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│  ← Back to Programs                  [Edit] [Share] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Sarah's 8-Week Muscle Builder              [Draft]│
│  Created Nov 14, 2025 • AI Generated               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📋 Overview    💪 Workouts    📊 Progress  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [Tab Content Here]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tab 1: Overview

```
┌─────────────────────────────────────────────────────┐
│  Program Details                                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ Duration: 8 weeks                             │ │
│  │ Frequency: 3 workouts/week                    │ │
│  │ Session Duration: 45 minutes                  │ │
│  │ Primary Goal: Muscle Gain                     │ │
│  │ Experience Level: Beginner                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  AI Rationale                                       │
│  ┌───────────────────────────────────────────────┐ │
│  │ "This program is designed for a beginner      │ │
│  │  trainee with muscle gain goals using limited │ │
│  │  equipment. The structure follows a 3-day     │ │
│  │  full-body split to maximize frequency for    │ │
│  │  muscle protein synthesis..."                 │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Movement Balance                                   │
│  ┌───────────────────────────────────────────────┐ │
│  │  Push (Horizontal)  ████████████████  18      │ │
│  │  Pull (Horizontal)  ████████████████  18      │ │
│  │  Push (Vertical)    ██████████        12      │ │
│  │  Squat              ██████████        12      │ │
│  │  Lunge              ██████████        12      │ │
│  │  Core               ████████████████████  24  │ │
│  │  Mobility           ████████████████████  24  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Equipment Required                                 │
│  ┌───────────────────────────────────────────────┐ │
│  │  🏋️ Dumbbells    💺 Bench                     │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Generation Metadata                                │
│  ┌───────────────────────────────────────────────┐ │
│  │  Model: Claude Sonnet 4.5                     │ │
│  │  Tokens Used: 18,922 (12,557 in / 6,365 out) │ │
│  │  Cost: $0.18                                  │ │
│  │  Generation Time: 95 seconds                  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Tab 2: Workouts

**Week Selector + Workout Cards:**
```
┌─────────────────────────────────────────────────────┐
│  Select Week:  [Week 1] [Week 2] ... [Week 8]      │
│                  ▲ Active                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Week 1 • Full Body Focus                          │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Day 1: Full Body A                   45 min  │ │
│  │  ────────────────────────────────────────────│ │
│  │                                               │ │
│  │  1. Goblet Squat                              │ │
│  │     3 sets × 10-12 reps @ RPE 7               │ │
│  │     Tempo: 3-1-1-0 • Rest: 90s                │ │
│  │     💡 Focus on depth and control             │ │
│  │                                               │ │
│  │  2. Dumbbell Bench Press                      │ │
│  │     3 sets × 10-12 reps @ RPE 7               │ │
│  │     Tempo: 3-0-1-0 • Rest: 90s                │ │
│  │     💡 Keep elbows at 45° angle               │ │
│  │                                               │ │
│  │  3. Dumbbell Bent-Over Row                    │ │
│  │     3 sets × 10-12 reps @ RPE 7               │ │
│  │     Tempo: 3-1-1-0 • Rest: 90s                │ │
│  │     💡 Squeeze shoulder blades together       │ │
│  │                                               │ │
│  │  [+ 5 more exercises]                         │ │
│  │                                               │ │
│  │  Total Volume: 24 sets                        │ │
│  │  Movement Patterns: 6                         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Day 2: Full Body B                   45 min  │ │
│  │  [Collapsed - click to expand]                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Day 3: Full Body C                   45 min  │ │
│  │  [Collapsed - click to expand]                │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Exercise Card Details:**
- Exercise name (bold, larger)
- Sets × Reps @ RPE
- Tempo notation (Eccentric-Pause-Concentric-Pause)
- Rest periods
- Coaching cues (💡 icon)
- Collapsible/expandable

### Tab 3: Progress (Future Phase)

```
┌─────────────────────────────────────────────────────┐
│  Program Progress                                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Completion: 37.5%                            │ │
│  │  ██████████░░░░░░░░░░░░░░░░                   │ │
│  │                                               │ │
│  │  Weeks Completed: 3 / 8                       │ │
│  │  Workouts Completed: 9 / 24                   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Not yet started - assign to client to track]     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Programs List

### Route: `/app/trainer/programs/page.tsx`

```
┌─────────────────────────────────────────────────────┐
│  AI Training Programs              [+ New Program]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Filter:  [All] [Draft] [Active] [Completed]       │
│  Search:  [Search programs...]                     │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Sarah's 8-Week Muscle Builder       [Draft]  │ │
│  │  ─────────────────────────────────────────────│ │
│  │  8 weeks • 3x/week • 24 workouts              │ │
│  │  Created Nov 14, 2025 • AI Generated          │ │
│  │                                               │ │
│  │  Push/Pull: 18/18 • Compounds: 48            │ │
│  │                                               │ │
│  │  [View Program] [Assign to Client] [•••]      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  Mike's 12-Week Strength Block    [Active]   │ │
│  │  ─────────────────────────────────────────────│ │
│  │  12 weeks • 4x/week • 48 workouts             │ │
│  │  Created Nov 10, 2025 • AI Generated          │ │
│  │                                               │ │
│  │  Assigned to: Mike Chen                       │ │
│  │  Progress: 4 / 48 workouts (8%)               │ │
│  │                                               │ │
│  │  [View Program] [View Progress] [•••]         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Load More...]                                     │
└─────────────────────────────────────────────────────┘
```

---

## 4. Component Architecture

### New Components to Create

#### `components/ai-programs/ProgramGeneratorWizard.tsx`
Multi-step wizard container with state management

**State Management:**
```typescript
type WizardStep = 'method' | 'client' | 'configure' | 'generating' | 'results';

const [currentStep, setCurrentStep] = useState<WizardStep>('method');
const [method, setMethod] = useState<'ai' | 'manual' | null>(null);
const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
const [programConfig, setProgramConfig] = useState<ProgramConfig | null>(null);
const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
```

**Props:**
```typescript
interface ProgramGeneratorWizardProps {
  clients: ClientProfile[];
  onComplete: (programId: string) => void;
  onCancel: () => void;
}
```

#### `components/ai-programs/MethodSelection.tsx`
Step 1: Choose AI or Manual

**Uses existing patterns:**
- Card with hover/selected states
- Radio indicator pattern from session wizard
- Sparkles icon for AI, FileText for Manual

#### `components/ai-programs/ClientSelection.tsx`
Step 2: Select client or use custom params

**Features:**
- Search input with debouncing
- Client profile cards
- Option to skip (custom params)

#### `components/ai-programs/ProgramConfiguration.tsx`
Step 3: Configure program details

**Two Modes:**
1. **With Client:** Pre-filled client data, only structure config
2. **Without Client:** Full configuration including goals, equipment, etc.

**Form Fields:**
- Program name (text input)
- Duration (dropdown: 2, 4, 6, 8, 12 weeks)
- Frequency (dropdown: 2-6x/week)
- Session duration (dropdown: 30, 45, 60, 75, 90 mins)
- Goal (dropdown: strength, hypertrophy, endurance, fat_loss)
- Experience (dropdown: beginner, intermediate, advanced)
- Equipment (multi-select checkboxes)
- Injuries/restrictions (tag input)

#### `components/ai-programs/GenerationProgress.tsx`
Step 4: Loading state during generation

**Features:**
- Animated spinner (from existing loading components)
- Progress steps with checkmarks
- Time estimate
- Warning not to close window

#### `components/ai-programs/GenerationResults.tsx`
Step 4: Success/error results

**Success View:**
- Program summary stats
- Movement balance preview
- AI rationale excerpt
- Generation metadata (cost, time)
- Actions: View Program, Create Another

**Error View:**
- Error message
- Helpful suggestions
- Actions: Back, Try Again

#### `components/ai-programs/ProgramOverview.tsx`
Overview tab content in program viewer

**Sections:**
- Program details grid
- AI rationale (collapsible)
- Movement balance chart (horizontal bars)
- Equipment list
- Generation metadata

#### `components/ai-programs/WorkoutsList.tsx`
Workouts tab content in program viewer

**Features:**
- Week selector (pill buttons)
- Collapsible workout cards
- Exercise details with sets/reps/RPE/tempo
- Coaching cues with icon

#### `components/ai-programs/ExerciseCard.tsx`
Individual exercise display within workouts

**Display:**
```
Exercise Name (bold)
3 sets × 10-12 reps @ RPE 7
Tempo: 3-1-1-0 • Rest: 90s
💡 Coaching cue here
```

#### `components/ai-programs/MovementBalanceChart.tsx`
Horizontal bar chart for movement distribution

**Data:**
```typescript
interface MovementBalance {
  push_horizontal: number;
  pull_horizontal: number;
  push_vertical: number;
  pull_vertical: number;
  squat: number;
  hinge: number;
  lunge: number;
  core: number;
  mobility: number;
}
```

**Visual:**
- Horizontal bars with labels
- Wondrous magenta fill
- Count on the right

#### `components/ai-programs/ProgramCard.tsx`
Program list item card

**Content:**
- Program name + status badge
- Stats row (weeks, frequency, total workouts)
- Creation date + AI badge
- Assignment info (if active)
- Action buttons

---

## 5. API Integration

### Client-Side Hook

#### `lib/hooks/use-program-generator.ts`
```typescript
interface UseProgramGeneratorOptions {
  onSuccess?: (result: GenerationResult) => void;
  onError?: (error: Error) => void;
}

export function useProgramGenerator(options?: UseProgramGeneratorOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generateProgram = async (config: ProgramGenerationRequest) => {
    setIsGenerating(true);
    setProgress(['Filtering exercises...']);

    try {
      // Simulate progress updates (since API call is one-shot)
      setTimeout(() => setProgress(prev => [...prev, 'Analyzing movement patterns...']), 5000);
      setTimeout(() => setProgress(prev => [...prev, 'Generating workouts...']), 30000);
      setTimeout(() => setProgress(prev => [...prev, 'Saving to database...']), 80000);

      const response = await fetch('/api/ai/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const result = await response.json();
      setResult(result);
      options?.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setIsGenerating(false);
    setProgress([]);
    setResult(null);
    setError(null);
  };

  return {
    generateProgram,
    isGenerating,
    progress,
    result,
    error,
    reset,
  };
}
```

---

## 6. Styling Guidelines

### Color Usage
```typescript
// Selection cards
border-wondrous-magenta         // Selected state
bg-purple-50/50                 // Light mode selected background
dark:bg-purple-900/20           // Dark mode selected background
hover:border-wondrous-magenta   // Hover state

// Buttons
bg-wondrous-primary text-white  // Primary action
hover:bg-purple-700             // Primary hover
border-wondrous-magenta         // Outline button
text-wondrous-magenta           // Link/ghost button

// Status badges
bg-yellow-100 text-yellow-800   // Draft
bg-green-100 text-green-800     // Active
bg-gray-100 text-gray-800       // Completed
dark:bg-yellow-900/20           // Dark mode variants
dark:text-yellow-300

// Progress bars
bg-wondrous-magenta             // Fill
bg-gray-200 dark:bg-gray-700    // Track

// Icons
text-wondrous-magenta           // Primary icons (Sparkles, etc.)
text-gray-400 dark:text-gray-500 // Secondary icons
```

### Typography
```typescript
// Headings
className="text-2xl font-heading font-bold"      // Page title
className="text-xl font-heading font-semibold"   // Section title
className="text-lg font-heading font-semibold"   // Card title

// Body
className="text-base font-sans"                  // Regular text
className="text-sm text-gray-600 dark:text-gray-400" // Secondary text
className="text-xs text-gray-500"                // Metadata

// Exercise details
className="font-semibold"                        // Exercise name
className="text-sm text-gray-600"                // Sets/reps
className="text-xs text-gray-500"                // Tempo/rest
```

### Spacing
```typescript
// Container padding
className="p-6 md:p-8"           // Card padding
className="px-4 py-2"            // Button padding
className="space-y-6"            // Section spacing
className="gap-4"                // Grid/flex gaps

// Responsive
className="max-w-3xl mx-auto"    // Wizard container
className="grid grid-cols-1 md:grid-cols-2 gap-4" // Two-column layout
```

### Dark Mode
```typescript
// Always include dark mode variants
className="bg-white dark:bg-gray-800"
className="text-gray-900 dark:text-gray-100"
className="border-gray-200 dark:border-gray-700"
```

---

## 7. Mobile Responsiveness

### Breakpoints (Tailwind defaults)
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

### Mobile-First Patterns

#### Wizard Steps (Mobile)
```
┌─────────────────┐
│  Step 1 of 4    │  ← Text indicator instead of visual
├─────────────────┤
│                 │
│  [Full width    │
│   selection     │
│   cards]        │
│                 │
│  [Cancel]       │
│  [Continue]     │  ← Stack buttons
└─────────────────┘
```

#### Workout Cards (Mobile)
```
┌─────────────────┐
│ Week 1 ▼        │  ← Dropdown instead of pills
├─────────────────┤
│ Day 1: Full Body│
│ 45 min          │
├─────────────────┤
│ 1. Goblet Squat │
│ 3×10-12 @ RPE 7 │  ← Compact notation
│ [Tap for more]  │
└─────────────────┘
```

#### Responsive Classes
```typescript
// Hide on mobile, show on desktop
className="hidden md:block"

// Full width on mobile, constrained on desktop
className="w-full md:w-auto"

// Stack on mobile, row on desktop
className="flex flex-col md:flex-row"

// Smaller text on mobile
className="text-sm md:text-base"

// Adjust padding
className="p-4 md:p-6"
```

---

## 8. Implementation Order

### Phase 5.1: Core Wizard (Priority 1)
1. ✅ Create routing structure
2. ✅ Build `ProgramGeneratorWizard.tsx` shell
3. ✅ Implement `MethodSelection.tsx`
4. ✅ Implement `ClientSelection.tsx`
5. ✅ Implement `ProgramConfiguration.tsx`
6. ✅ Implement `GenerationProgress.tsx`
7. ✅ Implement `GenerationResults.tsx`
8. ✅ Create `use-program-generator.ts` hook
9. ✅ Wire up API integration
10. ✅ Test end-to-end flow

### Phase 5.2: Program Viewer (Priority 2)
1. ✅ Create program detail page route
2. ✅ Build tab navigation
3. ✅ Implement `ProgramOverview.tsx`
4. ✅ Implement `WorkoutsList.tsx`
5. ✅ Implement `ExerciseCard.tsx`
6. ✅ Implement `MovementBalanceChart.tsx`
7. ✅ Add edit/share functionality (basic)

### Phase 5.3: Programs List (Priority 3)
1. ✅ Create programs list page
2. ✅ Implement `ProgramCard.tsx`
3. ✅ Add filtering and search
4. ✅ Add pagination
5. ✅ Link to generator and viewer

### Phase 5.4: Polish (Priority 4)
1. ✅ Mobile responsiveness testing
2. ✅ Dark mode testing
3. ✅ Loading states refinement
4. ✅ Error handling UX
5. ✅ Accessibility audit (keyboard nav, ARIA labels)
6. ✅ Animation/transitions (subtle, not excessive)

---

## 9. Testing Checklist

### Functional Testing
- [ ] Wizard navigation (forward/back)
- [ ] Form validation (required fields)
- [ ] Client selection (with/without client)
- [ ] API call success path
- [ ] API call error handling
- [ ] Program generation with 2, 4, 8 week durations
- [ ] Different equipment combinations
- [ ] Injury restrictions respected
- [ ] Program viewer loads correctly
- [ ] Week navigation in workouts tab
- [ ] Programs list filtering
- [ ] Programs list search

### Visual Testing
- [ ] Colors match Wondrous brand
- [ ] Typography uses correct fonts
- [ ] Dark mode works everywhere
- [ ] Mobile layout (375px width)
- [ ] Tablet layout (768px width)
- [ ] Desktop layout (1280px width)
- [ ] Loading states look good
- [ ] Error states are clear
- [ ] Success states are celebratory

### Accessibility Testing
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA
- [ ] Form errors announced

### Performance Testing
- [ ] Generation doesn't block UI
- [ ] List pagination smooth
- [ ] No layout shift during loading
- [ ] Images optimized (if any)

---

## 10. Future Enhancements (Phase 6+)

### Program Management
- [ ] Duplicate program
- [ ] Archive program
- [ ] Export to PDF
- [ ] Share via link
- [ ] Program templates library

### Client Assignment
- [ ] Assign program to client
- [ ] Send notification
- [ ] Client can view on mobile
- [ ] Client can log workouts

### Progress Tracking
- [ ] Workout completion tracking
- [ ] Exercise performance history
- [ ] Progress photos
- [ ] Body metrics tracking
- [ ] Volume/intensity charts

### AI Enhancements
- [ ] Regenerate specific weeks
- [ ] Adjust program mid-cycle
- [ ] AI-suggested progressions
- [ ] Exercise substitutions
- [ ] Auto-deload weeks

### Analytics
- [ ] Generation cost tracking
- [ ] Most popular program types
- [ ] Client adherence rates
- [ ] Exercise effectiveness data

---

## Success Criteria

Phase 5 will be considered complete when:

1. ✅ **Wizard Works End-to-End**
   - Can create program via wizard
   - API integration successful
   - Results display correctly

2. ✅ **Program Viewer Functional**
   - Can view generated programs
   - All tabs work
   - Movement balance displays

3. ✅ **Programs List Works**
   - Can see all programs
   - Filtering works
   - Navigation to viewer works

4. ✅ **UI Matches Design System**
   - Wondrous colors used correctly
   - Typography consistent
   - Dark mode works
   - Mobile responsive

5. ✅ **User Experience Smooth**
   - Clear loading states
   - Helpful error messages
   - Intuitive navigation
   - Fast performance

---

## Estimated Effort

- **Phase 5.1 (Core Wizard):** 6-8 hours
- **Phase 5.2 (Program Viewer):** 4-6 hours
- **Phase 5.3 (Programs List):** 2-3 hours
- **Phase 5.4 (Polish):** 2-3 hours

**Total:** 14-20 hours

---

## Notes

- All components should be server components by default
- Use client components only when needed (forms, interactive elements)
- Leverage existing UI components from `components/ui/`
- Follow existing patterns from session wizard
- Keep bundle size small (no unnecessary dependencies)
- Prioritize performance (lazy load when appropriate)

**Ready to begin implementation!** 🚀
