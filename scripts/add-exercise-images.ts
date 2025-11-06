import fs from 'fs';
import path from 'path';
import { getExerciseImagesFromMapping } from '../lib/supabase';

// Read the exercises file
const exercisesPath = path.join(process.cwd(), 'data', 'generated-exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

console.log(`📚 Loading ${exercises.length} exercises...`);

let updatedCount = 0;
let skippedCount = 0;

// Add image URLs to each exercise
exercises.forEach((exercise: any) => {
  try {
    const images = getExerciseImagesFromMapping(exercise.id, exercise.name);

    if (images.startImageUrl && images.endImageUrl) {
      exercise.startImageUrl = images.startImageUrl;
      exercise.endImageUrl = images.endImageUrl;
      updatedCount++;
      console.log(`✅ ${exercise.name}: Added images`);
    } else {
      // Even if images don't exist yet, store the URLs so they work when uploaded
      exercise.startImageUrl = images.startImageUrl;
      exercise.endImageUrl = images.endImageUrl;
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
