import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface QueryResult {
  success: boolean;
  error?: string;
  data?: any;
}

async function getAllTables(): Promise<QueryResult> {
  console.log('\n🔍 Querying all tables in database...\n');

  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function getTableSchema(tableName: string): Promise<QueryResult> {
  console.log(`\n📋 Fetching schema for table: ${tableName}...\n`);

  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default, character_maximum_length')
    .eq('table_name', tableName)
    .eq('table_schema', 'public')
    .order('ordinal_position');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function getSampleData(tableName: string, limit: number = 5): Promise<QueryResult> {
  console.log(`\n📊 Fetching sample data from: ${tableName}...\n`);

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function getRowCount(tableName: string): Promise<QueryResult> {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: count };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUPABASE PRODUCTION DATABASE INSPECTION SCRIPT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n📡 Connecting to: ${supabaseUrl}`);
  console.log(`🔑 Using service role key: ${supabaseKey.substring(0, 20)}...`);

  const report: any = {
    timestamp: new Date().toISOString(),
    connection: {
      url: supabaseUrl,
      status: 'unknown'
    },
    tables: [],
    exerciseLibrary: {
      found: false,
      schema: null,
      sampleData: null,
      rowCount: null
    },
    exerciseLibraryBackup: {
      found: false,
      schema: null,
      sampleData: null,
      rowCount: null
    }
  };

  // Step 1: Get all tables
  const tablesResult = await getAllTables();
  if (!tablesResult.success) {
    console.error('❌ Failed to retrieve tables:', tablesResult.error);
    report.connection.status = 'failed';
    report.connection.error = tablesResult.error;
    saveReport(report);
    return;
  }

  report.connection.status = 'success';
  const tables = tablesResult.data || [];
  console.log(`\n✅ Found ${tables.length} tables in database:\n`);
  tables.forEach((t: any, i: number) => {
    console.log(`   ${i + 1}. ${t.table_name}`);
    report.tables.push(t.table_name);
  });

  // Step 2: Check for ta_exercise_library_original
  const exerciseTableExists = tables.some((t: any) => t.table_name === 'ta_exercise_library_original');

  if (exerciseTableExists) {
    console.log('\n✅ FOUND: ta_exercise_library_original table');
    report.exerciseLibrary.found = true;

    // Get schema
    const schemaResult = await getTableSchema('ta_exercise_library_original');
    if (schemaResult.success) {
      report.exerciseLibrary.schema = schemaResult.data;
      console.log('\n📋 Table Schema:');
      console.table(schemaResult.data);
    }

    // Get row count
    const countResult = await getRowCount('ta_exercise_library_original');
    if (countResult.success) {
      report.exerciseLibrary.rowCount = countResult.data;
      console.log(`\n📊 Total rows: ${countResult.data}`);
    }

    // Get sample data
    const sampleResult = await getSampleData('ta_exercise_library_original', 5);
    if (sampleResult.success) {
      report.exerciseLibrary.sampleData = sampleResult.data;
      console.log('\n📊 Sample Data (first 5 rows):');
      console.log(JSON.stringify(sampleResult.data, null, 2));
    }
  } else {
    console.log('\n❌ NOT FOUND: ta_exercise_library_original table does not exist');
    report.exerciseLibrary.found = false;
  }

  // Step 3: Check for backup table
  const backupTableExists = tables.some((t: any) => t.table_name === 'ta_exercise_library_original_backup_utcnow');

  if (backupTableExists) {
    console.log('\n✅ FOUND: ta_exercise_library_original_backup_utcnow table');
    report.exerciseLibraryBackup.found = true;

    const schemaResult = await getTableSchema('ta_exercise_library_original_backup_utcnow');
    if (schemaResult.success) {
      report.exerciseLibraryBackup.schema = schemaResult.data;
    }

    const countResult = await getRowCount('ta_exercise_library_original_backup_utcnow');
    if (countResult.success) {
      report.exerciseLibraryBackup.rowCount = countResult.data;
    }

    const sampleResult = await getSampleData('ta_exercise_library_original_backup_utcnow', 3);
    if (sampleResult.success) {
      report.exerciseLibraryBackup.sampleData = sampleResult.data;
    }
  } else {
    console.log('\n❌ NOT FOUND: ta_exercise_library_original_backup_utcnow table does not exist');
    report.exerciseLibraryBackup.found = false;
  }

  // Save report
  saveReport(report);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  INSPECTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
}

function saveReport(report: any) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const jsonPath = path.join(reportsDir, `supabase-inspection-${timestamp}.json`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: ${jsonPath}`);
}

main().catch(console.error);
