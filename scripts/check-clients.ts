/**
 * Check existing client profiles in database
 */

import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkClients() {
  console.log('🔍 Checking client profiles in database...\n');

  try {
    const { data: clients, error } = await supabase
      .from('client_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching clients:', error);
      return;
    }

    if (!clients || clients.length === 0) {
      console.log('📭 No clients found in database.\n');
      return;
    }

    console.log(`✅ Found ${clients.length} client(s):\n`);

    clients.forEach((client, index) => {
      console.log(`\n${index + 1}. ${client.first_name} ${client.last_name}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Goal: ${client.primary_goal || 'NOT SET'}`);
      console.log(`   Experience: ${client.experience_level || 'NOT SET'}`);
      console.log(`   Activity Level: ${client.current_activity_level || '❌ MISSING'}`);
      console.log(`   Equipment: ${client.available_equipment?.length || 0} items`);
      console.log(`   Injuries: ${client.injuries?.length || 0}`);
      console.log(`   Training Days: ${client.preferred_training_days?.length || '❌ MISSING'}`);
      console.log(`   Medical Conditions: ${client.medical_conditions?.length || '❌ MISSING'}`);
      console.log(`   Doctor Clearance: ${client.doctor_clearance !== undefined ? client.doctor_clearance : '❌ MISSING'}`);
      console.log(`   Active: ${client.is_active}`);
      console.log(`   Created: ${new Date(client.created_at).toLocaleString()}`);
    });

    console.log('\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkClients()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
