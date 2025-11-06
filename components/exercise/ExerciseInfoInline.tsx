'use client';

import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ExerciseInfoInlineProps {
  exerciseId: string;
  exerciseName: string;
  instructions?: string[];
  modifications?: string[];
  commonMistakes?: string[];
  primaryMuscles?: string;
  secondaryMuscles?: string;
  startImageUrl?: string | null;
  endImageUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ExerciseInfoInline({
  exerciseId,
  exerciseName,
  instructions = [],
  modifications = [],
  commonMistakes = [],
  primaryMuscles,
  secondaryMuscles,
  startImageUrl,
  endImageUrl,
  isOpen,
  onClose,
  className,
}: ExerciseInfoInlineProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('modifications');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hasAnyInfo = instructions.length > 0 || modifications.length > 0 ||
                     commonMistakes.length > 0 || primaryMuscles || secondaryMuscles;

  if (!isOpen) return null;

  return (
    <div className={cn('w-full border-t border-gray-200 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800', className)}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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

        {/* Exercise Images */}
        {(startImageUrl || endImageUrl) && (
          <div className="grid grid-cols-2 gap-3">
            {startImageUrl && (
              <div className="relative aspect-square bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="absolute top-2 left-2 z-10 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
                  Start
                </div>
                <Image
                  src={startImageUrl}
                  alt={`${exerciseName} - Start`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                  onError={(e) => {
                    // Hide image on error
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {endImageUrl && (
              <div className="relative aspect-square bg-white dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="absolute top-2 left-2 z-10 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
                  End
                </div>
                <Image
                  src={endImageUrl}
                  alt={`${exerciseName} - End`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                  onError={(e) => {
                    // Hide image on error
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Muscles Worked - Always visible box */}
        {(primaryMuscles || secondaryMuscles) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
              Muscles Worked
            </h5>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {primaryMuscles && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">Primary:</span>
                  <span>{primaryMuscles}</span>
                </li>
              )}
              {secondaryMuscles && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">Secondary:</span>
                  <span>{secondaryMuscles}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Form Cues - Collapsible */}
        {instructions.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('instructions')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Form Cues
                </span>
              </div>
              {expandedSection === 'instructions' ? (
                <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSection === 'instructions' && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                            {idx + 1}.
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Common Mistakes - Collapsible */}
        {commonMistakes.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('mistakes')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Common Mistakes
                </span>
              </div>
              {expandedSection === 'mistakes' ? (
                <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSection === 'mistakes' && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {commonMistakes.map((mistake, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Modifications - Collapsible */}
        {modifications.length > 0 && (
          <div className="border-2 border-blue-500 dark:border-blue-600 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('modifications')}
              className="w-full flex items-center justify-between p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                </div>
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Modifications
                </span>
              </div>
              {expandedSection === 'modifications' ? (
                <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSection === 'modifications' && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1">
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      {modifications.map((mod, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Compact trigger button component
interface ExerciseInfoButtonProps {
  hasInfo: boolean;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function ExerciseInfoButton({
  hasInfo,
  isActive,
  onClick,
  className = '',
}: ExerciseInfoButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={!hasInfo}
      className={cn(
        'h-8 w-8 p-0',
        className,
        isActive && 'bg-blue-100 dark:bg-blue-900/30',
        !hasInfo && 'opacity-50 cursor-not-allowed'
      )}
      title={hasInfo ? 'Exercise Information' : 'No information available'}
    >
      <Info className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-gray-500')} />
    </Button>
  );
}
