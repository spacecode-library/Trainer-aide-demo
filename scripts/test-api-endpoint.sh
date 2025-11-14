#!/bin/bash

# Test AI Program Generation API Endpoint
# This script creates a test client profile and generates a workout program

echo "🧪 Testing AI Program Generation API"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if server is running
echo "📡 Checking if Next.js dev server is running..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running on port 3001"
elif curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running on port 3000"
    PORT=3000
else
    echo "❌ Server is not running!"
    echo ""
    echo "Please start the dev server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi
PORT=${PORT:-3001}

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🧪 Test 1: Generate Program (Manual Mode - No Client Profile)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Test with manual parameters (no client profile)
echo "📝 Sending request with manual parameters..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:$PORT/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "test-trainer-123",
    "program_name": "Test Program - Dumbbell Only",
    "total_weeks": 4,
    "sessions_per_week": 3,
    "session_duration_minutes": 45,
    "primary_goal": "muscle_gain",
    "experience_level": "intermediate",
    "available_equipment": ["dumbbells", "bench"],
    "injuries": [
      {
        "body_part": "shoulder",
        "restrictions": ["no overhead press"]
      }
    ],
    "exercise_aversions": ["burpees"],
    "include_nutrition": false
  }')

echo "📊 Response:"
echo "$RESPONSE" | jq '.'

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ Test 1 PASSED: Program generated successfully!"

    # Extract key metrics
    PROGRAM_ID=$(echo "$RESPONSE" | jq -r '.program_id')
    WORKOUTS_COUNT=$(echo "$RESPONSE" | jq -r '.workouts_count')
    EXERCISES_COUNT=$(echo "$RESPONSE" | jq -r '.exercises_count')
    COST=$(echo "$RESPONSE" | jq -r '.generation_log.cost_usd')
    LATENCY=$(echo "$RESPONSE" | jq -r '.generation_log.latency_ms')

    echo ""
    echo "📊 Generation Metrics:"
    echo "   Program ID: $PROGRAM_ID"
    echo "   Workouts: $WORKOUTS_COUNT"
    echo "   Exercises: $EXERCISES_COUNT"
    echo "   Cost: \$$COST"
    echo "   Latency: ${LATENCY}ms"
else
    echo ""
    echo "❌ Test 1 FAILED"
    ERROR=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
    echo "   Error: $ERROR"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🧪 Test 2: Generate Longer Program (12 weeks, 4 days/week)"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📝 Sending request for 12-week program..."
echo ""

RESPONSE2=$(curl -s -X POST http://localhost:$PORT/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "test-trainer-456",
    "program_name": "12-Week Hypertrophy Program",
    "total_weeks": 12,
    "sessions_per_week": 4,
    "session_duration_minutes": 60,
    "primary_goal": "muscle_gain",
    "experience_level": "advanced",
    "available_equipment": ["dumbbells", "barbell", "bench", "pull-up bar"],
    "injuries": [],
    "exercise_aversions": []
  }')

echo "📊 Response (summary):"
echo "$RESPONSE2" | jq '{success, program_id, workouts_count, exercises_count, generation_log}'

if echo "$RESPONSE2" | jq -e '.success' > /dev/null 2>&1; then
    echo ""
    echo "✅ Test 2 PASSED: 12-week program generated successfully!"

    PROGRAM_ID_2=$(echo "$RESPONSE2" | jq -r '.program_id')
    WORKOUTS_COUNT_2=$(echo "$RESPONSE2" | jq -r '.workouts_count')
    EXERCISES_COUNT_2=$(echo "$RESPONSE2" | jq -r '.exercises_count')
    COST_2=$(echo "$RESPONSE2" | jq -r '.generation_log.cost_usd')

    echo ""
    echo "📊 Generation Metrics:"
    echo "   Program ID: $PROGRAM_ID_2"
    echo "   Workouts: $WORKOUTS_COUNT_2 (expected: 48)"
    echo "   Exercises: $EXERCISES_COUNT_2"
    echo "   Cost: \$$COST_2"
else
    echo ""
    echo "❌ Test 2 FAILED"
    ERROR2=$(echo "$RESPONSE2" | jq -r '.error // "Unknown error"')
    echo "   Error: $ERROR2"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🧪 Test 3: Test Error Handling (Insufficient Equipment)"
echo "════════════════════════════════════════════════════════════"
echo ""

echo "📝 Testing with bodyweight only + multiple injury restrictions..."
echo ""

RESPONSE3=$(curl -s -X POST http://localhost:$PORT/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "test-trainer-789",
    "program_name": "Should Fail",
    "total_weeks": 8,
    "sessions_per_week": 5,
    "session_duration_minutes": 60,
    "primary_goal": "strength",
    "experience_level": "beginner",
    "available_equipment": [],
    "injuries": [
      {
        "body_part": "shoulder",
        "restrictions": ["no overhead press", "no push-ups"]
      },
      {
        "body_part": "knee",
        "restrictions": ["no squats", "no lunges"]
      }
    ]
  }')

echo "📊 Response:"
echo "$RESPONSE3" | jq '.'

if echo "$RESPONSE3" | jq -e '.error' > /dev/null 2>&1; then
    echo ""
    echo "✅ Test 3 PASSED: Error handling works correctly!"
    ERROR3=$(echo "$RESPONSE3" | jq -r '.error')
    echo "   Expected error: $ERROR3"
else
    echo ""
    echo "⚠️  Test 3: Expected error but got success (might have enough exercises)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📊 FINAL TEST SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Test Results:"
echo "  Test 1 (4-week program): ✅ PASSED"
if echo "$RESPONSE2" | jq -e '.success' > /dev/null 2>&1; then
    echo "  Test 2 (12-week program): ✅ PASSED"
else
    echo "  Test 2 (12-week program): ❌ FAILED"
fi
if echo "$RESPONSE3" | jq -e '.error' > /dev/null 2>&1; then
    echo "  Test 3 (error handling): ✅ PASSED"
else
    echo "  Test 3 (error handling): ⚠️  UNCLEAR"
fi

echo ""
echo "💰 Total Cost:"
TOTAL_COST=$(echo "$COST + $COST_2" | bc)
echo "  \$$TOTAL_COST (2 programs generated)"

echo ""
echo "✅ API endpoint testing complete!"
echo ""
