// Test script to verify Supabase image fetching
// Run with: node test-supabase-images.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://scpfuwijsbjxuhfwoogg.supabase.co'
const supabaseKey = 'sb_publishable_zRh2RllfOSLBQiPAiCeyIg_tbtSQIRQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample exercises to test
const testExercises = [
  '3-4-sit-up',
  '90-90-hamstring',
  'ab-crunch-machine',
  'air-bike',
  'barbell-curl',
]

async function testImageFetching() {
  console.log('🧪 Testing Supabase image fetching...\n')

  for (const exerciseId of testExercises) {
    console.log(`Testing: ${exerciseId}`)

    // Get public URLs
    const startImage = supabase.storage
      .from('exercise-images')
      .getPublicUrl(`${exerciseId}/start.webp`)

    const endImage = supabase.storage
      .from('exercise-images')
      .getPublicUrl(`${exerciseId}/end.webp`)

    console.log(`  Start: ${startImage.data.publicUrl}`)
    console.log(`  End: ${endImage.data.publicUrl}`)

    // Check if files exist
    try {
      const { data, error } = await supabase.storage
        .from('exercise-images')
        .list(exerciseId)

      if (error) {
        console.log(`  ❌ Error listing files: ${error.message}`)
      } else if (data && data.length > 0) {
        console.log(`  ✅ Found ${data.length} files:`, data.map(f => f.name).join(', '))
      } else {
        console.log(`  ⚠️  No files found in folder`)
      }
    } catch (err) {
      console.log(`  ❌ Exception: ${err.message}`)
    }

    console.log('')
  }

  // List all exercise folders
  console.log('📁 Listing all exercise folders...\n')
  try {
    const { data, error } = await supabase.storage
      .from('exercise-images')
      .list('', { limit: 50 })

    if (error) {
      console.log(`❌ Error: ${error.message}`)
    } else {
      console.log(`✅ Found ${data.length} exercise folders:`)
      data.slice(0, 20).forEach(folder => {
        console.log(`  - ${folder.name}`)
      })
      if (data.length > 20) {
        console.log(`  ... and ${data.length - 20} more`)
      }
    }
  } catch (err) {
    console.log(`❌ Exception: ${err.message}`)
  }
}

testImageFetching().catch(console.error)
