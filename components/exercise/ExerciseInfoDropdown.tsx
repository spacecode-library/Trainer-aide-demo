'use client';

import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface ExerciseInfoDropdownProps {
  exerciseName: string;
  instructions?: string[];
  modifications?: string[];
  commonMistakes?: string[];
  primaryMuscles?: string;
  secondaryMuscles?: string;
  startImageUrl?: string;
  endImageUrl?: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function ExerciseInfoDropdown({
  exerciseName,
  instructions = [],
  modifications = [],
  commonMistakes = [],
  primaryMuscles,
  secondaryMuscles,
  startImageUrl,
  endImageUrl,
  isOpen,
  onToggle,
  className,
}: ExerciseInfoDropdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('modifications');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const hasAnyInfo = instructions.length > 0 || modifications.length > 0 ||
                     commonMistakes.length > 0 || primaryMuscles || secondaryMuscles;

  return (
    <div className={cn('relative', className)}>
      {/* Info Button */}
      <button
        onClick={onToggle}
        disabled={!hasAnyInfo}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg transition-all',
          hasAnyInfo
            ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110 active:scale-95'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50',
          isOpen && 'ring-2 ring-blue-600 ring-offset-2'
        )}
        title={hasAnyInfo ? 'Exercise Information' : 'No information available'}
        aria-label="Exercise Information"
      >
        <Info size={20} />
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onToggle}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {exerciseName}
                </h3>
                <button
                  onClick={onToggle}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Exercise Images */}
                {(startImageUrl || endImageUrl) && (
                  <div className="grid grid-cols-2 gap-3">
                    {startImageUrl && (
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                        <div className="absolute top-2 left-2 z-10 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
                          Start
                        </div>
                        <Image
                          src={startImageUrl}
                          alt={`${exerciseName} - Start`}
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    {endImageUrl && (
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                        <div className="absolute top-2 left-2 z-10 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded">
                          End
                        </div>
                        <Image
                          src={endImageUrl}
                          alt={`${exerciseName} - End`}
                          fill
                          sizes="(max-width: 768px) 50vw, 300px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Muscles Worked - Always visible box */}
                {(primaryMuscles || secondaryMuscles) && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Muscles Worked:
                    </h4>
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
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('instructions')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-red-600" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Form Cues
                        </span>
                      </div>
                      {expandedSection === 'instructions' ? (
                        <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
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
                          <div className="px-4 pb-4 pt-2">
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
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('mistakes')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-amber-600" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Common Mistakes
                        </span>
                      </div>
                      {expandedSection === 'mistakes' ? (
                        <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
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
                          <div className="px-4 pb-4 pt-2">
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
                  <div className="border-2 border-blue-500 dark:border-blue-600 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('modifications')}
                      className="w-full flex items-center justify-between p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Modifications
                        </span>
                      </div>
                      {expandedSection === 'modifications' ? (
                        <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
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
                          <div className="px-4 pb-4 pt-2">
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

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4 rounded-b-2xl">
                <button
                  onClick={onToggle}
                  className="w-full bg-wondrous-magenta hover:bg-wondrous-magenta/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
