/**
 * Delete Test Client Profiles
 *
 * Removes all test client profiles to allow re-seeding
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

const testEmails = [
  'sarah.johnson@example.com',
  'mike.chen@example.com',
  'emily.rodriguez@example.com',
  'alex.thompson@example.com'
];

async function deleteClients() {
  console.log('🗑️  Deleting test client profiles...\n');

  try {
    const { data, error } = await supabase
      .from('client_profiles')
      .delete()
      .in('email', testEmails)
      .select();

    if (error) {
      console.error('❌ Error deleting clients:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No test clients found to delete.\n');
      return;
    }

    console.log(`✅ Successfully deleted ${data.length} test client(s):\n`);
    data.forEach(client => {
      console.log(`   🗑️  ${client.first_name} ${client.last_name} (${client.email})`);
    });

    console.log('\n✨ All done! You can now run the seed script.\n');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the delete function
deleteClients()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
