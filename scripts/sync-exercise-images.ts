/**
 * Exercise Image Mapping Sync Script
 *
 * This script:
 * 1. Lists all folders in Supabase exercise-images storage
 * 2. Queries all exercises from database
 * 3. Matches exercises to image folders using fuzzy matching
 * 4. Updates database image_folder field
 * 5. Generates audit report
 *
 * Usage: npx tsx scripts/sync-exercise-images.ts [--dry-run] [--update]
 */

// Load environment variables FIRST before any imports
import * as fs from 'fs';
import * as path from 'path';

// Read .env file and set environment variables SYNCHRONOUSLY
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// NOW import Supabase after env vars are set
import { supabaseServer } from '../lib/supabase-server';
import { getExerciseFolderName, AVAILABLE_SUPABASE_FOLDERS } from '../lib/utils/exercise-image-mapping';

interface Exercise {
  id: string;
  name: string;
  slug: string | null;
  image_folder: string | null;
  movement_pattern: string | null;
}

interface AuditResult {
  total: number;
  with_images: number;
  missing_images: number;
  needs_review: number;
  mapped: Exercise[];
  unmapped: Exercise[];
  needsReview: Array<{ exercise: Exercise; suggestedFolder: string; confidence: number }>;
}

async function listSupabaseImageFolders(): Promise<string[]> {
  console.log('📂 Listing Supabase storage folders...\n');

  try {
    const { data, error } = await supabaseServer.storage
      .from('exercise-images')
      .list('', {
        limit: 1000,
        offset: 0,
      });

    if (error) {
      console.error('❌ Error listing storage:', error);
      return [];
    }

    if (!data) {
      console.warn('⚠️  No folders found in storage');
      return [];
    }

    // Filter to only directories (folders)
    // In Supabase storage, folders at root level have id: null
    const folders = data
      .filter(item => item.id === null) // Folders have null id at root level
      .map(item => item.name)
      .filter(name => !name.includes('.')); // Exclude files

    console.log(`✅ Found ${folders.length} folders in Supabase storage\n`);

    return folders.sort();
  } catch (error) {
    console.error('❌ Exception listing storage:', error);
    return [];
  }
}

async function getAllExercises(): Promise<Exercise[]> {
  console.log('🏋️  Querying exercises from database...\n');

  try {
    const { data, error } = await supabaseServer
      .from('ta_exercise_library_original')
      .select('id, name, slug, image_folder, movement_pattern')
      .order('name');

    if (error) {
      console.error('❌ Error querying exercises:', error);
      return [];
    }

    console.log(`✅ Found ${data?.length || 0} exercises in database\n`);

    return (data || []) as Exercise[];
  } catch (error) {
    console.error('❌ Exception querying exercises:', error);
    return [];
  }
}

function calculateSimilarity(str1: string, str2: string): number {
  // Dice coefficient for fuzzy matching
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .split('')
      .filter(c => c.trim());

  const set1 = new Set(normalize(str1));
  const set2 = new Set(normalize(str2));

  const intersection = new Set([...set1].filter(x => set2.has(x)));

  return (2 * intersection.size) / (set1.size + set2.size);
}

function findBestMatch(exerciseName: string, availableFolders: string[]): { folder: string; confidence: number } | null {
  let bestMatch = { folder: '', confidence: 0 };

  for (const folder of availableFolders) {
    const similarity = calculateSimilarity(exerciseName, folder);

    if (similarity > bestMatch.confidence) {
      bestMatch = { folder, confidence: similarity };
    }
  }

  // Return match only if confidence > 0.4 (lower threshold for discovery)
  return bestMatch.confidence > 0.4 ? bestMatch : null;
}

async function auditExercises(exercises: Exercise[], folders: string[]): Promise<AuditResult> {
  console.log('🔍 Auditing exercise image mappings...\n');

  const result: AuditResult = {
    total: exercises.length,
    with_images: 0,
    missing_images: 0,
    needs_review: 0,
    mapped: [],
    unmapped: [],
    needsReview: [],
  };

  for (const exercise of exercises) {
    // Check if already has image_folder
    if (exercise.image_folder && folders.includes(exercise.image_folder)) {
      result.with_images++;
      result.mapped.push(exercise);
      continue;
    }

    // Try to find match using current mapping logic
    const mappedFolder = getExerciseFolderName(
      exercise.slug || exercise.id,
      exercise.name,
      AVAILABLE_SUPABASE_FOLDERS
    );

    if (mappedFolder && folders.includes(mappedFolder)) {
      result.with_images++;
      result.mapped.push(exercise);
      continue;
    }

    // Try fuzzy matching
    const match = findBestMatch(exercise.name, folders);

    if (match) {
      if (match.confidence > 0.7) {
        // High confidence - probably correct
        result.needs_review++;
        result.needsReview.push({
          exercise,
          suggestedFolder: match.folder,
          confidence: match.confidence,
        });
      } else {
        // Low confidence - needs manual review
        result.needs_review++;
        result.needsReview.push({
          exercise,
          suggestedFolder: match.folder,
          confidence: match.confidence,
        });
      }
    } else {
      // No match found
      result.missing_images++;
      result.unmapped.push(exercise);
    }
  }

  return result;
}

