import fs from 'fs';
import path from 'path';

// Complete data for exercises used in templates
const exerciseSampleData = {
  'ex_cardio_treadmill': {
    primaryMuscles: 'Quadriceps, Hamstrings, Calves',
    secondaryMuscles: 'Hip Flexors, Core',
    modifications: [
      'Reduce speed for beginners',
      'Increase incline for more challenge',
      'Use interval training for advanced',
    ],
    commonMistakes: [
      'Holding onto handrails constantly',
      'Overstriding or landing too heavily',
      'Poor posture with forward lean',
    ],
  },
  'ex_chest_db_press': {
    primaryMuscles: 'Pectoralis Major (Upper and Lower)',
    secondaryMuscles: 'Anterior Deltoids, Triceps',
    modifications: [
      'Use lighter dumbbells for beginners',
      'Perform on incline bench for upper chest focus',
      'Single arm variation for core engagement',
    ],
    commonMistakes: [
      'Arching back excessively',
      'Not bringing dumbbells to full depth',
      'Flaring elbows out too wide',
    ],
  },
  'ex_back_bent_row': {
    primaryMuscles: 'Latissimus Dorsi, Rhomboids',
    secondaryMuscles: 'Trapezius, Biceps, Rear Deltoids',
    modifications: [
      'Use resistance bands instead of weights',
      'Single arm variation for better focus',
      'Seated cable row as alternative',
    ],
    commonMistakes: [
      'Rounding the back',
      'Using momentum instead of controlled movement',
      'Not pulling elbows back far enough',
    ],
  },
  'ex_legs_goblet_squat': {
    primaryMuscles: 'Quadriceps, Glutes',
    secondaryMuscles: 'Hamstrings, Core, Adductors',
    modifications: [
      'Use lighter weight or bodyweight only',
      'Reduce depth if mobility limited',
      'Use box squat for beginners',
    ],
    commonMistakes: [
      'Knees caving inward',
      'Not reaching proper depth',
      'Heels lifting off ground',
    ],
  },
  'ex_core_plank': {
    primaryMuscles: 'Rectus Abdominis, Transverse Abdominis',
    secondaryMuscles: 'Obliques, Lower Back, Shoulders',
    modifications: [
      'Perform on knees for beginners',
      'Add leg raise for advanced',
      'Side plank variation for obliques',
    ],
    commonMistakes: [
      'Sagging hips',
      'Raising hips too high',
      'Not engaging core properly',
    ],
  },
  'ex_cardio_bike': {
    primaryMuscles: 'Quadriceps, Hamstrings',
    secondaryMuscles: 'Calves, Glutes',
    modifications: [
      'Adjust seat height for comfort',
      'Lower resistance for beginners',
      'Increase RPM for cardio focus',
    ],
    commonMistakes: [
      'Incorrect seat height',
      'Too much upper body tension',
      'Pedaling with toes instead of full foot',
    ],
  },
  'ex_chest_pushup': {
    primaryMuscles: 'Pectoralis Major, Triceps',
    secondaryMuscles: 'Anterior Deltoids, Core',
    modifications: [
      'Perform on knees for beginners',
      'Incline pushup on bench',
      'Decline pushup for advanced',
    ],
    commonMistakes: [
      'Sagging hips or arching back',
      'Not going deep enough',
      'Flaring elbows out excessively',
    ],
  },
  'ex_back_lat_pulldown': {
    primaryMuscles: 'Latissimus Dorsi',
    secondaryMuscles: 'Biceps, Rhomboids, Rear Deltoids',
    modifications: [
      'Use assisted pulldown machine',
      'Vary grip width for different emphasis',
      'Single arm variation for imbalances',
    ],
    commonMistakes: [
      'Leaning back too much',
      'Not pulling bar to chest',
      'Using momentum instead of control',
    ],
  },
  'ex_legs_lunges': {
    primaryMuscles: 'Quadriceps, Glutes',
    secondaryMuscles: 'Hamstrings, Calves, Core',
    modifications: [
      'Reverse lunge for knee comfort',
      'Stationary lunges for balance',
      'Add dumbbells for progression',
    ],
    commonMistakes: [
      'Knee going past toes',
      'Not stepping far enough forward',
      'Leaning torso too far forward',
    ],
  },
  'ex_core_russian_twist': {
    primaryMuscles: 'Obliques, Rectus Abdominis',
    secondaryMuscles: 'Hip Flexors, Lower Back',
    modifications: [
      'Keep feet on ground for stability',
      'Use lighter weight or no weight',
      'Reduce rotation range',
    ],
    commonMistakes: [
      'Moving arms instead of torso',
      'Rounding back excessively',
      'Not engaging core throughout',
    ],
  },
  'ex_cardio_rower': {
    primaryMuscles: 'Quadriceps, Hamstrings, Lats',
    secondaryMuscles: 'Core, Glutes, Biceps',
    modifications: [
      'Reduce resistance for cardio focus',
      'Shorten stroke for beginners',
      'Increase pace for advanced',
    ],
    commonMistakes: [
      'Pulling with arms first',
      'Rounding back during drive',
      'Not using legs enough',
    ],
  },
  'ex_shoulders_db_press': {
    primaryMuscles: 'Anterior Deltoids, Medial Deltoids',
    secondaryMuscles: 'Triceps, Upper Trapezius',
    modifications: [
      'Seated for better stability',
      'Alternating arms for balance',
      'Use resistance bands',
    ],
    commonMistakes: [
      'Arching back excessively',
      'Not pressing to full extension',
      'Flaring elbows out too wide',
    ],
  },
  'ex_biceps_curl': {
    primaryMuscles: 'Biceps Brachii',
    secondaryMuscles: 'Brachialis, Brachioradialis',
    modifications: [
      'Hammer curl variation',
      'Cable curl for constant tension',
      'Concentration curl for isolation',
    ],
    commonMistakes: [
      'Swinging weight with momentum',
      'Not controlling the eccentric',
      'Moving elbows forward',
    ],
  },
  'ex_triceps_extension': {
    primaryMuscles: 'Triceps Brachii',
    secondaryMuscles: 'Anconeus',
    modifications: [
      'Overhead extension variation',
      'Single arm for focus',
      'Cable pushdown alternative',
    ],
    commonMistakes: [
      'Flaring elbows out',
      'Not achieving full extension',
      'Using too much weight',
    ],
  },
  'ex_stretch_hamstring': {
    primaryMuscles: 'Hamstrings',
    secondaryMuscles: 'Gastrocnemius, Lower Back',
    modifications: [
      'Use strap for assistance',
      'Bend knee slightly if tight',
      'Seated variation',
    ],
    commonMistakes: [
      'Bouncing during stretch',
      'Rounding back',
      'Holding breath',
    ],
  },
  'ex_stretch_quad': {
    primaryMuscles: 'Quadriceps',
    secondaryMuscles: 'Hip Flexors',
    modifications: [
      'Use wall for balance',
      'Lying variation',
      'Reduce range if tight',
    ],
    commonMistakes: [
      'Arching back',
      'Pulling foot too hard',
      'Not keeping knees together',
    ],
  },
  'ex_cardio_burpees': {
    primaryMuscles: 'Full Body (Quads, Chest, Shoulders)',
    secondaryMuscles: 'Core, Triceps, Glutes',
    modifications: [
      'Step back instead of jump',
      'Remove pushup portion',
      'No jump at top',
    ],
    commonMistakes: [
      'Landing too heavily',
      'Poor pushup form',
      'Not fully extending at top',
    ],
  },
  'ex_shoulders_lateral_raise': {
    primaryMuscles: 'Medial Deltoids',
    secondaryMuscles: 'Trapezius, Supraspinatus',
    modifications: [
      'Single arm for focus',
      'Cable lateral raise',
      'Lighter weight with higher reps',
    ],
    commonMistakes: [
      'Using too much weight',
      'Raising arms too high',
      'Swinging with momentum',
    ],
  },
};

