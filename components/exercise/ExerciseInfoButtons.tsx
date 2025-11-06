"use client";

import { useState } from 'react';
import { Info, Activity, RefreshCw, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ExerciseInfoButtonsProps {
  instructions?: string[];
  modifications?: string[];
  commonMistakes?: string[];
  primaryMuscles?: string;
  secondaryMuscles?: string;
  className?: string;
}

type InfoType = 'instructions' | 'muscles' | 'modifications' | 'mistakes' | null;

export function ExerciseInfoButtons({
  instructions = [],
  modifications = [],
  commonMistakes = [],
  primaryMuscles,
  secondaryMuscles,
  className,
}: ExerciseInfoButtonsProps) {
  const [activeInfo, setActiveInfo] = useState<InfoType>(null);

  const toggleInfo = (type: InfoType) => {
    setActiveInfo(activeInfo === type ? null : type);
  };

  // Icon button component
  const InfoButton = ({
    type,
    icon: Icon,
    label,
    color,
    disabled,
  }: {
    type: InfoType;
    icon: any;
    label: string;
    color: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && toggleInfo(type)}
      disabled={disabled}
      className={cn(
        'relative rounded-lg p-2 transition-all hover:bg-opacity-10',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:scale-110',
        activeInfo === type && `bg-opacity-20 ring-2 ring-offset-1`,
        color
      )}
      title={label}
      aria-label={label}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className={cn('relative', className)}>
      {/* Icon Buttons */}
      <div className="flex items-center gap-1">
        <InfoButton
          type="instructions"
          icon={Info}
          label="Form Cues"
          color="text-blue-600 hover:bg-blue-600 ring-blue-600"
          disabled={!instructions || instructions.length === 0}
        />
        <InfoButton
          type="muscles"
          icon={Activity}
          label="Muscles Worked"
          color="text-green-600 hover:bg-green-600 ring-green-600"
          disabled={!primaryMuscles}
        />
        <InfoButton
          type="modifications"
          icon={RefreshCw}
          label="Modifications"
          color="text-orange-600 hover:bg-orange-600 ring-orange-600"
          disabled={!modifications || modifications.length === 0}
        />
        <InfoButton
          type="mistakes"
          icon={AlertTriangle}
          label="Common Mistakes"
          color="text-red-600 hover:bg-red-600 ring-red-600"
          disabled={!commonMistakes || commonMistakes.length === 0}
        />
      </div>

      {/* Popover Content */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-800 shadow-2xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className={cn(
              'flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700',
              activeInfo === 'instructions' && 'bg-blue-50 dark:bg-blue-900/20',
              activeInfo === 'muscles' && 'bg-green-50 dark:bg-green-900/20',
              activeInfo === 'modifications' && 'bg-orange-50 dark:bg-orange-900/20',
              activeInfo === 'mistakes' && 'bg-red-50 dark:bg-red-900/20'
            )}>
              <h4 className={cn(
                'font-semibold text-sm flex items-center gap-2',
                activeInfo === 'instructions' && 'text-blue-900 dark:text-blue-100',
                activeInfo === 'muscles' && 'text-green-900 dark:text-green-100',
                activeInfo === 'modifications' && 'text-orange-900 dark:text-orange-100',
                activeInfo === 'mistakes' && 'text-red-900 dark:text-red-100'
              )}>
                {activeInfo === 'instructions' && <><Info size={16} /> Form Cues</>}
                {activeInfo === 'muscles' && <><Activity size={16} /> Muscles Worked</>}
                {activeInfo === 'modifications' && <><RefreshCw size={16} /> Modifications</>}
                {activeInfo === 'mistakes' && <><AlertTriangle size={16} /> Common Mistakes</>}
              </h4>
              <button
                onClick={() => setActiveInfo(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {activeInfo === 'instructions' && (
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {instructions.map((instruction, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{i + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeInfo === 'muscles' && (
                <div className="space-y-3 text-sm">
                  {primaryMuscles && (
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Primary:
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{primaryMuscles}</p>
                    </div>
                  )}
                  {secondaryMuscles && (
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Secondary:
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{secondaryMuscles}</p>
                    </div>
                  )}
                </div>
              )}

              {activeInfo === 'modifications' && (
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {modifications.map((mod, i) => (
                    <li key={i} className="flex gap-2">
                      <RefreshCw size={14} className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>
              )}

              {activeInfo === 'mistakes' && (
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex gap-2">
                      <AlertTriangle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
