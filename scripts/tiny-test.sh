#!/bin/bash

echo "🧪 Tiny Program Test (2 weeks, 2 days/week)"
echo ""

curl -s -X POST http://localhost:3001/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{
    "trainer_id": "0b60b46f-7d2d-4119-bb55-5415e08afd04",
    "program_name": "Tiny Test Program",
    "total_weeks": 2,
    "sessions_per_week": 2,
    "session_duration_minutes": 30,
    "primary_goal": "muscle_gain",
    "experience_level": "beginner",
    "available_equipment": ["dumbbells"],
    "injuries": []
  }' | jq '.'

echo ""
