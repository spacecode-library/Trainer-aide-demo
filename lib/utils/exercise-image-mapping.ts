/**
 * Exercise Image Mapping Utility
 * Maps exercise IDs to their Supabase folder names
 */

/**
 * Manual mapping for commonly used exercises
 * Maps exercise ID to Supabase folder name
 */
const MANUAL_EXERCISE_MAPPINGS: Record<string, string> = {
  // Cardio
  'ex_cardio_treadmill': 'treadmill',
  'ex_cardio_bike': 'stationary-bike',
  'ex_cardio_rower': 'rowing-stationary',
  'ex_cardio_burpees': 'burpees',
  'ex_cardio_air_bike': 'air-bike',

  // Chest
  'ex_chest_db_press': 'dumbbell-bench-press',
  'ex_chest_pushup': 'pushups',
  'ex_chest_alternate_incline_dumbbell': 'alternate-incline-dumbbell-curl',
  'ex_chest_back_flyes_with': 'back-flyes-with-bands',

  // Back
  'ex_back_bent_row': 'bent-over-barbell-row',
  'ex_back_lat_pulldown': 'wide-grip-lat-pulldown',
  'ex_back_alternating_kettlebell_row': 'alternating-kettlebell-row',
  'ex_back_alternating_renegade_row': 'alternating-renegade-row',
  'ex_back_band_assisted_pull': 'band-assisted-pull-up',

  // Legs
  'ex_legs_goblet_squat': 'goblet-squat',
  'ex_legs_lunges': 'walking-treadmill', // Could also be 'bodyweight-walking-lunge'
  'ex_legs_90_90_hamstring': '90-90-hamstring',
  'ex_legs_all_fours_quad': 'all-fours-quad-stretch',

  // Shoulders
  'ex_shoulders_db_press': 'dumbbell-shoulder-press',
  'ex_shoulders_lateral_raise': 'side-lateral-raise',
  'ex_shoulders_alternating_cable_shoulder': 'alternating-cable-shoulder-press',

  // Arms
  'ex_biceps_curl': 'dumbbell-bicep-curl',
  'ex_biceps_alternate_hammer_curl': 'alternate-hammer-curl',
  'ex_triceps_extension': 'lying-dumbbell-tricep-extension',

  // Core
  'ex_core_plank': 'plank',
  'ex_core_russian_twist': 'russian-twist',
  'ex_core_ab_roller': 'ab-roller',
  'ex_core_3_4_sit': '3-4-sit-up',
  'ex_core_barbell_ab_rollout': 'barbell-ab-rollout',
  'ex_core_arnold_dumbbell_press': 'arnold-dumbbell-press',
  'ex_core_alternate_heel_touchers': 'alternate-heel-touchers',
  'ex_core_alternating_deltoid_raise': 'alternating-deltoid-raise',
  'ex_core_alternating_floor_press': 'alternating-floor-press',
  'ex_core_alternating_hang_clean': 'alternating-hang-clean',
  'ex_core_alternating_kettlebell_press': 'alternating-kettlebell-press',
  'ex_core_ankle_circles': 'ankle-circles',
  'ex_core_ankle_on_the': 'ankle-on-the-knee',
  'ex_core_anterior_tibialis_s': 'anterior-tibialis-s-m-r',
  'ex_core_anti_gravity_press': 'anti-gravity-press',
  'ex_core_arm_circles': 'arm-circles',
  'ex_core_around_the_worlds': 'around-the-worlds',
  'ex_core_atlas_stones': 'atlas-stones',
  'ex_core_atlas_stone_trainer': 'atlas-stone-trainer',
  'ex_core_adductor': 'adductor',
  'ex_core_adductor_groin': 'adductor-groin',
  'ex_core_advanced_kettlebell_windmill': 'advanced-kettlebell-windmill',

  // Stretches
  'ex_stretch_hamstring': 'hamstring-stretch',
  'ex_stretch_quad': 'standing-quad-stretch', // or 'on-your-side-quad-stretch'

  // Cardio machines
  'ex_cardio_ab_crunch_machine': 'ab-crunch-machine',

  // Back exercises
  'ex_back_axle_deadlift': 'axle-deadlift',
};

