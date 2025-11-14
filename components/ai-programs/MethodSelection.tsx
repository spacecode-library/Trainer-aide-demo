'use client';

import { Sparkles, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { GenerationMethod } from './ProgramGeneratorWizard';

interface MethodSelectionProps {
  selectedMethod: GenerationMethod;
  onSelect: (method: 'ai' | 'manual') => void;
  onCancel: () => void;
}

export function MethodSelection({ selectedMethod, onSelect, onCancel }: MethodSelectionProps) {
  const handleMethodClick = (method: 'ai' | 'manual') => {
    onSelect(method);
  };

  return (
    <div className="space-y-6">
      {/* Selection Cards */}
      <div className="space-y-4">
        {/* AI-Generated Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'ai'
              ? 'border-2 border-wondrous-magenta bg-purple-50/50 dark:bg-purple-900/20'
              : 'hover:border-wondrous-magenta dark:hover:border-purple-400'
          }`}
          onClick={() => handleMethodClick('ai')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedMethod === 'ai'
                    ? 'border-wondrous-magenta bg-wondrous-magenta'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedMethod === 'ai' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-wondrous-magenta" size={24} />
                  <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
                    AI-Generated Program
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Let Claude Sonnet 4.5 create a personalized, science-backed program
                  based on client goals and available equipment.
                </p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-wondrous-magenta">•</span>
                    Takes ~2 minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-wondrous-magenta">•</span>
                    Fully customizable after generation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-wondrous-magenta">•</span>
                    Includes movement balance and AI rationale
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-wondrous-magenta">•</span>
                    Cost: ~$0.15 per program
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Option */}
        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'manual'
              ? 'border-2 border-wondrous-magenta bg-purple-50/50 dark:bg-purple-900/20'
              : 'hover:border-wondrous-magenta dark:hover:border-purple-400'
          }`}
          onClick={() => handleMethodClick('manual')}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedMethod === 'manual'
                    ? 'border-wondrous-magenta bg-wondrous-magenta'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedMethod === 'manual' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-gray-600 dark:text-gray-400" size={24} />
                  <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-gray-100">
                    Manual Program
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Build a program from scratch with full control over every exercise,
                  set, and rep.
                </p>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Complete creative control
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    No AI costs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Uses existing session builder
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedMethod && onSelect(selectedMethod)}
          disabled={!selectedMethod}
          className="bg-wondrous-primary hover:bg-purple-700 text-white"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