async function updateDatabaseImageFolders(
  updates: Array<{ exerciseId: string; imageFolder: string }>,
  dryRun: boolean = true
): Promise<number> {
  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No database updates will be made\n');
    return updates.length;
  }

  console.log(`\n📝 Updating ${updates.length} exercises in database...\n`);

  let successCount = 0;

  for (const update of updates) {
    try {
      const { error } = await supabaseServer
        .from('ta_exercise_library_original')
        .update({ image_folder: update.imageFolder })
        .eq('id', update.exerciseId);

      if (error) {
        console.error(`❌ Failed to update ${update.exerciseId}:`, error.message);
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Exception updating ${update.exerciseId}:`, error);
    }
  }

  console.log(`\n✅ Successfully updated ${successCount}/${updates.length} exercises\n`);

  return successCount;
}

function generateReport(result: AuditResult, folders: string[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 EXERCISE IMAGE MAPPING AUDIT REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total Supabase Folders: ${folders.length}`);
  console.log(`Total Exercises: ${result.total}\n`);

  console.log(`✅ Exercises with images: ${result.with_images} (${((result.with_images / result.total) * 100).toFixed(1)}%)`);
  console.log(`⚠️  Needs review: ${result.needs_review} (${((result.needs_review / result.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Missing images: ${result.missing_images} (${((result.missing_images / result.total) * 100).toFixed(1)}%)\n`);

  if (result.needsReview.length > 0) {
    console.log('⚠️  EXERCISES NEEDING REVIEW:\n');
    console.log('These exercises have fuzzy matches but need manual verification:\n');

    // Sort by confidence (highest first)
    const sorted = [...result.needsReview].sort((a, b) => b.confidence - a.confidence);

    sorted.slice(0, 20).forEach(item => {
      const confidence = (item.confidence * 100).toFixed(0);
      const indicator = item.confidence > 0.7 ? '✓' : '?';
      console.log(`${indicator} [${confidence}%] "${item.exercise.name}" → "${item.suggestedFolder}"`);
    });

    if (sorted.length > 20) {
      console.log(`\n... and ${sorted.length - 20} more\n`);
    }
  }

  if (result.unmapped.length > 0) {
    console.log('\n❌ EXERCISES WITHOUT IMAGES:\n');
    console.log('These exercises have no matching folders in Supabase:\n');

    result.unmapped.slice(0, 15).forEach(ex => {
      console.log(`  - ${ex.name} (slug: ${ex.slug || 'none'})`);
    });

    if (result.unmapped.length > 15) {
      console.log(`\n... and ${result.unmapped.length - 15} more\n`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--update');
  const autoApply = args.includes('--auto-apply-high-confidence');

  console.log('🚀 Starting Exercise Image Sync...\n');

  // Step 1: List Supabase folders
  const folders = await listSupabaseImageFolders();
  if (folders.length === 0) {
    console.error('❌ No folders found in Supabase storage. Aborting.');
    process.exit(1);
  }

  // Step 2: Get all exercises
  const exercises = await getAllExercises();
  if (exercises.length === 0) {
    console.error('❌ No exercises found in database. Aborting.');
    process.exit(1);
  }

  // Step 3: Audit mappings
  const result = await auditExercises(exercises, folders);

  // Step 4: Generate report
  generateReport(result, folders);

  // Step 5: Prepare updates
  const updates: Array<{ exerciseId: string; imageFolder: string }> = [];

  if (autoApply) {
    // Only auto-apply high confidence matches (>70%)
    const highConfidence = result.needsReview.filter(item => item.confidence > 0.7);

    for (const item of highConfidence) {
      updates.push({
        exerciseId: item.exercise.id,
        imageFolder: item.suggestedFolder,
      });
    }

    console.log(`\n🔄 Auto-applying ${updates.length} high-confidence mappings (>70%)...\n`);
  }

  // Step 6: Update database (if --update flag)
  if (updates.length > 0) {
    await updateDatabaseImageFolders(updates, dryRun);

    if (dryRun) {
      console.log('💡 To apply these updates, run with --update --auto-apply-high-confidence flags\n');
    }
  }

  // Step 7: Write folder list to file for manual review
  const folderListPath = './supabase-exercise-folders.txt';
  const fs = await import('fs/promises');
  await fs.writeFile(
    folderListPath,
    `# Supabase Exercise Image Folders (${folders.length} total)\n# Generated: ${new Date().toISOString()}\n\n` +
    folders.join('\n')
  );
  console.log(`📄 Full folder list written to: ${folderListPath}\n`);

  console.log('✅ Sync complete!\n');
}

main().catch(console.error);
