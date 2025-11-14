#!/bin/bash

echo "🔍 Pre-Test Checklist"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check 1: API route file exists
echo "1️⃣  Checking API route file..."
if [ -f "app/api/ai/generate-program/route.ts" ]; then
    echo "   ✅ route.ts exists"
    FILE_SIZE=$(wc -l < app/api/ai/generate-program/route.ts)
    echo "   📄 File size: $FILE_SIZE lines"
else
    echo "   ❌ route.ts NOT FOUND"
    exit 1
fi

echo ""

# Check 2: Environment variables
echo "2️⃣  Checking environment variables..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"

    if grep -q "ANTHROPIC_API_KEY" .env; then
        echo "   ✅ ANTHROPIC_API_KEY is set"
    else
        echo "   ❌ ANTHROPIC_API_KEY not found in .env"
    fi

    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
        echo "   ✅ SUPABASE_URL is set"
    else
        echo "   ❌ SUPABASE_URL not found in .env"
    fi
else
    echo "   ❌ .env file NOT FOUND"
    exit 1
fi

echo ""

# Check 3: Required dependencies
echo "3️⃣  Checking dependencies..."
if [ -d "node_modules/@anthropic-ai" ]; then
    echo "   ✅ @anthropic-ai/sdk installed"
else
    echo "   ❌ @anthropic-ai/sdk NOT installed"
    echo "   Run: npm install @anthropic-ai/sdk"
fi

echo ""

# Check 4: Server status
echo "4️⃣  Checking Next.js dev server..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "   ✅ Server is running on port 3001"
elif curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Server is running on port 3000"
else
    echo "   ❌ Server is NOT running"
    echo "   Start with: npm run dev"
    exit 1
fi

echo ""

# Check 5: Test route accessibility
echo "5️⃣  Testing route accessibility..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/ai/generate-program \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Route is accessible (HTTP $RESPONSE)"
    echo "   📝 This means the route exists and is responding"
else
    echo "   ❌ Route returned HTTP $RESPONSE"
    if [ "$RESPONSE" = "404" ]; then
        echo ""
        echo "   💡 Route not found. This usually means:"
        echo "      1. Next.js dev server needs to be restarted"
        echo "      2. The route file has a syntax error"
        echo ""
        echo "   Try:"
        echo "      1. Stop the dev server (Ctrl+C)"
        echo "      2. Run: npm run dev"
        echo "      3. Wait for compilation to complete"
        echo "      4. Run this test again"
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

if [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ]; then
    echo "✅ All checks passed! Ready to test."
    echo ""
    echo "Run the test with:"
    echo "  ./scripts/simple-test.sh"
    exit 0
else
    echo "⚠️  Some checks failed. Please fix the issues above."
    exit 1
fi
