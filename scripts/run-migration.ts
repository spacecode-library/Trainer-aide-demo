/**
 * Run Database Migration
 *
 * Adds generation_status and generation_error columns to ai_programs table
 */

import { supabaseServer } from '../lib/supabase-server';

async function runMigration() {
  console.log('\n🔄 Running migration: Add generation_status columns to ai_programs');

  try {
    // Step 1: Add generation_status column
    console.log('\n1️⃣ Adding generation_status column...');
    const { error: statusError } = await supabaseServer.rpc('exec_sql', {
      sql: `
        ALTER TABLE ai_programs
        ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'completed'
        CHECK (generation_status IN ('generating', 'completed', 'failed'));
      `.trim()
    });

    if (statusError) {
      // Try alternative method if RPC doesn't exist
      console.log('⚠️  RPC method not available, using direct SQL...');

      // Check if column already exists
      const { data: columns } = await supabaseServer
        .from('ai_programs')
        .select('*')
        .limit(1);

      if (columns) {
        console.log('✅ Table accessible, column likely exists or needs manual migration');
      }

      throw new Error('Please run the migration SQL manually in Supabase SQL Editor:\n\nmigrations/20250114_add_generation_status.sql');
    }

    console.log('✅ generation_status column added');

    // Step 2: Add generation_error column
    console.log('\n2️⃣ Adding generation_error column...');
    const { error: errorColError } = await supabaseServer.rpc('exec_sql', {
      sql: `ALTER TABLE ai_programs ADD COLUMN IF NOT EXISTS generation_error TEXT;`.trim()
    });

    if (errorColError) {
      console.error('❌ Failed to add generation_error column:', errorColError);
      throw errorColError;
    }

    console.log('✅ generation_error column added');

    // Step 3: Create index
    console.log('\n3️⃣ Creating index...');
    const { error: indexError } = await supabaseServer.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_ai_programs_generation_status
        ON ai_programs(generation_status)
        WHERE generation_status != 'completed';
      `.trim()
    });

    if (indexError) {
      console.error('❌ Failed to create index:', indexError);
      throw indexError;
    }

    console.log('✅ Index created');

    console.log('\n✅ Migration completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Please run the SQL manually in Supabase SQL Editor:');
    console.log('   File: migrations/20250114_add_generation_status.sql\n');
    process.exit(1);
  }
}

// Run the migration
runMigration().then(() => process.exit(0));
