import fs from 'fs';
import path from 'path';
import { getExerciseImages } from '../lib/supabase';
import { getExerciseFolderName, AVAILABLE_SUPABASE_FOLDERS } from '../lib/utils/exercise-image-mapping';

// Read the exercises file
const exercisesPath = path.join(process.cwd(), 'data', 'generated-exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

console.log(`📚 Loading ${exercises.length} exercises...`);

let updatedCount = 0;
let skippedCount = 0;

// Add image URLs to each exercise
exercises.forEach((exercise: any) => {
  try {
    // Get folder name using mapping utility
    const folderName = getExerciseFolderName(
      exercise.id,
      exercise.name,
      AVAILABLE_SUPABASE_FOLDERS
    );

    // Get image URLs
    const images = getExerciseImages(folderName);

    if (images.startUrl && images.endUrl) {
      exercise.startImageUrl = images.startUrl;
      exercise.endImageUrl = images.endUrl;
      updatedCount++;
      console.log(`✅ ${exercise.name}: Added images`);
    } else {
      // Even if images don't exist yet, store the URLs so they work when uploaded
      exercise.startImageUrl = images.startUrl || null;
      exercise.endImageUrl = images.endUrl || null;
      skippedCount++;
      console.log(`⏭️  ${exercise.name}: No images found (URLs stored for future use)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${exercise.name}:`, error);
  }
});

// Write updated exercises back
fs.writeFileSync(exercisesPath, JSON.stringify(exercises, null, 2));

console.log(`\n✨ Done!`);
console.log(`   Updated: ${updatedCount} exercises`);
console.log(`   Pending: ${skippedCount} exercises (URLs stored, awaiting image upload)`);
console.log(`   Total: ${exercises.length} exercises`);
