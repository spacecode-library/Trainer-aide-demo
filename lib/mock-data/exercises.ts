import { Exercise } from '@/lib/types';

export const MOCK_EXERCISES: Exercise[] = [
  // ========================================
  // CARDIO EXERCISES
  // ========================================
  {
    id: 'ex_cardio_treadmill',
    name: 'Treadmill',
    category: 'cardio',
    equipment: 'Treadmill',
    level: 'beginner',
    instructions: [
      'Step onto the treadmill and hold the handrails if needed',
      'Start at a slow pace (3-4 mph)',
      'Gradually increase speed based on intensity level',
      'Maintain good posture with shoulders back',
    ],
  },
  {
    id: 'ex_cardio_bike',
    name: 'Stationary Bike',
    category: 'cardio',
    equipment: 'Bike',
    level: 'beginner',
    instructions: [
      'Adjust seat height so knees are slightly bent at full extension',
      'Start with moderate resistance',
      'Maintain a steady cadence (60-80 RPM)',
      'Keep core engaged throughout',
    ],
  },
  {
    id: 'ex_cardio_rower',
    name: 'Rowing Machine',
    category: 'cardio',
    equipment: 'Rowing Machine',
    level: 'intermediate',
    instructions: [
      'Secure feet in straps',
      'Start with arms extended, knees bent',
      'Drive with legs first, then lean back, then pull arms',
      'Return in reverse: arms, torso, legs',
    ],
  },
  {
    id: 'ex_cardio_burpees',
    name: 'Burpees',
    category: 'cardio',
    equipment: 'None',
    level: 'intermediate',
    instructions: [
      'Start standing',
      'Drop to plank position',
      'Perform a push-up',
      'Jump feet to hands',
      'Explosive jump up with arms overhead',
    ],
  },

  // ========================================
  // CHEST EXERCISES
  // ========================================
  {
    id: 'ex_chest_db_press',
    name: 'Dumbbell Chest Press',
    category: 'chest',
    equipment: 'Dumbbells, Bench',
    level: 'beginner',
    instructions: [
      'Lie flat on bench with dumbbells at chest level',
      'Press dumbbells up until arms are extended',
      'Lower with control back to start position',
      'Keep core engaged and feet flat on floor',
    ],
  },
  {
    id: 'ex_chest_pushup',
    name: 'Push-Up',
    category: 'chest',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Start in high plank position',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep body in straight line throughout',
    ],
  },

  // ========================================
  // BACK EXERCISES
  // ========================================
  {
    id: 'ex_back_bent_row',
    name: 'Bent Over Row',
    category: 'back',
    equipment: 'Dumbbells or Barbell',
    level: 'intermediate',
    instructions: [
      'Hinge at hips with slight knee bend',
      'Pull weight towards torso',
      'Squeeze shoulder blades together at top',
      'Lower with control',
    ],
  },
  {
    id: 'ex_back_lat_pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    equipment: 'Cable Machine',
    level: 'beginner',
    instructions: [
      'Sit at machine with thighs secured',
      'Grip bar slightly wider than shoulder width',
      'Pull bar down to upper chest',
      'Return with control',
    ],
  },

  // ========================================
  // LEGS EXERCISES
  // ========================================
  {
    id: 'ex_legs_goblet_squat',
    name: 'Goblet Squat',
    category: 'legs',
    equipment: 'Dumbbell or Kettlebell',
    level: 'beginner',
    instructions: [
      'Hold weight at chest level',
      'Feet shoulder-width apart',
      'Lower into squat position',
      'Drive through heels to stand',
    ],
  },
  {
    id: 'ex_legs_lunges',
    name: 'Walking Lunges',
    category: 'legs',
    equipment: 'Dumbbells (optional)',
    level: 'beginner',
    instructions: [
      'Step forward with one leg',
      'Lower hips until both knees at 90 degrees',
      'Push through front heel to stand',
      'Alternate legs',
    ],
  },
  {
    id: 'ex_legs_leg_press',
    name: 'Leg Press',
    category: 'legs',
    equipment: 'Leg Press Machine',
    level: 'beginner',
    instructions: [
      'Sit on machine with back flat against pad',
      'Place feet shoulder-width apart on platform',
      'Lower weight by bending knees to 90 degrees',
      'Push through heels to extend legs',
    ],
  },

  // ========================================
  // CORE EXERCISES
  // ========================================
  {
    id: 'ex_core_plank',
    name: 'Plank',
    category: 'core',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Start in forearm plank position',
      'Keep body in straight line from head to heels',
      'Engage core and glutes',
      'Hold for specified duration',
    ],
  },
  {
    id: 'ex_core_russian_twist',
    name: 'Russian Twists',
    category: 'core',
    equipment: 'Medicine Ball (optional)',
    level: 'intermediate',
    instructions: [
      'Sit with knees bent, feet off floor',
      'Lean back slightly',
      'Rotate torso side to side',
      'Touch weight to floor on each side',
    ],
  },
  {
    id: 'ex_core_crunches',
    name: 'Crunches',
    category: 'core',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Lie on back with knees bent',
      'Place hands behind head',
      'Lift shoulders off ground',
      'Lower with control',
    ],
  },

  // ========================================
  // SHOULDERS EXERCISES
  // ========================================
  {
    id: 'ex_shoulders_db_press',
    name: 'Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand or sit with dumbbells at shoulder height',
      'Press weights overhead until arms extended',
      'Lower with control back to start',
      'Keep core engaged',
    ],
  },
  {
    id: 'ex_shoulders_lateral_raise',
    name: 'Lateral Raises',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides until parallel to floor',
      'Lower with control',
      'Keep slight bend in elbows',
    ],
  },

  // ========================================
  // BICEPS EXERCISES
  // ========================================
  {
    id: 'ex_biceps_curl',
    name: 'Bicep Curl',
    category: 'biceps',
    equipment: 'Dumbbells or Barbell',
    level: 'beginner',
    instructions: [
      'Stand with weights at sides',
      'Curl weights towards shoulders',
      'Keep elbows close to body',
      'Lower with control',
    ],
  },
  {
    id: 'ex_biceps_hammer_curl',
    name: 'Hammer Curl',
    category: 'biceps',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand with dumbbells at sides, palms facing in',
      'Curl weights towards shoulders',
      'Keep palms facing each other throughout',
      'Lower with control',
    ],
  },

  // ========================================
  // TRICEPS EXERCISES
  // ========================================
  {
    id: 'ex_triceps_extension',
    name: 'Overhead Tricep Extension',
    category: 'triceps',
    equipment: 'Dumbbell',
    level: 'beginner',
    instructions: [
      'Hold weight overhead with both hands',
      'Lower weight behind head by bending elbows',
      'Extend arms back to start position',
      'Keep elbows pointed forward',
    ],
  },
  {
    id: 'ex_triceps_dips',
    name: 'Tricep Dips',
    category: 'triceps',
    equipment: 'Bench or Dip Bar',
    level: 'intermediate',
    instructions: [
      'Place hands on bench or bars',
      'Lower body by bending elbows',
      'Keep elbows close to body',
      'Push back up to start',
    ],
  },

  // ========================================
  // STRETCH EXERCISES
  // ========================================
  {
    id: 'ex_stretch_hamstring',
    name: 'Seated Hamstring Stretch',
    category: 'stretch',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Sit with one leg extended, one bent',
      'Reach towards toes of extended leg',
      'Hold stretch for 20-30 seconds',
      'Switch legs and repeat',
    ],
  },
  {
    id: 'ex_stretch_quad',
    name: 'Standing Quad Stretch',
    category: 'stretch',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Stand on one leg',
      'Pull opposite foot towards glutes',
      'Hold for 20-30 seconds',
      'Switch legs',
    ],
  },
];

// Helper function to get exercises by category
export function getExercisesByCategory(category: string): Exercise[] {
  return MOCK_EXERCISES.filter(ex => ex.category === category);
}

// Helper function to get exercise by ID
export function getExerciseById(id: string): Exercise | undefined {
  return MOCK_EXERCISES.find(ex => ex.id === id);
}
