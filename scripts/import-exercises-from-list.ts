#!/usr/bin/env tsx

/**
 * Import exercises from a list of folder names
 * Useful when we can't list the Supabase bucket directly
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scpfuwijsbjxuhfwoogg.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_zRh2RllfOSLBQiPAiCeyIg_tbtSQIRQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Category keywords for auto-detection (12 categories)
const categoryKeywords: Record<string, string[]> = {
  cardio: ['treadmill', 'bike', 'rowing', 'run', 'jog', 'burpee', 'jump', 'cardio', 'sprint', 'walk', 'elliptical', 'stairmaster'],
  chest: ['bench-press', 'chest-press', 'push-up', 'pushup', 'fly', 'chest', 'pec', 'incline', 'decline'],
  back: ['pull-up', 'pullup', 'row', 'lat-pulldown', 'back', 'deadlift', 'chin-up', 'chinup', 'lat', 'shrug'],
  legs: ['squat', 'lunge', 'leg-press', 'leg-curl', 'leg-extension', 'calf', 'quad', 'hamstring', 'glute'],
  core: ['plank', 'crunch', 'sit-up', 'ab', 'core', 'oblique', 'twist', 'russian'],
  shoulders: ['shoulder-press', 'military-press', 'lateral-raise', 'shoulder', 'overhead-press', 'front-raise', 'deltoid'],
  biceps: ['curl', 'bicep', 'biceps'],
  triceps: ['tricep', 'triceps', 'dip', 'extension', 'pushdown', 'skullcrusher'],
  full_body: ['burpee', 'thruster', 'clean', 'snatch', 'turkish', 'atlas', 'farmer'],
  stretch: ['stretch', 'yoga', 'mobility'],
  forearms: ['wrist', 'forearm', 'grip', 'finger'],
  neck: ['neck']
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
  'rowing': 'Rowing Machine',
  'ez-bar': 'EZ Bar',
  'smith-machine': 'Smith Machine'
}

function kebabToTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function detectCategory(folderName: string): string {
  const lowerName = folderName.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category
    }
  }

  return 'core' // Default category
}

function detectEquipment(folderName: string): string | undefined {
  const lowerName = folderName.toLowerCase()

  for (const [keyword, equipment] of Object.entries(equipmentKeywords)) {
    if (lowerName.includes(keyword)) {
      return equipment
    }
  }

  return undefined
}

function generateExerciseId(folderName: string, category: string): string {
  const shortName = folderName
    .replace(/[^a-z0-9-]/g, '')
    .split('-')
    .slice(0, 3)
    .join('_')

  return `ex_${category}_${shortName}`
}

async function verifyImageExists(exerciseId: string): Promise<boolean> {
  const { data } = supabase.storage
    .from('exercise-images')
    .getPublicUrl(`${exerciseId}/start.webp`)

  try {
    const response = await fetch(data.publicUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function importFromList() {
  console.log('📋 Importing exercises from folder list...\n')

  // Check for input file
  const inputPath = path.join(process.cwd(), 'data', 'exercise-folder-names.txt')

  if (!fs.existsSync(inputPath)) {
    console.log('❌ File not found: data/exercise-folder-names.txt')
    console.log('\n💡 Please create this file with one exercise folder name per line.')
    console.log('   You can export this from Supabase Dashboard > Storage > exercise-images\n')
    return
  }

  // Read folder names
  const content = fs.readFileSync(inputPath, 'utf-8')
  const folderNames = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#')) // Skip empty lines and comments

  console.log(`📁 Found ${folderNames.length} folder names in file\n`)

  if (folderNames.length === 0) {
    console.log('⚠️  No folder names found in file')
    return
  }

  // Verify a few images exist (sample check)
  console.log('🔍 Verifying images exist (checking first 5)...')
  const sampleSize = Math.min(5, folderNames.length)
  for (let i = 0; i < sampleSize; i++) {
    const exists = await verifyImageExists(folderNames[i])
    console.log(`   ${exists ? '✅' : '❌'} ${folderNames[i]}`)
  }
  console.log()

  // Generate exercise data
  const exercises = folderNames.map((folderName, index) => {
    const category = detectCategory(folderName)
    const equipment = detectEquipment(folderName)
    const displayName = kebabToTitleCase(folderName)
    const exerciseId = generateExerciseId(folderName, category)

    if ((index + 1) % 100 === 0) {
      console.log(`   Processed ${index + 1}/${folderNames.length} exercises...`)
    }

    return {
      id: exerciseId,
      exerciseId: folderName,
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

  // Save to JSON
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const outputPath = path.join(dataDir, 'generated-exercises.json')
  fs.writeFileSync(outputPath, JSON.stringify(exercises, null, 2))

  console.log(`\n✅ Generated ${exercises.length} exercises`)
  console.log(`📝 Saved to: ${outputPath}`)

  // Save summary
  const summaryPath = path.join(dataDir, 'exercise-summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify({
    totalExercises: exercises.length,
    categoryBreakdown,
    generatedAt: new Date().toISOString(),
    supabaseUrl,
    sourceFile: 'exercise-folder-names.txt'
  }, null, 2))

  console.log(`📊 Summary saved to: ${summaryPath}\n`)

  console.log('✨ Next steps:')
  console.log('   1. Review the generated exercises in data/generated-exercises.json')
  console.log('   2. Add any name/category overrides to lib/exercise-name-mapping.ts')
  console.log('   3. Run: npm run import-exercises (to update mock data)\n')
}

importFromList()
