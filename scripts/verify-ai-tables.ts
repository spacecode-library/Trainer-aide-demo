import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAITables() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  VERIFYING AI PROGRAM TABLES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📡 Connecting to: ${supabaseUrl}\n`);

  const expectedTables = [
    'ai_programs',
    'ai_workouts',
    'ai_workout_exercises',
    'ai_nutrition_plans',
    'ai_generations',
    'ai_program_revisions'
  ];

  console.log('🔍 Checking for AI program tables...\n');

  let allTablesExist = true;

  for (const tableName of expectedTables) {
    try {
      // Try to query the table with a limit of 0 to check existence
      const { error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: NOT FOUND`);
        console.log(`   Error: ${error.message}\n`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: ERROR`);
      console.log(`   ${error}\n`);
      allTablesExist = false;
    }
  }

  console.log('\n');

  // Check ai_programs schema specifically
  if (allTablesExist) {
    console.log('🔍 Verifying ai_programs schema...\n');

    const { data: sampleProgram, error } = await supabase
      .from('ai_programs')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (which is OK)
      console.log(`❌ Error querying ai_programs: ${error.message}\n`);
    } else {
      console.log('✅ ai_programs table is queryable\n');

      if (sampleProgram) {
        console.log('📋 Sample program structure:');
        console.log('   Columns:', Object.keys(sampleProgram).join(', '), '\n');
      } else {
        console.log('ℹ️  Table is empty (no programs generated yet)\n');
      }
    }

    // Check ai_workouts schema
    console.log('🔍 Verifying ai_workouts schema...\n');

    const { data: sampleWorkout, error: workoutError } = await supabase
      .from('ai_workouts')
      .select('*')
      .limit(1)
      .single();

    if (workoutError && workoutError.code !== 'PGRST116') {
      console.log(`❌ Error querying ai_workouts: ${workoutError.message}\n`);
    } else {
      console.log('✅ ai_workouts table is queryable\n');

      if (sampleWorkout) {
        console.log('📋 Sample workout structure:');
        console.log('   Columns:', Object.keys(sampleWorkout).join(', '), '\n');
      } else {
        console.log('ℹ️  Table is empty (no workouts generated yet)\n');
      }
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  if (allTablesExist) {
    console.log('  ✅ ALL AI PROGRAM TABLES EXIST');
  } else {
    console.log('  ❌ SOME TABLES ARE MISSING - RUN MIGRATIONS');
  }
  console.log('═══════════════════════════════════════════════════════════\n');

  return allTablesExist;
}

verifyAITables().catch(console.error);
