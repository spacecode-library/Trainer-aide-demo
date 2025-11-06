#!/usr/bin/env tsx

/**
 * Verify Supabase connection and bucket access
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scpfuwijsbjxuhfwoogg.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_zRh2RllfOSLBQiPAiCeyIg_tbtSQIRQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyConnection() {
  console.log('🔍 Verifying Supabase connection...\n')
  console.log(`URL: ${supabaseUrl}`)
  console.log(`Key: ${supabaseKey.substring(0, 20)}...\n`)

  // Try to get public URL for a known exercise
  const testExerciseId = 'one-arm-kettlebell-military-press-to-the-side'

  const { data } = supabase.storage
    .from('exercise-images')
    .getPublicUrl(`${testExerciseId}/end.webp`)

  console.log(`✅ Generated public URL for test exercise:`)
  console.log(`   ${data.publicUrl}\n`)

  // Try to fetch it to see if it exists
  try {
    const response = await fetch(data.publicUrl)
    if (response.ok) {
      console.log(`✅ Image exists and is accessible (${response.status} ${response.statusText})`)
      console.log(`   Content-Type: ${response.headers.get('content-type')}`)
      console.log(`   Content-Length: ${response.headers.get('content-length')} bytes\n`)
    } else {
      console.log(`❌ Image not found (${response.status} ${response.statusText})\n`)
    }
  } catch (error) {
    console.error(`❌ Error fetching image:`, error)
  }

  // Try to list bucket contents
  console.log('🔍 Attempting to list bucket contents...')
  const { data: listData, error: listError } = await supabase.storage
    .from('exercise-images')
    .list('', { limit: 10 })

  if (listError) {
    console.log(`❌ Cannot list bucket contents: ${listError.message}`)
    console.log(`💡 This is expected if the publishable key doesn't have list permissions\n`)
  } else if (listData && listData.length > 0) {
    console.log(`✅ Can list bucket contents! Found ${listData.length} items:`)
    listData.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.name}`)
    })
  } else {
    console.log(`⚠️  Bucket appears empty or listing not permitted\n`)
  }

  console.log('\n📝 NEXT STEPS:')
  console.log('   Since listing bucket contents requires elevated permissions,')
  console.log('   you have three options:\n')
  console.log('   1. Provide a SERVICE_ROLE key (has full access)')
  console.log('      Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key_here\n')
  console.log('   2. Manually export folder names from Supabase Dashboard')
  console.log('      Dashboard > Storage > exercise-images > Export list\n')
  console.log('   3. Provide a text file with all folder names (one per line)')
  console.log('      Create: data/exercise-folder-names.txt\n')
}

verifyConnection()
