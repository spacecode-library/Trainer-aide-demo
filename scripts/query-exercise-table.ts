import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUPABASE EXERCISE LIBRARY TABLE INSPECTION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📡 Connecting to: ${supabaseUrl}\n`);

  const report: any = {
    timestamp: new Date().toISOString(),
    connection: { url: supabaseUrl, status: 'unknown' },
    ta_exercise_library_original: { found: false, error: null, rowCount: null, sampleData: null, allColumns: null },
    ta_exercise_library_original_backup_utcnow: { found: false, error: null, rowCount: null, sampleData: null }
  };

  // Try to query ta_exercise_library_original
  console.log('🔍 Attempting to query: ta_exercise_library_original...\n');

  try {
    const { data, error, count } = await supabase
      .from('ta_exercise_library_original')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error(`❌ Error querying ta_exercise_library_original:`, error.message);
      report.ta_exercise_library_original.found = false;
      report.ta_exercise_library_original.error = error.message;
    } else {
      console.log(`✅ SUCCESS! Table ta_exercise_library_original EXISTS\n`);
      report.ta_exercise_library_original.found = true;
      report.ta_exercise_library_original.rowCount = count;
      report.ta_exercise_library_original.sampleData = data;
      report.connection.status = 'success';

      console.log(`📊 Total rows: ${count}\n`);

      if (data && data.length > 0) {
        console.log('📋 Available columns (from first row):');
        const columns = Object.keys(data[0]);
        columns.forEach((col, i) => {
          console.log(`   ${i + 1}. ${col}`);
        });
        report.ta_exercise_library_original.allColumns = columns;

        console.log('\n📊 Sample Data (first 5 rows):\n');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('⚠️  Table exists but contains no data');
      }
    }
  } catch (err: any) {
    console.error(`❌ Exception querying ta_exercise_library_original:`, err.message);
    report.ta_exercise_library_original.found = false;
    report.ta_exercise_library_original.error = err.message;
  }

  // Try backup table
  console.log('\n\n🔍 Attempting to query: ta_exercise_library_original_backup_utcnow...\n');

  try {
    const { data, error, count } = await supabase
      .from('ta_exercise_library_original_backup_utcnow')
      .select('*', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error(`❌ Error querying backup table:`, error.message);
      report.ta_exercise_library_original_backup_utcnow.found = false;
      report.ta_exercise_library_original_backup_utcnow.error = error.message;
    } else {
      console.log(`✅ SUCCESS! Table ta_exercise_library_original_backup_utcnow EXISTS\n`);
      report.ta_exercise_library_original_backup_utcnow.found = true;
      report.ta_exercise_library_original_backup_utcnow.rowCount = count;
      report.ta_exercise_library_original_backup_utcnow.sampleData = data;

      console.log(`📊 Total rows: ${count}\n`);
    }
  } catch (err: any) {
    console.error(`❌ Exception querying backup table:`, err.message);
    report.ta_exercise_library_original_backup_utcnow.found = false;
    report.ta_exercise_library_original_backup_utcnow.error = err.message;
  }

  // Save report
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const jsonPath = path.join(reportsDir, `exercise-table-inspection-${timestamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`💾 Report saved to: ${jsonPath}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