/**
 * Calculate string similarity between two strings (0-1, where 1 is identical)
 * Uses Dice coefficient algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s1 = normalize(str1);
  const s2 = normalize(str2);

  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    bigrams1.set(bigram, count + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (s1.length + s2.length - 2);
}

/**
 * Find best matching folder name using fuzzy string matching
 */
function findBestMatch(exerciseId: string, exerciseName: string, availableFolders: string[]): string | null {
  const searchTerms = [
    exerciseId.replace('ex_', '').replace(/_/g, '-'),
    exerciseName.toLowerCase().replace(/\s+/g, '-'),
  ];

  let bestMatch: { folder: string; score: number } | null = null;

  for (const folder of availableFolders) {
    for (const term of searchTerms) {
      const score = calculateSimilarity(term, folder);
      if (score > 0.6 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { folder, score };
      }
    }
  }

  return bestMatch ? bestMatch.folder : null;
}

/**
 * Get Supabase folder name for an exercise
 * First checks manual mapping, then falls back to fuzzy matching
 */
export function getExerciseFolderName(
  exerciseId: string,
  exerciseName?: string,
  availableFolders?: string[]
): string {
  // Check manual mapping first
  if (MANUAL_EXERCISE_MAPPINGS[exerciseId]) {
    return MANUAL_EXERCISE_MAPPINGS[exerciseId];
  }

  // Fall back to fuzzy matching if available
  if (exerciseName && availableFolders && availableFolders.length > 0) {
    const match = findBestMatch(exerciseId, exerciseName, availableFolders);
    if (match) {
      console.log(`Fuzzy matched ${exerciseId} (${exerciseName}) → ${match}`);
      return match;
    }
  }

  // Last resort: use exerciseId as-is (remove ex_ prefix and convert to kebab-case)
  return exerciseId.replace('ex_', '').replace(/_/g, '-');
}

/**
 * Get all available Supabase folders
 * This is a list of all folder names the user provided
 */
export const AVAILABLE_SUPABASE_FOLDERS = [
  '3-4-sit-up',
  '90-90-hamstring',
  'ab-crunch-machine',
  'ab-roller',
  'adductor',
  'adductor-groin',
  'advanced-kettlebell-windmill',
  'air-bike',
  'all-fours-quad-stretch',
  'alternate-hammer-curl',
  'alternate-heel-touchers',
  'alternate-incline-dumbbell-curl',
  'alternate-leg-diagonal-bound',
  'alternating-cable-shoulder-press',
  'alternating-deltoid-raise',
  'alternating-floor-press',
  'alternating-hang-clean',
  'alternating-kettlebell-press',
  'alternating-kettlebell-row',
  'alternating-renegade-row',
  'ankle-circles',
  'ankle-on-the-knee',
  'anterior-tibialis-s-m-r',
  'anti-gravity-press',
  'arm-circles',
  'arnold-dumbbell-press',
  'around-the-worlds',
  'atlas-stones',
  'atlas-stone-trainer',
  'axle-deadlift',
  'back-flyes-with-bands',
  'band-assisted-pull-up',
  'barbell-ab-rollout',
  'barbell-bench-press-medium-grip',
  'bent-over-barbell-row',
  'burpees',
  'dumbbell-bench-press',
  'dumbbell-bicep-curl',
  'dumbbell-shoulder-press',
  'goblet-squat',
  'hamstring-stretch',
  'lying-dumbbell-tricep-extension',
  'plank',
  'pushups',
  'rowing-stationary',
  'russian-twist',
  'side-lateral-raise',
  'standing-quad-stretch',
  'treadmill',
  'wide-grip-lat-pulldown',
  // Add more as needed - this is just a subset for demonstration
];

/**
 * Batch get folder names for multiple exercises
 */
export function getExerciseFolderNames(exercises: Array<{ id: string; name: string }>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const exercise of exercises) {
    result[exercise.id] = getExerciseFolderName(
      exercise.id,
      exercise.name,
      AVAILABLE_SUPABASE_FOLDERS
    );
  }

  return result;
}
