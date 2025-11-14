-- TEMPORARY: Disable RLS for AI program generation testing
-- This allows the API to insert data for testing purposes
-- Re-enable RLS after testing is complete

-- Disable RLS on all AI tables temporarily
ALTER TABLE ai_programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_nutrition_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_program_revisions DISABLE ROW LEVEL SECURITY;

-- To re-enable later (DON'T RUN YET):
-- ALTER TABLE ai_programs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_workouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_workout_exercises ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_nutrition_plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_program_revisions ENABLE ROW LEVEL SECURITY;
