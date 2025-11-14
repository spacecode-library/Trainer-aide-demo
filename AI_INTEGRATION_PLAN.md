# AI Workout Generation Integration - Implementation Plan

**Date:** 2025-11-14
**Project:** Trainer Aide Demo
**Feature:** AI-Powered Workout Template Generator using Claude (Anthropic)

---

## Executive Summary

**GREAT NEWS:** Your Supabase production database ALREADY HAS all the advanced S&C fields your client wants! The `ta_exercise_library_original` table contains 873 exercises with:
- ✅ `movement_pattern` (push, pull, squat, hinge, etc.)
- ✅ `plane_of_motion` (sagittal, frontal, transverse)
- ✅ `muscles_json` (structured primary/secondary/stabilizers)
- ✅ `muscle_intensity_json` (0.0-1.0 intensity scores)
- ✅ `is_unilateral` (boolean)
- ✅ `is_bodyweight` (boolean)
- ✅ `tempo_default`
- ✅ `anatomical_category`
- ✅ `exercise_type`
- ✅ Complete instructions, common_mistakes, modifications

**The disconnect:** Your frontend is using 887 simplified mock exercises from a JSON file that LACKS these fields. The production database is ready - we just need to connect your app to it.

---

## What Your Client Really Wants (Decoded)

Looking past the ChatGPT jargon, your client wants:

1. **AI-Generated Workout Templates** - Generate complete workout programs based on client goals, experience, equipment, and injuries
2. **Intelligent Exercise Selection** - Use movement patterns, planes of motion, and muscle targeting for balanced programming
3. **Keep Manual Builder** - Trainers should still be able to build workouts manually
4. **Client Intake System** - Capture client goals, limitations, preferences to inform AI decisions

---

## Current State Analysis

### ✅ What's Ready
1. **Production Exercise Database** - 873 exercises in Supabase with ALL S&C metadata
2. **Manual Template Builder** - Fully functional UI for creating templates manually
3. **Session System** - Complete session execution with RPE tracking
4. **Anthropic API Key** - Provided for Claude integration

### ❌ Critical Gaps
1. **Frontend-Database Disconnect** - App uses mock data, not Supabase exercises
2. **No Client Intake** - Only stores name/email, no goals/injuries/experience
3. **No AI Tables** - Need Supabase tables for AI-generated programs
4. **No AI Integration** - Zero AI code currently exists

---

## Implementation Phases

### **Phase 1: Connect Frontend to Production Exercise Database** ⏳ 90% COMPLETE
**Estimated Time:** 2-3 hours
**Status:** Nearly Complete

**Tasks:**
- [x] Create TypeScript interfaces matching Supabase schema (26 fields)
- [x] Create Supabase query functions for exercises
- [x] Create exercise adapter utilities (Supabase → Frontend)
- [x] Update `lib/mock-data/exercises.ts` to use Supabase with caching
- [ ] Update Exercise type consumers (template builder, session runner)
- [ ] Test template builder with real Supabase exercises

**Files Created:**
- ✅ `lib/services/exercise-service.ts` - Complete Supabase exercise query service (331 lines)
  - `getAllExercises()` - Fetch all 873 exercises
  - `getExercises(filters)` - Filtered queries (equipment, level, movement pattern, etc.)
  - `getExerciseById(id)` - Single exercise lookup
  - `searchExercises(term)` - Search by name
  - `getExercisesByMovementPattern()` - For AI workout balance
  - `getAvailableEquipment()` - For filter dropdowns
  - Advanced filtering: unilateral, bodyweight, plane of motion, anatomical category

- ✅ `lib/utils/exercise-adapter.ts` - Converter utilities (281 lines)
  - `supabaseToFrontendExercise()` - Convert full schema to frontend format
  - `mapAnatomicalCategoryToMuscleGroup()` - Category mapping
  - `getExerciseCategoryLabel()`, `getExerciseTypeLabel()`, etc. - Display helpers
  - `formatTempo()` - Human-readable tempo display
  - `getPrimaryMuscleIntensity()` - Intensity score extraction
  - Utility functions for UI rendering

**Files Modified:**
- ✅ `lib/types/index.ts` - Added comprehensive type system:
  - `SupabaseExercise` interface (26 fields matching database)
  - New types: `ExerciseType`, `MovementPattern`, `PlaneOfMotion`, `ForceType`, `MechanicType`
  - `MusclesJson` and `MuscleIntensityJson` interfaces
  - Enhanced `Exercise` interface with optional S&C fields (backwards compatible)

- ✅ `lib/mock-data/exercises.ts` - Hybrid Supabase + fallback system:
  - `loadExercises()` - Async Supabase fetching with 5-min cache
  - Graceful fallback to legacy JSON on errors
  - Backwards-compatible synchronous accessors
  - `searchExercises()` - Supabase search with fallback

**Deliverables:**
- Updated TypeScript types with all 26 Supabase fields
- Supabase query functions for exercises
- Updated template builder using production data