// Read the current exercises file
const exercisesPath = path.join(process.cwd(), 'data', 'generated-exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

// Update exercises with complete data
let updatedCount = 0;
exercises.forEach((exercise: any) => {
  if (exerciseSampleData[exercise.id as keyof typeof exerciseSampleData]) {
    const sampleData = exerciseSampleData[exercise.id as keyof typeof exerciseSampleData];
    exercise.primaryMuscles = sampleData.primaryMuscles;
    exercise.secondaryMuscles = sampleData.secondaryMuscles;
    exercise.modifications = sampleData.modifications;
    exercise.commonMistakes = sampleData.commonMistakes;
    // Keep existing instructions if they're good, otherwise update
    if (exercise.instructions && exercise.instructions.length > 0 && !exercise.instructions[0].includes('Start in proper position')) {
      // Instructions are good, keep them
    } else {
      // Generate better instructions based on exercise name
      exercise.instructions = [
        'Set up in the starting position with proper form',
        'Engage the target muscles and begin the movement',
        'Control the movement through the full range of motion',
        'Return to starting position with control',
      ];
    }
    updatedCount++;
  }
});

// Write updated exercises back to file
fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2));

console.log(`✅ Successfully updated ${updatedCount} exercises with complete data`);
console.log('Updated exercises:');
Object.keys(exerciseSampleData).forEach(id => {
  const exercise = exercises.find((ex: any) => ex.id === id);
  if (exercise) {
    console.log(`  - ${exercise.name} (${exercise.category})`);
  }
});
