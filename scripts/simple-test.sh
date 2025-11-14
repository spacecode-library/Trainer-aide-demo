#!/bin/bash

echo "🧪 Simple AI Generation Test"
echo ""
echo "Testing with 4-week program using Claude Sonnet 4.5..."
echo ""

UUID=$(uuidgen | tr '[:upper:]' '[:lower:]')

curl -X POST http://localhost:3001/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d "{
    \"trainer_id\": \"$UUID\",
    \"program_name\": \"2-Week Beginner Program\",
    \"total_weeks\": 2,
    \"sessions_per_week\": 3,
    \"session_duration_minutes\": 45,
    \"primary_goal\": \"muscle_gain\",
    \"experience_level\": \"beginner\",
    \"available_equipment\": [\"dumbbells\", \"bench\"],
    \"injuries\": []
  }" | jq '.'

echo ""