---

### **Phase 2: Build Client Intake System** 📋 PENDING
**Estimated Time:** 3-4 hours

**Tasks:**
1. Create Supabase `client_profiles` table with AI-relevant fields:
   - Goals (primary/secondary)
   - Experience level
   - Injuries/limitations
   - Available equipment
   - Preferred training frequency
   - Session duration preference
2. Build client intake form UI (wizard-style, 3-5 steps)
3. Update `Client` interface in types
4. Create client profile management page
5. Add "Edit Profile" link in trainer client view

**Files To Create:**
- `migrations/003_create_client_profiles.sql`
- `lib/types/client-profile.ts`
- `lib/services/client-profile-service.ts`
- `app/trainer/clients/[id]/profile/page.tsx`
- `components/client/ClientIntakeWizard.tsx`

**Deliverables:**
- `client_profiles` Supabase table
- Client intake form component
- Profile management UI
- Updated Client TypeScript interface

---

### **Phase 3: Create AI Program Generation Tables** 📋 PENDING
**Estimated Time:** 1-2 hours

**Tasks:**
1. Create Supabase tables:
   - `ai_programs` - Master program record
   - `ai_workouts` - Individual workout sessions
   - `ai_workout_exercises` - Exercises within workouts
   - `ai_nutrition_plans` - Optional nutrition guidance
   - `ai_generations` - Log of AI calls for debugging
2. Set up Row-Level Security (RLS) policies
3. Create indexes for performance
4. Write TypeScript types for new tables

**Files To Create:**
- `migrations/004_create_ai_program_tables.sql`
- `lib/types/ai-program.ts`
- `lib/services/ai-program-service.ts`

**Deliverables:**
- 5 new Supabase tables
- RLS policies configured
- TypeScript interfaces for AI program data

---

### **Phase 4: Build AI Workout Generator (Core Feature)** 🤖 PENDING
**Estimated Time:** 6-8 hours

**Why:** The main feature - use Claude (Anthropic) to generate intelligent, balanced workout programs.

**Tasks:**
1. Create API route: `/api/ai/generate-program` (Next.js App Router)
   - Input: clientId, programGoals, duration, frequency
   - Output: Complete workout program
2. Implement AI prompt engineering:
   - **System prompt:** Establishes Claude as S&C coach with access to exercise database
   - **Exercise selection logic:** Filter by equipment, contra-indications, movement pattern balance
   - **Progressive overload rules:** Sets/reps/intensity based on experience level
   - **Weekly structure:** Distribute movement patterns across training days
3. Query Supabase exercises with filters (equipment, injuries, level)
4. Pass filtered exercises to Claude with JSON schema
5. Validate AI output (movement balance, injury conflicts, equipment availability)
6. Save generated program to `ai_programs` tables
7. Error handling and retry logic

**Files To Create:**
- `app/api/ai/generate-program/route.ts`
- `lib/ai/prompts/workout-generator.ts`
- `lib/ai/anthropic-client.ts`
- `lib/ai/validators/program-validator.ts`
- `lib/ai/utils/exercise-filter.ts`

**Deliverables:**
- `/api/ai/generate-program` endpoint
- AI prompt templates
- Exercise filtering logic
- Program validation functions
- AI generation logging

---

### **Phase 5: Build AI Template Builder UI** 🎨 PENDING
**Estimated Time:** 4-5 hours

**Why:** Trainers need a simple interface to generate programs with AI.

**Tasks:**
1. Create new page: `/app/studio-owner/templates/ai-builder/page.tsx`
2. Build wizard UI:
   - Step 1: Select client (or create generic template)
   - Step 2: Set program parameters (goal, duration, frequency, equipment)
   - Step 3: Review AI-generated program
   - Step 4: Edit/approve (allow manual modifications)
3. Add "Generate with AI" button to existing manual builder (optional hybrid mode)
4. Display AI rationale (why exercises were chosen)
5. Show movement pattern balance visualization
6. Allow conversion: AI template → editable manual template
7. Save finalized program to Supabase

**Files To Create:**
- `app/studio-owner/templates/ai-builder/page.tsx`
- `components/ai/ProgramGenerationWizard.tsx`
- `components/ai/MovementPatternVisualization.tsx`
- `components/ai/AIRationale.tsx`
- `components/ai/ProgramReview.tsx`

**Deliverables:**
- AI template builder page
- Program review/edit UI
- Movement balance visualization
- Hybrid mode (AI + manual) integration

---

### **Phase 6: Session Integration & Progressive Overload** 📈 PENDING
**Estimated Time:** 3-4 hours

**Why:** Use completed session data to inform next workout generation.

**Tasks:**
1. Create API route: `/api/ai/progress-program`
   - Input: completedSessionId, clientId
   - Output: Updated workout with progressive adjustments
2. Analyze RPE data from completed sessions
3. Adjust weights/reps/sets based on performance
4. Implement deload logic (every 4-6 weeks)
5. Auto-generate "next session" button in trainer dashboard
6. Track program adherence and suggest modifications

