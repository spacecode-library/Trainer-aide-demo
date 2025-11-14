/**
 * Check database tables exist
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { supabaseServer } from '../lib/supabase-server';

async function checkDatabase() {
  console.log('🔍 Checking database tables...\n');

  // Test 1: Check if ai_programs table exists
  console.log('1️⃣  Testing ai_programs table...');
  const { data: programs, error: programsError } = await supabaseServer
    .from('ai_programs')
    .select('count')
    .limit(1);

  if (programsError) {
    console.log(`   ❌ Error: ${programsError.message}`);
    console.log(`   Code: ${programsError.code}`);
  } else {
    console.log(`   ✅ ai_programs table exists`);
  }

  // Test 2: Check if we can insert (bypassing RLS with service role)
  console.log('\n2️⃣  Testing insert with service role key...');
  const testId = '00000000-0000-0000-0000-000000000001';

  const { data: insertData, error: insertError } = await supabaseServer
    .from('ai_programs')
    .insert({
      trainer_id: testId,
      program_name: 'Test Program',
      total_weeks: 4,
      sessions_per_week: 3,
      status: 'draft',
    })
    .select();

  if (insertError) {
    console.log(`   ❌ Insert failed: ${insertError.message}`);
    console.log(`   Code: ${insertError.code}`);
    console.log(`   Details: ${insertError.details}`);
  } else {
    console.log(`   ✅ Insert successful!`);
    console.log(`   Program ID: ${insertData[0].id}`);

    // Clean up test data
    await supabaseServer
      .from('ai_programs')
      .delete()
      .eq('id', insertData[0].id);
    console.log(`   🧹 Test data cleaned up`);
  }

  // Test 3: Check service role key
  console.log('\n3️⃣  Checking service role key...');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey.length > 20) {
    console.log(`   ✅ Service role key is configured (${serviceKey.substring(0, 20)}...)`);
  } else {
    console.log(`   ❌ Service role key not configured properly`);
  }
}

checkDatabase().catch(console.error);
