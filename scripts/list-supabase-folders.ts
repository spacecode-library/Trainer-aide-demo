/**
 * Simple script to list all Supabase storage folders
 */

import { createClient } from '@supabase/supabase-js';

// Hardcode credentials (only for this script)
const SUPABASE_URL = 'https://scpfuwijsbjxuhfwoogg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjcGZ1d2lqc2JqeHVoZndvb2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3MTg2NywiZXhwIjoyMDY4MDQ3ODY3fQ.oXIwjgvvuke7pok-kNVEuAHUCSfD6hSmHgGnXbXdB_w';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('📂 Listing all items in Supabase storage...\n');

  // First, list all buckets to verify
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Error listing buckets:', bucketsError);
    return;
  }

  console.log('Available buckets:');
  buckets?.forEach(b => console.log(`  - ${b.name} (id: ${b.id})`));
  console.log('');

  const { data, error } = await supabase.storage
    .from('exercise-images')
    .list('', {
      limit: 1000,
      offset: 0,
    });

  if (error) {
    console.error('❌ Error listing exercise-images:', error);
    return;
  }

  if (!data) {
    console.log('No data found');
    return;
  }

  console.log(`Found ${data.length} items in exercise-images bucket`);
  console.log('First 10 items:');
  data.slice(0, 10).forEach(item => {
    console.log(`  - ${item.name} (id: ${item.id}, metadata: ${JSON.stringify(item.metadata)})`);
  });
  console.log('');

  // In Supabase storage, folders at root level have id: null
  // Files have an id. So we want items with id === null
  const folders = data
    .filter(item => item.id === null) // Folders have null id at root level
    .map(item => item.name)
    .filter(name => !name.includes('.')); // Exclude files (shouldn't be any at root)

  console.log(`✅ Found ${folders.length} folders:\n`);

  folders.sort().forEach((folder, i) => {
    console.log(`${(i + 1).toString().padStart(3, ' ')}. ${folder}`);
  });

  console.log(`\nTotal: ${folders.length} folders`);

  // Write to file
  const fs = await import('fs/promises');
  const content = folders.sort().map(f => `'${f}'`).join(',\n  ');
  await fs.writeFile(
    'supabase-folders-list.txt',
    `// Complete list of Supabase exercise-images folders\n// Generated: ${new Date().toISOString()}\n\nconst AVAILABLE_SUPABASE_FOLDERS = [\n  ${content}\n];\n`
  );

  console.log('\n📄 List saved to: supabase-folders-list.txt');
}

main().catch(console.error);