**Files To Create:**
- `app/api/ai/progress-program/route.ts`
- `lib/ai/utils/progressive-overload.ts`
- `lib/ai/utils/rpe-analyzer.ts`

**Deliverables:**
- Progressive overload API endpoint
- RPE-based adjustment logic
- Deload detection
- "Generate Next Session" UI button

---

### **Phase 7: Testing & Refinement** ✅ PENDING
**Estimated Time:** 2-3 hours

**Tasks:**
1. Test AI generation with various client profiles
2. Verify movement pattern balance
3. Test injury conflict detection
4. Validate equipment filtering
5. Check progressive overload logic
6. Test manual editing of AI programs
7. Performance optimization (caching, query optimization)

**Deliverables:**
- Test cases for AI generation
- Performance benchmarks
- Bug fixes
- Documentation

---

## Technical Architecture

### AI Generation Flow
```
User Input (Client Profile + Goals)
    ↓
Filter Exercises (Supabase Query)
    ↓
AI Prompt + Filtered Exercises → Claude API
    ↓
Structured JSON Output (Validated)
    ↓
Save to ai_programs Tables
    ↓
Display in UI (Editable)
    ↓
Convert to Session Template
```

### Key Design Decisions

1. **Hybrid Storage:** Keep manual templates in localStorage (demo mode), store AI programs in Supabase (production)
2. **Two Builders:** Separate AI builder page + optional "Generate with AI" button in manual builder
3. **Editable Output:** AI generates draft, trainers can always edit before finalizing
4. **Anthropic Claude:** Use provided API key, structured JSON output mode
5. **Movement Balance:** Enforce pattern quotas per week (e.g., 2 push, 2 pull, 2 legs, 1 core)
6. **Safety First:** Always filter out exercises that conflict with client injuries

---

## What Makes This Implementation Intelligent

Unlike generic AI workout generators:

1. **Biomechanically Sound** - Uses movement_pattern and plane_of_motion to ensure balanced programming
2. **Injury-Aware** - Automatically excludes contraindicated exercises based on client limitations
3. **Progressive** - Uses muscle_intensity_json to program appropriate progressions
4. **Context-Aware** - Considers equipment availability, experience level, training frequency
5. **Explainable** - AI provides rationale for exercise selections
6. **Editable** - Trainers maintain full control to override AI decisions

---

## Timeline

**Total Estimated Time:** 20-27 hours

- Phase 1: 2-3 hours ⏳ IN PROGRESS
- Phase 2: 3-4 hours
- Phase 3: 1-2 hours
- Phase 4: 6-8 hours (core AI logic)
- Phase 5: 4-5 hours
- Phase 6: 3-4 hours
- Phase 7: 2-3 hours

**Suggested Schedule:**
- Week 1: Phases 1-3 (foundation)
- Week 2: Phases 4-5 (AI core + UI)
- Week 3: Phases 6-7 (refinement + testing)

---

## Success Criteria

1. ✅ Frontend uses Supabase exercises (not mock JSON)
2. ✅ Client intake captures all AI-relevant data
3. ✅ AI generates complete 4-12 week programs
4. ✅ Movement patterns balanced per week
5. ✅ Injury conflicts automatically avoided
6. ✅ Trainers can edit AI output before saving
7. ✅ Progressive overload works from session data
8. ✅ Manual template builder still fully functional

---

## Risk Mitigation

1. **AI Hallucination:** Validate all exercise IDs exist in database before saving
2. **Poor Workouts:** Implement movement balance checks, intensity caps
3. **Performance:** Cache exercise queries, limit AI calls
4. **Cost:** Log token usage, implement rate limiting
5. **User Adoption:** Keep manual builder as fallback, AI is optional enhancement

---

## Progress Tracking

### Completed ✅
- TypeScript interfaces for Supabase exercise schema
- New types: ExerciseType, MovementPattern, PlaneOfMotion, MusclesJson, MuscleIntensityJson
- SupabaseExercise interface (complete 26-field schema)
- Enhanced Exercise interface (backwards compatible)

### In Progress ⏳
- Supabase exercise query service
- Exercise adapter utilities

### Next Up 📋
- Replace mock exercise data with Supabase queries
- Client profile system
- AI program tables

---

## References

- **Anthropic API Key:** Stored in `.env` as `ANTHROPIC_API_KEY`
- **Supabase URL:** `https://scpfuwijsbjxuhfwoogg.supabase.co`
- **Exercise Table:** `ta_exercise_library_original` (873 exercises)
- **Backup Table:** `ta_exercise_library_original_backup_utcnow` (873 exercises)

---

## Notes

- Client's document was AI-generated (ChatGPT) with some technical inaccuracies
- Core goal: AI workout generation with intelligent exercise selection
- Must maintain manual template builder as fallback
- Focus on S&C principles: movement patterns, planes of motion, progressive overload
- Use Anthropic Claude API (not OpenAI) per user's API key
