import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

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
