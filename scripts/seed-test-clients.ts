/**
 * Seed Test Client Profiles
 *
 * Creates sample client profiles in Supabase for testing
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config();

// Create Supabase client directly (after env vars are loaded)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const testClients = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.com',
    primary_goal: 'hypertrophy',
    secondary_goals: ['strength'],
    experience_level: 'beginner',
    current_activity_level: 'lightly_active',
    available_equipment: ['dumbbells', 'bench', 'resistance_bands'],
    preferred_training_frequency: 3,
    preferred_session_duration_minutes: 45,
    preferred_training_days: ['monday', 'wednesday', 'friday'],
    preferred_training_times: ['morning'],
    injuries: [
      {
        body_part: 'knee',
        description: 'Previous knee injury',
        severity: 'mild',
        restrictions: ['avoid high impact', 'no deep squats']
      }
    ],
    medical_conditions: [],
    medications: [],
    physical_limitations: ['knee sensitivity'],
    doctor_clearance: true,
    preferred_exercise_types: ['strength training', 'low impact cardio'],
    exercise_aversions: ['running', 'jumping exercises'],
    preferred_movement_patterns: ['push', 'pull', 'hip hinge'],
    dietary_restrictions: [],
    dietary_preferences: ['high protein'],
    is_active: true
  },
  {
    first_name: 'Mike',
    last_name: 'Chen',
    email: 'mike.chen@example.com',
    primary_goal: 'strength',
    secondary_goals: ['hypertrophy'],
    experience_level: 'intermediate',
    current_activity_level: 'moderately_active',
    available_equipment: ['barbell', 'dumbbells', 'bench', 'squat_rack', 'pull_up_bar'],
    preferred_training_frequency: 4,
    preferred_session_duration_minutes: 60,
    preferred_training_days: ['monday', 'tuesday', 'thursday', 'friday'],
    preferred_training_times: ['evening'],
    injuries: [],
    medical_conditions: [],
    medications: [],
    physical_limitations: [],
    doctor_clearance: true,
    preferred_exercise_types: ['powerlifting', 'olympic lifting', 'strength training'],
    exercise_aversions: [],
    preferred_movement_patterns: ['squat', 'hip hinge', 'push', 'pull'],
    dietary_restrictions: [],
    dietary_preferences: ['balanced macros', 'meal prep friendly'],
    is_active: true
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    primary_goal: 'fat_loss',
    secondary_goals: ['general_fitness', 'endurance'],
    experience_level: 'beginner',
    current_activity_level: 'lightly_active',
    available_equipment: ['dumbbells', 'resistance_bands', 'bodyweight'],
    preferred_training_frequency: 3,
    preferred_session_duration_minutes: 30,
    preferred_training_days: ['tuesday', 'thursday', 'saturday'],
    preferred_training_times: ['morning', 'afternoon'],
    injuries: [
      {
        body_part: 'lower back',
        description: 'Lower back sensitivity',
        severity: 'moderate',
        restrictions: ['avoid heavy deadlifts', 'no spinal flexion under load']
      }
    ],
    medical_conditions: [],
    medications: [],
    physical_limitations: ['lower back sensitivity'],
    doctor_clearance: true,
    preferred_exercise_types: ['circuit training', 'HIIT', 'bodyweight'],
    exercise_aversions: ['heavy compound lifts'],
    preferred_movement_patterns: ['push', 'pull', 'carry'],
    dietary_restrictions: ['gluten free'],
    dietary_preferences: ['plant based', 'whole foods'],
    is_active: true
  },
  {
    first_name: 'Alex',
    last_name: 'Thompson',
    email: 'alex.thompson@example.com',
    primary_goal: 'general_fitness',
    secondary_goals: ['strength'],
    experience_level: 'advanced',
    current_activity_level: 'very_active',
    available_equipment: ['barbell', 'dumbbells', 'bench', 'squat_rack', 'pull_up_bar', 'cable', 'kettlebell'],
    preferred_training_frequency: 5,
    preferred_session_duration_minutes: 75,
    preferred_training_days: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
    preferred_training_times: ['morning', 'afternoon'],
    injuries: [],
    medical_conditions: [],
    medications: [],
    physical_limitations: [],
    doctor_clearance: true,
    preferred_exercise_types: ['strength training', 'functional fitness', 'olympic lifting'],
    exercise_aversions: [],
    preferred_movement_patterns: ['squat', 'hip hinge', 'push', 'pull', 'carry', 'rotation'],
    dietary_restrictions: [],
    dietary_preferences: ['performance focused', 'high protein'],
    is_active: true
  }
];

async function seedClients() {
  console.log('🌱 Seeding test client profiles...\n');

  try {
    // Check if clients already exist
    const { data: existing } = await supabase
      .from('client_profiles')
      .select('email')
      .in('email', testClients.map(c => c.email));

    if (existing && existing.length > 0) {
      console.log('⚠️  Some test clients already exist:');
      existing.forEach(c => console.log(`   - ${c.email}`));
      console.log('\nDelete them first or use different emails.\n');
      return;
    }

    // Insert test clients
    const { data, error } = await supabase
      .from('client_profiles')
      .insert(testClients)
      .select();

    if (error) {
      console.error('❌ Error creating clients:', error);
      return;
    }

    console.log(`✅ Successfully created ${data?.length || 0} test clients:\n`);
    data?.forEach(client => {
      console.log(`   📋 ${client.first_name} ${client.last_name}`);
      console.log(`      Email: ${client.email}`);
      console.log(`      Goal: ${client.primary_goal}`);
      console.log(`      Experience: ${client.experience_level}`);
      console.log(`      Equipment: ${client.available_equipment?.length || 0} items`);
      console.log(`      Frequency: ${client.preferred_training_frequency}x/week`);
      console.log('');
    });

    console.log('✨ All done! Refresh your app to see the clients.\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the seed function
seedClients()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
