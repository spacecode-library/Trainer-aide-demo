/**
 * Test script for exercise service
 *
 * Verifies that the Supabase exercise service is working correctly
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { loadExercises, searchExercises, getExerciseById } from '../lib/mock-data/exercises';
import {
  getAllExercises,
  getExercises,
  getAvailableEquipment,
  getAvailableCategories,
  getExerciseCount,
} from '../lib/services/exercise-service';
import {
  supabaseToFrontendExercise,
  getMovementPatternLabel,
  getPlaneOfMotionLabel,
  formatTempo,
} from '../lib/utils/exercise-adapter';

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  EXERCISE SERVICE TEST SCRIPT');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Test 1: Load all exercises
    console.log('📋 Test 1: Load All Exercises...\n');
    const allExercises = await loadExercises();
    console.log(`✅ Loaded ${allExercises.length} exercises`);
    console.log(`   First exercise: ${allExercises[0].name}`);
    console.log(`   Last exercise: ${allExercises[allExercises.length - 1].name}\n`);

    // Test 2: Get total count
    console.log('📊 Test 2: Get Exercise Count...\n');
    const totalCount = await getExerciseCount();
    console.log(`✅ Total exercises in database: ${totalCount}\n`);

    // Test 3: Filter by movement pattern
    console.log('🎯 Test 3: Filter by Movement Pattern (push_horizontal)...\n');
    const pushExercises = await getExercises({ movementPattern: 'push_horizontal', limit: 5 });
    console.log(`✅ Found ${pushExercises.length} push horizontal exercises:`);
    pushExercises.forEach((ex, i) => {
      console.log(`   ${i + 1}. ${ex.name} - ${ex.equipment || 'No equipment'}`);
    });
    console.log();

    // Test 4: Filter by bodyweight
    console.log('💪 Test 4: Filter Bodyweight Exercises...\n');
    const bodyweightCount = await getExerciseCount({ isBodyweight: true });
    const bodyweightExercises = await getExercises({ isBodyweight: true, limit: 5 });
    console.log(`✅ Found ${bodyweightCount} total bodyweight exercises. Showing first 5:`);
    bodyweightExercises.forEach((ex, i) => {
      console.log(`   ${i + 1}. ${ex.name} - Pattern: ${ex.movement_pattern || 'N/A'}`);
    });
    console.log();

    // Test 5: Search exercises
    console.log('🔍 Test 5: Search for "squat"...\n');
    const squatExercises = await searchExercises('squat', 5);
    console.log(`✅ Found ${squatExercises.length} exercises matching "squat":`);
    squatExercises.forEach((ex, i) => {
      console.log(`   ${i + 1}. ${ex.name}`);
    });
    console.log();

    // Test 6: Get available equipment types
    console.log('🏋️  Test 6: Get Available Equipment Types...\n');
    const equipment = await getAvailableEquipment();
    console.log(`✅ Found ${equipment.length} equipment types:`);
    equipment.slice(0, 10).forEach((eq) => {
      console.log(`   - ${eq}`);
    });
    if (equipment.length > 10) {
      console.log(`   ... and ${equipment.length - 10} more`);
    }
    console.log();

    // Test 7: Get available categories
    console.log('📂 Test 7: Get Available Categories...\n');
    const categories = await getAvailableCategories();
    console.log(`✅ Found ${categories.length} anatomical categories:`);
    categories.forEach((cat) => {
      console.log(`   - ${cat}`);
    });
    console.log();

    // Test 8: Get specific exercise and show S&C metadata
    console.log('🎯 Test 8: Get Exercise by ID with S&C Data...\n');
    const sampleExercise = allExercises[0];
    const detailedExercise = await getExerciseById(sampleExercise.id);

    if (detailedExercise) {
      console.log(`✅ Exercise: ${detailedExercise.name}`);
      console.log(`   Category: ${detailedExercise.anatomicalCategory || 'N/A'}`);
      console.log(`   Movement Pattern: ${getMovementPatternLabel(detailedExercise.movementPattern)}`);
      console.log(`   Plane of Motion: ${getPlaneOfMotionLabel(detailedExercise.planeOfMotion)}`);
      console.log(`   Unilateral: ${detailedExercise.isUnilateral ? 'Yes' : 'No'}`);
      console.log(`   Bodyweight: ${detailedExercise.isBodyweight ? 'Yes' : 'No'}`);
      console.log(`   Tempo: ${formatTempo(detailedExercise.tempoDefault)}`);
      console.log(`   Primary Muscles: ${detailedExercise.primaryMuscles || 'N/A'}`);
      console.log(`   Secondary Muscles: ${detailedExercise.secondaryMuscles || 'N/A'}`);

      if (detailedExercise.muscleIntensityJson) {
        console.log(`   Muscle Intensities:`);
        Object.entries(detailedExercise.muscleIntensityJson.primary).forEach(([muscle, intensity]) => {
          console.log(`      - ${muscle}: ${(intensity * 100).toFixed(0)}%`);
        });
      }
    }
    console.log();

    // Test 9: Filter by difficulty level
    console.log('📈 Test 9: Filter by Difficulty Level...\n');
    const beginnerCount = await getExerciseCount({ level: 'beginner' });
    const intermediateCount = await getExerciseCount({ level: 'intermediate' });
    const advancedCount = await getExerciseCount({ level: 'advanced' });
    console.log(`✅ Difficulty distribution:`);
    console.log(`   Beginner: ${beginnerCount}`);
    console.log(`   Intermediate: ${intermediateCount}`);
    console.log(`   Advanced: ${advancedCount}`);
    console.log();

    // Test 10: Filter by plane of motion
    console.log('🌐 Test 10: Filter by Plane of Motion...\n');
    const sagittalCount = await getExerciseCount({ planeOfMotion: 'sagittal' });
    const frontalCount = await getExerciseCount({ planeOfMotion: 'frontal' });
    const transverseCount = await getExerciseCount({ planeOfMotion: 'transverse' });
    console.log(`✅ Plane of motion distribution:`);
    console.log(`   Sagittal: ${sagittalCount}`);
    console.log(`   Frontal: ${frontalCount}`);
    console.log(`   Transverse: ${transverseCount}`);
    console.log();

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 Summary Statistics:');
    console.log(`   Total Exercises: ${totalCount}`);
    console.log(`   Bodyweight Exercises: ${bodyweightCount}`);
    console.log(`   Equipment Types: ${equipment.length}`);
    console.log(`   Anatomical Categories: ${categories.length}`);
    console.log(`   Difficulty Levels: Beginner (${beginnerCount}), Intermediate (${intermediateCount}), Advanced (${advancedCount})`);
    console.log();

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
