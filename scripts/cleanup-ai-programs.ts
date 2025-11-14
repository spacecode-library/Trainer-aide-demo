import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

/**
 * Script to identify and clean up AI programs with non-UUID IDs
 *
 * This script:
 * 1. Queries all AI programs from the database
 * 2. Identifies programs with non-UUID format IDs (like "1", "2", etc.)
 * 3. Reports these programs for manual cleanup
 *
 * Run with: npx tsx scripts/cleanup-ai-programs.ts
 */

// UUID regex pattern (standard 8-4-4-4-12 format)
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_PATTERN.test(id);
}

async function main() {
  console.log('🔍 Checking AI programs for non-UUID IDs...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    console.error('\n💡 Make sure .env.local file exists and contains these variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Fetch all AI programs
    const { data: programs, error } = await supabase
      .from('ai_programs')
      .select('id, program_name, created_at, status, is_template')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching programs:', error);
      process.exit(1);
    }

    if (!programs || programs.length === 0) {
      console.log('✅ No AI programs found in database');
      return;
    }

    console.log(`📊 Total programs found: ${programs.length}\n`);

    // Identify programs with invalid UUIDs
    const invalidPrograms = programs.filter(p => !isValidUUID(p.id));
    const validPrograms = programs.filter(p => isValidUUID(p.id));

    console.log(`✅ Valid UUID programs: ${validPrograms.length}`);
    console.log(`⚠️  Invalid UUID programs: ${invalidPrograms.length}\n`);

    if (invalidPrograms.length > 0) {
      console.log('🚨 Programs with non-UUID IDs:\n');
      console.log('┌─────────────────────────────────────────────────────────────────────────┐');
      console.log('│ ID         │ Program Name                │ Status    │ Template │');
      console.log('├─────────────────────────────────────────────────────────────────────────┤');

      invalidPrograms.forEach(program => {
        const id = String(program.id).padEnd(10);
        const name = String(program.program_name || 'Untitled').substring(0, 27).padEnd(27);
        const status = String(program.status || 'unknown').padEnd(9);
        const template = String(program.is_template || false).padEnd(8);

        console.log(`│ ${id} │ ${name} │ ${status} │ ${template} │`);
      });

      console.log('└─────────────────────────────────────────────────────────────────────────┘\n');

      console.log('📋 Recommended Actions:\n');
      console.log('1. These programs were likely created during testing with auto-increment IDs');
      console.log('2. Delete them manually from the database or via Supabase dashboard');
      console.log('3. Use this SQL command to delete them:\n');

      const invalidIds = invalidPrograms.map(p => `'${p.id}'`).join(', ');
      console.log(`   DELETE FROM ai_programs WHERE id IN (${invalidIds});\n`);

      console.log('4. Or delete them one by one using:');
      invalidPrograms.forEach(program => {
        console.log(`   DELETE FROM ai_programs WHERE id = '${program.id}';`);
      });
      console.log('');

      // Check if we should auto-delete (only in non-production)
      const shouldAutoDelete = process.argv.includes('--delete');

      if (shouldAutoDelete) {
        console.log('🗑️  Auto-delete flag detected. Deleting invalid programs...\n');

        for (const program of invalidPrograms) {
          const { error: deleteError } = await supabase
            .from('ai_programs')
            .delete()
            .eq('id', program.id);

          if (deleteError) {
            console.error(`❌ Error deleting program ${program.id}:`, deleteError);
          } else {
            console.log(`✅ Deleted program: ${program.id} (${program.program_name})`);
          }
        }

        console.log('\n✅ Cleanup complete!');
      } else {
        console.log('💡 To automatically delete these programs, run:');
        console.log('   npx tsx scripts/cleanup-ai-programs.ts --delete\n');
      }
    } else {
      console.log('✅ All programs have valid UUID format IDs!');
      console.log('✨ No cleanup required.\n');
    }

    // Display summary of valid programs
    if (validPrograms.length > 0) {
      console.log('📈 Valid Programs Summary:\n');

      const templates = validPrograms.filter(p => p.is_template);
      const active = validPrograms.filter(p => p.status === 'active');
      const draft = validPrograms.filter(p => p.status === 'draft');

      console.log(`  Templates: ${templates.length}`);
      console.log(`  Active: ${active.length}`);
      console.log(`  Draft: ${draft.length}`);
      console.log('');
    }

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
