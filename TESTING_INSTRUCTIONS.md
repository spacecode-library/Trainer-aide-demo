# Testing Instructions for AI Program Generation

## Issue: Route Not Found (404)

The API route file exists at `app/api/ai/generate-program/route.ts` but Next.js hasn't picked it up yet because the dev server was running when the file was created.

## Solution: Restart Next.js Dev Server

### Step 1: Stop the Current Server

In the terminal where Next.js is running, press:
```
Ctrl + C
```

### Step 2: Start the Server Again

```bash
npm run dev
```

Wait for the message:
```
✓ Ready in Xms
○ Local: http://localhost:3000
```

### Step 3: Verify the Route is Available

Run the pre-test check:
```bash
./scripts/pre-test-check.sh
```

You should see:
```
✅ Route is accessible (HTTP 400 or 200)
```

---

## Running the Tests

Once the server is restarted and the pre-test check passes:

### Test 1: Simple Quick Test

```bash
./scripts/simple-test.sh
```

This will:
- Generate a 4-week, 3x/week program
- Test with minimal parameters
- Should complete in 5-15 seconds
- Cost: ~$0.10-0.20

### Test 2: Comprehensive Test Suite

```bash
./scripts/test-api-endpoint.sh
```

This will run 3 tests:
1. **Test 1**: 4-week program with injury restrictions
2. **Test 2**: 12-week advanced program (full featured)
3. **Test 3**: Error handling (insufficient exercises)

Expected cost: ~$0.30-0.50 total

---

## What to Expect

### Successful Response

```json
{
  "success": true,
  "program_id": "uuid-123-456...",
  "program": {
    "id": "uuid-123-456...",
    "program_name": "Test Program",
    "total_weeks": 4,
    "sessions_per_week": 3,
    ...
  },
  "workouts_count": 12,
  "exercises_count": 48,
  "generation_log": {
    "tokens_used": 15234,
    "input_tokens": 12000,
    "output_tokens": 3234,
    "cost_usd": 0.0456,
    "latency_ms": 3420
  },
  "filtering_stats": {
    "total_available": 873,
    "filtered_by_equipment": 450,
    "filtered_by_experience": 100,
    "filtered_by_injuries": 20,
    "final_count": 303
  }
}
```

### Error Response (Expected for Test 3)

```json
{
  "error": "Insufficient exercises available",
  "details": "Only 15 exercises match constraints. Need at least 20.",
  "suggestions": [
    "Add more equipment options",
    "Reduce injury restrictions if safe"
  ]
}
```

---

## Verification Checklist

After running tests, verify:

- [ ] Program was created in database (check `ai_programs` table)
- [ ] Workouts were created (check `ai_workouts` table)
- [ ] Exercises were created (check `ai_workout_exercises` table)
- [ ] Generation was logged (check `ai_generations` table)
- [ ] Revision was created (check `ai_program_revisions` table)
- [ ] Cost was reasonable (~$0.10-0.20 per program)
- [ ] Latency was acceptable (3-15 seconds)

---

## Query Database to Verify

### Check created programs

```sql
SELECT id, program_name, total_weeks, sessions_per_week, created_at
FROM ai_programs
ORDER BY created_at DESC
LIMIT 5;
```

### Check workouts for a program

```sql
SELECT id, week_number, day_number, workout_name
FROM ai_workouts
WHERE program_id = 'YOUR_PROGRAM_ID'
ORDER BY week_number, day_number;
```

### Check exercises for a workout

```sql
SELECT
  awe.exercise_order,
  e.name,
  awe.sets,
  awe.reps_target,
  awe.target_rpe,
  awe.tempo
FROM ai_workout_exercises awe
JOIN ta_exercise_library_original e ON e.id = awe.exercise_id
WHERE awe.workout_id = 'YOUR_WORKOUT_ID'
ORDER BY awe.exercise_order;
```

### Check generation costs

```sql
SELECT
  model_name,
  input_tokens,
  output_tokens,
  total_cost_usd,
  latency_ms,
  created_at
FROM ai_generations
ORDER BY created_at DESC
LIMIT 10;
```

---

## Manual cURL Test

If you prefer to test manually:

```bash
curl -X POST http://localhost:3000/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "test-trainer-123",
    "program_name": "Manual Test Program",
    "total_weeks": 4,
    "sessions_per_week": 3,
    "session_duration_minutes": 45,
    "primary_goal": "muscle_gain",
    "experience_level": "beginner",
    "available_equipment": ["dumbbells", "bench"],
    "injuries": []
  }' | jq '.'
```

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY environment variable is not set"

**Fix:**
Ensure `.env` file has:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Restart the dev server after adding it.

### Issue: "Failed to fetch exercises"

**Fix:**
Ensure Supabase credentials are correct in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Issue: "Cannot find module @/lib/..."

**Fix:**
This is expected in standalone TypeScript compilation. Next.js handles path aliases.
Just restart the dev server.

### Issue: Very slow response (>30 seconds)

**Possible causes:**
- Claude API is slow (rare)
- Large program (12+ weeks, 6+ days/week)
- Many exercises to filter

**Normal:**
- 4-week program: 5-10 seconds
- 12-week program: 10-20 seconds

### Issue: High cost (>$0.50 per program)

**Check:**
- Program length (12+ weeks = more tokens)
- Exercise library size (shown in prompt)
- Output token count (very detailed programs)

**Normal costs:**
- 4-week program: $0.08-0.15
- 8-week program: $0.12-0.20
- 12-week program: $0.15-0.30

---

## Next Steps After Successful Testing

Once all tests pass:

1. ✅ Mark Phase 4 as tested and verified
2. ✅ Proceed to Phase 5 (UI implementation)
3. ✅ Build AI program generator wizard
4. ✅ Build program viewer interface

---

## Expected Test Output

When you run `./scripts/test-api-endpoint.sh`, you should see:

```
🧪 Testing AI Program Generation API
════════════════════════════════════════════════════════════

📡 Checking if Next.js dev server is running...
✅ Server is running

════════════════════════════════════════════════════════════
🧪 Test 1: Generate Program (Manual Mode - No Client Profile)
════════════════════════════════════════════════════════════

📝 Sending request with manual parameters...

[... AI generation console logs ...]

✅ Test 1 PASSED: Program generated successfully!

📊 Generation Metrics:
   Program ID: abc-123-def-456
   Workouts: 12
   Exercises: 48
   Cost: $0.1234
   Latency: 8543ms

[... Test 2 and 3 ...]

════════════════════════════════════════════════════════════
📊 FINAL TEST SUMMARY
════════════════════════════════════════════════════════════

Test Results:
  Test 1 (4-week program): ✅ PASSED
  Test 2 (12-week program): ✅ PASSED
  Test 3 (error handling): ✅ PASSED

💰 Total Cost:
  $0.3456 (2 programs generated)

✅ API endpoint testing complete!
```

---

**Ready to test! Restart the dev server and run the tests.** 🚀
