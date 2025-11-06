import fs from 'fs';
import path from 'path';

// Read the current exercises file
const exercisesPath = path.join(process.cwd(), 'data', 'generated-exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

// Exercises needed for templates
const newExercises = [
  {
    id: 'ex_cardio_treadmill',
    exerciseId: 'treadmill',
    name: 'Treadmill',
    category: 'cardio',
    equipment: 'Treadmill',
    level: 'beginner',
    instructions: [
      'Step onto the treadmill and start at a walking pace',
      'Gradually increase speed to desired running/walking pace',
      'Maintain proper posture with relaxed shoulders',
      'Land mid-foot and keep stride natural',
      'Cool down by gradually reducing speed',
    ],
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
  {
    id: 'ex_chest_db_press',
    exerciseId: 'dumbbell-press',
    name: 'Dumbbell Press',
    category: 'chest',
    equipment: 'Dumbbells',
    level: 'intermediate',
    instructions: [
      'Lie on flat bench with dumbbells at shoulder level',
      'Press dumbbells up until arms are fully extended',
      'Lower dumbbells with control to chest level',
      'Keep elbows at 45-degree angle',
      'Maintain contact with bench throughout',
    ],
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
  {
    id: 'ex_back_bent_row',
    exerciseId: 'bent-over-row',
    name: 'Bent Over Row',
    category: 'back',
    equipment: 'Barbell',
    level: 'intermediate',
    instructions: [
      'Bend at hips with barbell in hands, back flat',
      'Pull barbell to lower chest/upper abdomen',
      'Keep elbows close to body',
      'Squeeze shoulder blades together at top',
      'Lower with control to starting position',
    ],
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
  {
    id: 'ex_cardio_bike',
    exerciseId: 'stationary-bike',
    name: 'Stationary Bike',
    category: 'cardio',
    equipment: 'Bike',
    level: 'beginner',
    instructions: [
      'Adjust seat so knee has slight bend at bottom of pedal stroke',
      'Start with light resistance and gradually increase',
      'Maintain steady cadence (60-90 RPM)',
      'Keep upper body relaxed',
      'Cool down by reducing resistance',
    ],
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
  {
    id: 'ex_chest_pushup',
    exerciseId: 'push-up',
    name: 'Push Up',
    category: 'chest',
    equipment: 'Bodyweight',
    level: 'beginner',
    instructions: [
      'Start in plank position with hands shoulder-width apart',
      'Lower body until chest nearly touches ground',
      'Keep elbows at 45-degree angle',
      'Push back up to starting position',
      'Maintain straight line from head to heels',
    ],
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
  {
    id: 'ex_back_lat_pulldown',
    exerciseId: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'back',
    equipment: 'Machine',
    level: 'beginner',
    instructions: [
      'Sit at lat pulldown machine with knees secured',
      'Grip bar slightly wider than shoulder width',
      'Pull bar down to upper chest',
      'Squeeze shoulder blades together',
      'Return to starting position with control',
    ],
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
  {
    id: 'ex_cardio_rower',
    exerciseId: 'rowing-machine',
    name: 'Rowing Machine',
    category: 'cardio',
    equipment: 'Rower',
    level: 'intermediate',
    instructions: [
      'Sit on rower with feet secured, knees bent',
      'Drive with legs first, then pull with arms',
      'Lean back slightly at finish',
      'Reverse the motion: arms, body, then legs',
      'Maintain rhythmic, controlled tempo',
    ],
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
  {
    id: 'ex_shoulders_db_press',
    exerciseId: 'shoulder-press',
    name: 'Shoulder Press',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'intermediate',
    instructions: [
      'Stand or sit with dumbbells at shoulder height',
      'Press weights overhead until arms fully extended',
      'Keep core engaged throughout',
      'Lower weights with control to shoulder level',
      'Avoid arching lower back',
    ],
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
  {
    id: 'ex_biceps_curl',
    exerciseId: 'bicep-curl',
    name: 'Bicep Curl',
    category: 'biceps',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand with dumbbells at sides, palms facing forward',
      'Curl weights up keeping elbows stationary',
      'Squeeze biceps at top of movement',
      'Lower weights with control',
      'Avoid swinging or using momentum',
    ],
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
  {
    id: 'ex_triceps_extension',
    exerciseId: 'tricep-extension',
    name: 'Tricep Extension',
    category: 'triceps',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Hold dumbbell behind head with both hands',
      'Extend arms overhead while keeping elbows stable',
      'Lower weight behind head with control',
      'Keep upper arms vertical throughout',
      'Fully extend at top',
    ],
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
  {
    id: 'ex_stretch_hamstring',
    exerciseId: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    category: 'stretching',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Sit on floor with one leg extended',
      'Reach toward toes with both hands',
      'Keep back straight, hinge at hips',
      'Hold stretch for 20-30 seconds',
      'Switch legs and repeat',
    ],
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
  {
    id: 'ex_stretch_quad',
    exerciseId: 'quad-stretch',
    name: 'Quad Stretch',
    category: 'stretching',
    equipment: 'None',
    level: 'beginner',
    instructions: [
      'Stand on one leg, grab opposite ankle behind you',
      'Pull heel toward glutes',
      'Keep knees together',
      'Hold for 20-30 seconds',
      'Switch legs and repeat',
    ],
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
  {
    id: 'ex_cardio_burpees',
    exerciseId: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    equipment: 'Bodyweight',
    level: 'advanced',
    instructions: [
      'Start standing, drop into squat position',
      'Place hands on floor and jump feet back to plank',
      'Perform push-up',
      'Jump feet back to squat position',
      'Explosively jump up with arms overhead',
    ],
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
  {
    id: 'ex_shoulders_lateral_raise',
    exerciseId: 'lateral-raise',
    name: 'Lateral Raise',
    category: 'shoulders',
    equipment: 'Dumbbells',
    level: 'beginner',
    instructions: [
      'Stand with dumbbells at sides',
      'Raise arms out to sides to shoulder height',
      'Keep slight bend in elbows',
      'Lower with control',
      'Avoid using momentum',
    ],
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
];

// Check if exercises already exist, if not add them
let addedCount = 0;
newExercises.forEach((newEx) => {
  const exists = exercises.some((ex: any) => ex.id === newEx.id);
  if (!exists) {
    exercises.push(newEx);
    addedCount++;
  }
});

// Write updated exercises back to file
fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2));

console.log(`✅ Successfully added ${addedCount} new exercises`);
console.log('Total exercises now:', exercises.length);
