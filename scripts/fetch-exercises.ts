#!/usr/bin/env tsx

/**
 * Fetch all exercise folders from Supabase storage
 * and generate exercise data for import
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scpfuwijsbjxuhfwoogg.supabase.co'
// Try service role key first (has full access), fall back to publishable key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
                     'sb_publishable_zRh2RllfOSLBQiPAiCeyIg_tbtSQIRQ'

const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log(`🔑 Using ${usingServiceRole ? 'SERVICE ROLE' : 'PUBLISHABLE'} key\n`)

// Category keywords for auto-detection
const categoryKeywords: Record<string, string[]> = {
  cardio: ['treadmill', 'bike', 'rowing', 'run', 'jog', 'burpee', 'jump', 'cardio'],
  chest: ['bench-press', 'chest-press', 'push-up', 'pushup', 'fly', 'chest', 'pec'],
  back: ['pull-up', 'pullup', 'row', 'lat-pulldown', 'back', 'deadlift'],
  shoulders: ['shoulder-press', 'military-press', 'lateral-raise', 'shoulder', 'overhead-press'],
  biceps: ['curl', 'bicep', 'biceps'],
  triceps: ['tricep', 'triceps', 'dip', 'extension'],
  legs: ['squat', 'lunge', 'leg-press', 'leg-curl', 'leg-extension', 'calf', 'quad', 'hamstring'],
  core: ['plank', 'crunch', 'sit-up', 'ab', 'core', 'oblique'],
  stretch: ['stretch', 'yoga', 'mobility']
}

// Equipment keywords
const equipmentKeywords: Record<string, string> = {
  'kettlebell': 'Kettlebell',
  'dumbbell': 'Dumbbell',
  'barbell': 'Barbell',
  'cable': 'Cable Machine',
  'machine': 'Machine',
  'bodyweight': 'Bodyweight',
  'band': 'Resistance Band',
  'ball': 'Exercise Ball',
  'bench': 'Bench',
  'treadmill': 'Treadmill',
  'bike': 'Bike',
  'rowing': 'Rowing Machine'
}

/**
 * Convert kebab-case to Title Case
 * Example: 'one-arm-kettlebell-military-press' -> 'One Arm Kettlebell Military Press'
 */
function kebabToTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Detect category from exercise name
 */
function detectCategory(folderName: string): string {
  const lowerName = folderName.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category
    }
  }

  return 'core' // Default category
}

/**
 * Detect equipment from exercise name
 */
function detectEquipment(folderName: string): string | undefined {
  const lowerName = folderName.toLowerCase()

  for (const [keyword, equipment] of Object.entries(equipmentKeywords)) {
    if (lowerName.includes(keyword)) {
      return equipment
    }
  }

  return undefined
}

/**
 * Generate exercise ID from folder name
 */
function generateExerciseId(folderName: string, category: string): string {
  // Create a short unique ID from the folder name
  const shortName = folderName
    .replace(/[^a-z0-9-]/g, '')
    .split('-')
    .slice(0, 3) // Take first 3 words
    .join('_')

  return `ex_${category}_${shortName}`
}

/**
 * Main function to fetch exercises
 */
async function fetchExercises() {
  console.log('🔍 Fetching exercise folders from Supabase...\n')

  try {
    // List all folders in exercise-images bucket
    const { data, error } = await supabase.storage
      .from('exercise-images')
      .list('', {
        limit: 1000,
        offset: 0,
      })

    if (error) {
      console.error('❌ Error fetching from Supabase:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return
    }

    console.log('📦 Raw data received:', JSON.stringify(data, null, 2))

    if (!data || data.length === 0) {
      console.log('⚠️  No exercise folders found')
      console.log('💡 This might mean:')
      console.log('   - The bucket is empty')
      console.log('   - The API key doesn\'t have list permissions')
      console.log('   - The bucket name is incorrect')
      return
    }

    console.log(`✅ Found ${data.length} items in storage\n`)

    // Filter for folders only (folders have no file extension)
    const folders = data.filter(item => !item.name.includes('.'))

    console.log(`📁 Found ${folders.length} exercise folders\n`)

    // Generate exercise data
    const exercises = folders.map((folder, index) => {
      const folderName = folder.name
      const category = detectCategory(folderName)
      const equipment = detectEquipment(folderName)
      const displayName = kebabToTitleCase(folderName)
      const exerciseId = generateExerciseId(folderName, category)

      console.log(`${index + 1}. ${displayName} (${category})${equipment ? ` - ${equipment}` : ''}`)

      return {
        id: exerciseId,
        exerciseId: folderName, // Supabase folder name
        name: displayName,
        category: category,
        equipment: equipment,
        level: 'intermediate' as const,
        instructions: [
          'Start in proper position',
          'Perform the exercise with control',
          'Maintain proper form throughout',
          'Return to starting position'
        ],
        modifications: [],
        commonMistakes: []
      }
    })

    // Generate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    exercises.forEach(ex => {
      categoryBreakdown[ex.category] = (categoryBreakdown[ex.category] || 0) + 1
    })

    console.log('\n📊 Category Breakdown:')
    Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} exercises`)
      })

    // Save to JSON file
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const outputPath = path.join(dataDir, 'generated-exercises.json')
    fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2))

    console.log(`\n✅ Generated ${exercises.length} exercises`)
    console.log(`📝 Saved to: ${outputPath}`)

    // Also save a summary
    const summaryPath = path.join(dataDir, 'exercise-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify({
      totalExercises: exercises.length,
      categoryBreakdown,
      generatedAt: new Date().toISOString(),
      supabaseUrl,
      folderNames: folders.map(f => f.name)
    }, null, 2))

    console.log(`📊 Summary saved to: ${summaryPath}\n`)

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
fetchExercises()
