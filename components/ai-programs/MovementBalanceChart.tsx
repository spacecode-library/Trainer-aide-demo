'use client';

import type { MovementBalanceSummary } from '@/lib/types/ai-program';

interface MovementBalanceChartProps {
  balance: MovementBalanceSummary | null;
}

export function MovementBalanceChart({ balance }: MovementBalanceChartProps) {
  if (!balance) return null;

  // Filter out undefined values
  const filteredBalance = Object.entries(balance)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .reduce((acc, [pattern, count]) => {
      acc[pattern] = count;
      return acc;
    }, {} as Record<string, number>);

  // Calculate max value for scaling
  const maxValue = Math.max(...Object.values(filteredBalance));

  const getPatternLabel = (pattern: string) => {
    const labels: Record<string, string> = {
      push_horizontal: 'Push (Horizontal)',
      pull_horizontal: 'Pull (Horizontal)',
      push_vertical: 'Push (Vertical)',
      pull_vertical: 'Pull (Vertical)',
      squat: 'Squat',
      hinge: 'Hinge',
      lunge: 'Lunge',
      core: 'Core',
      mobility: 'Mobility',
      carry: 'Carry',
    };
    return labels[pattern] || pattern.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-3">
      {Object.entries(filteredBalance).map(([pattern, count]) => {
        const percentage = (count / maxValue) * 100;

        return (
          <div key={pattern} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {getPatternLabel(pattern)}
              </span>
              <span className="text-sm font-semibold text-wondrous-magenta">
                {count}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-wondrous-magenta h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
