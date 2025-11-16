'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'
import { getExerciseImages } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface ExerciseImageViewerProps {
  exerciseId: string
  exerciseName: string
  isOpen: boolean
  onClose: () => void
}

export function ExerciseImageViewer({
  exerciseId,
  exerciseName,
  isOpen,
  onClose,
}: ExerciseImageViewerProps) {
  const [currentImage, setCurrentImage] = useState<'start' | 'end'>('start')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const images = getExerciseImages(exerciseId, exerciseName)

  // Auto-play effect with slower timing (2.5 seconds per image)
  useEffect(() => {
    if (!isOpen || !isAutoPlaying || hasError) return

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === 'start' ? 'end' : 'start'))
    }, 2500) // Slower timing: 2.5 seconds

    return () => clearInterval(interval)
  }, [isOpen, isAutoPlaying, hasError])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentImage('start')
      setIsAutoPlaying(true)
      setImagesLoaded(false)
      setHasError(false)
    }
  }, [isOpen])

  // Manual navigation
  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentImage('start')
  }, [])

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false)
    setCurrentImage('end')
  }, [])

  const handleImageLoad = useCallback(() => {
    setImagesLoaded(true)
    setHasError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setHasError(true)
    setImagesLoaded(true)
  }, [])

  if (!isOpen) return null

  return (
    <div className="w-full border-t border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {exerciseName}
            </h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Image Display */}
        <div className="relative bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          {hasError ? (
            <div className="aspect-video flex items-center justify-center text-gray-400">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Images not available</p>
                <p className="text-xs mt-1 opacity-75">
                  Upload images to Supabase storage
                </p>
              </div>
            </div>
          ) : (
            <>
              {!imagesLoaded && (
                <div className="aspect-video flex items-center justify-center">
                  <div className="animate-pulse text-gray-400">Loading...</div>
                </div>
              )}

              <div className="relative aspect-video">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage === 'start' ? images.startUrl : images.endUrl}
                    alt={`${exerciseName} - ${currentImage}`}
                    className="w-full h-full object-contain"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {/* Image indicator */}
                {imagesLoaded && !hasError && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {currentImage === 'start' ? 'Start' : 'End'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        {!hasError && (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentImage === 'start' && !isAutoPlaying}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Start
            </Button>

            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentImage === 'start'
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentImage === 'end'
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentImage === 'end' && !isAutoPlaying}
              className="flex-1"
            >
              End
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Auto-play status */}
        {!hasError && isAutoPlaying && (
          <p className="text-xs text-center text-gray-500">
            Auto-playing • Click Start/End to pause
          </p>
        )}
      </div>
    </div>
  )
}

// Compact trigger button component
interface ExerciseImageButtonProps {
  exerciseId: string
  exerciseName: string
  isActive: boolean
  onClick: () => void
  className?: string
}

export function ExerciseImageButton({
  exerciseId,
  exerciseName,
  isActive,
  onClick,
  className = '',
}: ExerciseImageButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 w-8 p-0 ${className} ${
        isActive ? 'bg-blue-100 dark:bg-blue-900/30' : ''
      }`}
      title={`View ${exerciseName} images`}
    >
      <ImageIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
    </Button>
  )
}
