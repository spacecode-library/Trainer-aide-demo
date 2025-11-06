import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || ''

// Create a client with fallback values for build time
// This prevents build errors when env vars aren't available
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

/**
 * Constructs the public URL for an exercise image from Supabase storage
 * @param exerciseId - The exercise folder name (e.g., '3-4-sit-up')
 * @param imageType - Either 'start' or 'end'
 * @returns The public URL to the image
 */
export function getExerciseImageUrl(
  exerciseId: string,
  imageType: 'start' | 'end'
): string {
  // Return placeholder if Supabase is not configured
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return ''
  }

  const { data } = supabase.storage
    .from('exercise-images')
    .getPublicUrl(`${exerciseId}/${imageType}.webp`)

  return data.publicUrl
}

/**
 * Checks if an exercise image exists in Supabase storage
 * @param exerciseId - The exercise folder name
 * @param imageType - Either 'start' or 'end'
 * @returns Promise<boolean>
 */
export async function exerciseImageExists(
  exerciseId: string,
  imageType: 'start' | 'end'
): Promise<boolean> {
  // Return false if Supabase is not configured
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return false
  }

  try {
    const { data, error } = await supabase.storage
      .from('exercise-images')
      .list(exerciseId)

    if (error) return false

    const fileName = `${imageType}.webp`
    return data?.some(file => file.name === fileName) ?? false
  } catch {
    return false
  }
}

/**
 * Gets both start and end image URLs for an exercise
 * @param exerciseId - The exercise folder name
 * @returns Object with startUrl and endUrl
 */
export function getExerciseImages(exerciseId: string) {
  return {
    startUrl: getExerciseImageUrl(exerciseId, 'start'),
    endUrl: getExerciseImageUrl(exerciseId, 'end'),
  }
}

/**
 * Gets exercise images using the folder name from the mapping utility
 * @param exerciseId - The exercise ID (e.g., 'ex_chest_db_press')
 * @param exerciseName - The exercise name for fuzzy matching
 * @returns Object with startImageUrl and endImageUrl (or null if not found)
 */
export function getExerciseImagesFromMapping(
  exerciseId: string,
  exerciseName?: string
): { startImageUrl: string | null; endImageUrl: string | null } {
  // Dynamic import to avoid circular dependencies
  const { getExerciseFolderName, AVAILABLE_SUPABASE_FOLDERS } = require('./utils/exercise-image-mapping')

  const folderName = getExerciseFolderName(
    exerciseId,
    exerciseName,
    AVAILABLE_SUPABASE_FOLDERS
  )

  // Check if Supabase is configured
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    return { startImageUrl: null, endImageUrl: null }
  }

  const images = getExerciseImages(folderName)

  return {
    startImageUrl: images.startUrl || null,
    endImageUrl: images.endUrl || null,
  }
}

/**
 * Bulk load exercise images for multiple exercises
 * @param exercises - Array of exercises with id and name
 * @returns Map of exerciseId to image URLs
 */
export function bulkGetExerciseImages(
  exercises: Array<{ id: string; name: string }>
): Record<string, { startImageUrl: string | null; endImageUrl: string | null }> {
  const result: Record<string, { startImageUrl: string | null; endImageUrl: string | null }> = {}

  for (const exercise of exercises) {
    result[exercise.id] = getExerciseImagesFromMapping(exercise.id, exercise.name)
  }

  return result
}

/**
 * Checks if exercise images exist in Supabase
 * @param exerciseId - The exercise ID
 * @param exerciseName - The exercise name
 * @returns Promise<boolean>
 */
export async function exerciseImagesExist(
  exerciseId: string,
  exerciseName?: string
): Promise<boolean> {
  const { getExerciseFolderName, AVAILABLE_SUPABASE_FOLDERS } = require('./utils/exercise-image-mapping')

  const folderName = getExerciseFolderName(
    exerciseId,
    exerciseName,
    AVAILABLE_SUPABASE_FOLDERS
  )

  const startExists = await exerciseImageExists(folderName, 'start')
  const endExists = await exerciseImageExists(folderName, 'end')

  return startExists && endExists
}
