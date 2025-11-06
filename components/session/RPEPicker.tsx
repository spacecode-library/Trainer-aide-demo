"use client";

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

interface RPEPickerProps {
  value: number | undefined;
  onChange: (value: number) => void;
  label?: string;
  required?: boolean;
}

const RPE_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const RPE_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 border-green-300',
  2: 'bg-green-100 text-green-800 border-green-300',
  3: 'bg-green-200 text-green-900 border-green-400',
  4: 'bg-lime-200 text-lime-900 border-lime-400',
  5: 'bg-yellow-200 text-yellow-900 border-yellow-400',
  6: 'bg-yellow-300 text-yellow-900 border-yellow-500',
  7: 'bg-orange-200 text-orange-900 border-orange-400',
  8: 'bg-orange-300 text-orange-900 border-orange-500',
  9: 'bg-red-300 text-red-900 border-red-500',
  10: 'bg-red-400 text-red-900 border-red-600',
};

export function RPEPicker({ value, onChange, label = 'Rate of Perceived Exertion (RPE)', required = false }: RPEPickerProps) {
  return (
    <div className="space-y-3">
      <Label className="dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {RPE_SCALE.map((rpe) => (
          <button
            key={rpe}
            type="button"
            onClick={() => onChange(rpe)}
            className={cn(
              'h-12 sm:h-14 rounded-lg border-2 font-bold text-lg transition-all touch-manipulation',
              'hover:scale-105 active:scale-95',
              value === rpe
                ? `${RPE_COLORS[rpe]} ring-2 ring-offset-2 ring-wondrous-primary scale-110`
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
            )}
          >
            {rpe}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Very Easy</span>
        <span>Maximum Effort</span>
      </div>
    </div>
  );
}
