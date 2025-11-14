import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * Script to mark existing AI programs as templates
 * This allows them to appear in the Templates tab
 *
 * Run with: npx tsx scripts/mark-program-as-template.ts [program-id]
 */

async function main() {
  console.log('🔧 Mark AI Program as Template\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get program ID from command line or use first available
  const programIdArg = process.argv[2];

  try {
    let programId = programIdArg;

    // If no ID provided, get the most recent program
    if (!programId) {
      console.log('📋 No program ID specified, fetching most recent program...\n');

      const { data: programs, error: fetchError } = await supabase
        .from('ai_programs')
        .select('id, program_name, status, is_template, is_published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError || !programs || programs.length === 0) {
        console.error('❌ No programs found in database');
        console.error('\n💡 Create a program first by running the AI generation wizard');
        process.exit(1);
      }

      console.log('📊 Available Programs:\n');
      programs.forEach((p, i) => {
        const status = p.is_template && p.is_published ? '✅ TEMPLATE' : p.is_template ? '⚠️  UNPUBLISHED' : '❌ NOT TEMPLATE';
        console.log(`${i + 1}. ${p.program_name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Status: ${p.status} | ${status}\n`);
      });

      // Use the first program that's not already a published template
      const nonTemplateProgram = programs.find(p => !p.is_template || !p.is_published);
      if (nonTemplateProgram) {
        programId = nonTemplateProgram.id;
        console.log(`✨ Selecting: ${nonTemplateProgram.program_name}\n`);
      } else {
        programId = programs[0].id;
        console.log(`ℹ️  All programs are already templates. Selecting first one.\n`);
      }
    }

    // Fetch the program
    const { data: program, error: getError } = await supabase
      .from('ai_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (getError || !program) {
      console.error(`❌ Program not found with ID: ${programId}`);
      console.error('   Error:', getError?.message);
      process.exit(1);
    }

    console.log(`📝 Program Details:`);
    console.log(`   Name: ${program.program_name}`);
    console.log(`   Status: ${program.status}`);
    console.log(`   Current template status: ${program.is_template ? 'Yes' : 'No'}`);
    console.log(`   Current published status: ${program.is_published ? 'Yes' : 'No'}\n`);

    // Update the program
    console.log('🔄 Updating program to template status...\n');

    const { data: updated, error: updateError } = await supabase
      .from('ai_programs')
      .update({
        is_template: true,
        is_published: true,
        client_profile_id: null, // Templates shouldn't be assigned to specific clients
      })
      .eq('id', programId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error('❌ Failed to update program');
      console.error('   Error:', updateError?.message);
      process.exit(1);
    }

    console.log('✅ Success! Program marked as template\n');
    console.log('📋 Updated Program:');
    console.log(`   Name: ${updated.program_name}`);
    console.log(`   Template: ✓`);
    console.log(`   Published: ✓`);
    console.log(`   Status: ${updated.status}\n`);

    console.log('🎉 This program will now appear in the Templates tab!');
    console.log('   Visit: http://localhost:3001/trainer/templates\n');

  } catch (error) {
    console.error('❌ Script error:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
