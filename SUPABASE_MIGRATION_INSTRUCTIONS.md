# Supabase Migration Instructions

## ⚠️ CRITICAL: Run These Migrations to Fix Database Errors

**Error you're seeing**:
```
ERROR: 42P01: relation "ai_programs" does not exist
```

**Cause**: The database tables haven't been created yet on your Supabase instance.

**Solution**: Run the migration SQL in your Supabase dashboard.

---

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Combined Migration

Copy and paste the contents of `combined-migration.sql` into the SQL Editor and click **Run**.

**OR** run these three files in order:

1. `migrations/002_create_ai_program_tables.sql` - Creates main tables
2. `migrations/20250114_add_generation_status.sql` - Adds generation status fields
3. `migrations/20250115_add_progress_tracking.sql` - Adds progress tracking fields

### Step 3: Verify Tables Were Created

After running the migration, execute this verification query:

```sql
-- Verify AI Program tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'ai_programs',
  'ai_workouts',
  'ai_workout_exercises',
  'ai_nutrition_plans',
  'ai_generations',
  'ai_program_revisions'
)
ORDER BY table_name;
```

**Expected Result**: You should see 6 tables listed:
- ✅ ai_generations
- ✅ ai_nutrition_plans
- ✅ ai_program_revisions
- ✅ ai_programs
- ✅ ai_workout_exercises
- ✅ ai_workouts

### Step 4: Test with Sample Query

Run this to confirm the schema is correct:

```sql
-- Test query (should return 0 rows but no errors)
SELECT
  p.program_name,
  COUNT(w.id) as workout_count
FROM ai_programs p
LEFT JOIN ai_workouts w ON w.program_id = p.id
GROUP BY p.id, p.program_name;
```

If this runs without errors, your database is ready!

---

## What These Tables Do

### ai_programs
- Stores AI-generated workout programs
- Contains metadata (weeks, sessions, goals, etc.)
- Links to client profiles and trainers

### ai_workouts
- Individual workout sessions within a program
- One per day of training (Week 1 Day 1, Week 1 Day 2, etc.)
- Contains workout metadata and planned duration

### ai_workout_exercises
- Specific exercises within each workout
- Sets, reps, tempo, rest periods, coaching cues
- Links to exercise library

### ai_nutrition_plans
- Optional nutrition guidance for programs
- Macros, meal timing, recommendations

### ai_generations
- Logs all AI API calls for cost tracking
- Stores tokens used, latency, errors

### ai_program_revisions
- Version history for programs
- Allows rollback and change tracking

---

## Troubleshooting

### Error: "relation already exists"
- **Cause**: Tables already created
- **Solution**: Skip to Step 3 to verify tables exist

### Error: "permission denied"
- **Cause**: Not logged in as database owner
- **Solution**: Make sure you're logged into the correct Supabase project

### Error: "function update_updated_at_column does not exist"
- **Cause**: Missing the timestamp update function
- **Solution**: Run `migrations/001_create_client_profiles.sql` first (it contains this function)

---

## After Migration

Once tables are created, try generating an AI program again. The database errors should be gone!

**Note**: You'll still hit the 60-second Netlify timeout issue. See `PLATFORM_TIMEOUT_ISSUE.md` for solutions.
