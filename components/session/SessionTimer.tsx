"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SessionTimerProps {
  onTimeUp?: () => void;
  autoCompleteOnTimeUp?: boolean;
}

const TOTAL_SECONDS = 30 * 60; // 30 minutes

export function SessionTimer({ onTimeUp, autoCompleteOnTimeUp = true }: SessionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(true); // Auto-start
  const [hasStarted, setHasStarted] = useState(true); // Auto-started

  // Auto-start timer on mount
  useEffect(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (autoCompleteOnTimeUp && onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onTimeUp, autoCompleteOnTimeUp]);

  const handleStart = () => {
    setIsRunning(true);
    setHasStarted(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
    setHasStarted(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercentage = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  const getTimerColor = () => {
    if (secondsLeft > 600) return 'text-green-600'; // > 10 min
    if (secondsLeft > 300) return 'text-yellow-600'; // > 5 min
    if (secondsLeft > 60) return 'text-orange-600'; // > 1 min
    return 'text-red-600'; // < 1 min
  };

  const getProgressColor = () => {
    if (secondsLeft > 600) return 'bg-green-500'; // > 10 min
    if (secondsLeft > 300) return 'bg-yellow-500'; // > 5 min
    if (secondsLeft > 60) return 'bg-orange-500'; // > 1 min
    return 'bg-red-500'; // < 1 min
  };

  return (
    <div className="sticky top-0 lg:top-4 z-50 mb-4">
      <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-2 lg:gap-3">
              <Clock className="text-gray-600 dark:text-gray-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium hidden sm:block">Session Timer</p>
                <p className={cn('text-xl lg:text-2xl font-bold tabular-nums', getTimerColor())}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 lg:gap-2">
              {isRunning ? (
                <Button onClick={handlePause} size="sm" variant="outline" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <Pause size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline text-xs lg:text-sm">Pause</span>
                </Button>
              ) : (
                <Button onClick={handleStart} size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9">
                  <Play size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline text-xs lg:text-sm">Resume</span>
                </Button>
              )}
              <Button onClick={handleReset} size="sm" variant="outline" className="gap-1 lg:gap-2 h-8 lg:h-9">
                <RotateCcw size={14} className="lg:w-4 lg:h-4" />
                <span className="hidden sm:inline text-xs lg:text-sm">Reset</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 lg:mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 lg:h-2 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-1000 ease-linear', getProgressColor())}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Time Up Warning */}
          {secondsLeft === 0 && (
            <div className="mt-2 lg:mt-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-xs lg:text-sm font-medium text-red-800 dark:text-red-300 text-center">
                ⏰ Time&apos;s up! {autoCompleteOnTimeUp ? 'Session auto-completing...' : 'Please complete your session.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
