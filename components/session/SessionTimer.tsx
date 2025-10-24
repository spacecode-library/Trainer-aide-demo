"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTimerStore } from '@/lib/stores/timer-store';

interface SessionTimerProps {
  sessionId: string;
  onTimeUp?: () => void;
  autoCompleteOnTimeUp?: boolean;
}

const TOTAL_SECONDS = 30 * 60; // 30 minutes

export function SessionTimer({ sessionId, onTimeUp, autoCompleteOnTimeUp = true }: SessionTimerProps) {
  const {
    sessionId: storedSessionId,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    getSecondsLeft,
    isTimerActive,
  } = useTimerStore();

  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  // Initialize timer for this session if not already started
  useEffect(() => {
    if (!isTimerActive() || storedSessionId !== sessionId) {
      startTimer(sessionId, TOTAL_SECONDS);
    }
  }, [sessionId, storedSessionId, isTimerActive, startTimer]);

  // Play sound using Web Audio API
  const playTimerEndSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create a beep sound (3 beeps)
      const beepCount = 3;
      const beepDuration = 0.15;
      const beepFrequency = 800;

      for (let i = 0; i < beepCount; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = beepFrequency;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + (i * 0.3);
        const endTime = startTime + beepDuration;

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      }
    } catch (error) {
      console.error('Failed to play timer end sound:', error);
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSecondsLeft = getSecondsLeft();
      setSecondsLeft(currentSecondsLeft);

      // Play sound and trigger callback when time is up
      if (currentSecondsLeft === 0 && !hasPlayedSound) {
        playTimerEndSound();
        setHasPlayedSound(true);
        if (autoCompleteOnTimeUp && onTimeUp) {
          onTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getSecondsLeft, hasPlayedSound, playTimerEndSound, onTimeUp, autoCompleteOnTimeUp]);

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleReset = () => {
    resetTimer();
    setHasPlayedSound(false);
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
    <div className="fixed lg:sticky top-14 lg:top-4 left-0 right-0 z-40 lg:mb-4 px-4 pt-2 lg:px-0 lg:pt-0 bg-gradient-to-b from-gray-50/95 via-gray-50/90 to-transparent dark:from-gray-900/95 dark:via-gray-900/90 lg:bg-none pb-2 lg:pb-0">
      <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border-2 border-gray-300 dark:border-gray-600 shadow-lg">
        <CardContent className="p-2.5 lg:p-4">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            {/* Timer Display */}
            <div className="flex items-center gap-1.5 lg:gap-3">
              <Clock className="text-gray-600 dark:text-gray-400 flex-shrink-0" size={18} />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium hidden sm:block leading-tight">Session Timer</p>
                <p className={cn('text-lg lg:text-2xl font-bold tabular-nums leading-tight', getTimerColor())}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 lg:gap-2">
              {!isPaused ? (
                <Button onClick={handlePause} size="sm" variant="outline" className="gap-1 lg:gap-2 h-7 lg:h-9 px-2 lg:px-3">
                  <Pause size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline text-xs lg:text-sm">Pause</span>
                </Button>
              ) : (
                <Button onClick={handleResume} size="sm" className="gap-1 lg:gap-2 h-7 lg:h-9 px-2 lg:px-3">
                  <Play size={14} className="lg:w-4 lg:h-4" />
                  <span className="hidden sm:inline text-xs lg:text-sm">Resume</span>
                </Button>
              )}
              <Button onClick={handleReset} size="sm" variant="outline" className="gap-1 lg:gap-2 h-7 lg:h-9 px-2 lg:px-3">
                <RotateCcw size={14} className="lg:w-4 lg:h-4" />
                <span className="hidden sm:inline text-xs lg:text-sm">Reset</span>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-1.5 lg:mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 lg:h-2 overflow-hidden">
            <div
              className={cn('h-full transition-all duration-1000 ease-linear', getProgressColor())}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Time Up Warning */}
          {secondsLeft === 0 && (
            <div className="mt-1.5 lg:mt-3 p-1.5 lg:p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-xs lg:text-sm font-medium text-red-800 dark:text-red-300 text-center leading-tight">
                ⏰ Time&apos;s up! {autoCompleteOnTimeUp ? 'Session auto-completing...' : 'Please complete your session.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
