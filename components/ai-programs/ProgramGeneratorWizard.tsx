'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/user-store';
import { MethodSelection } from './MethodSelection';
import { ClientSelection } from './ClientSelection';
import { ProgramConfiguration } from './ProgramConfiguration';
import { GenerationProgress } from './GenerationProgress';
import { GenerationResults } from './GenerationResults';
import type { ClientProfile } from '@/lib/types/client-profile';

export type WizardStep = 'method' | 'client' | 'configure' | 'generating' | 'results';
export type GenerationMethod = 'ai' | 'manual' | null;

export interface ProgramConfig {
  // Program structure
  program_name: string;
  total_weeks: number;
  sessions_per_week: number;
  session_duration_minutes: number;

  // Client info (if no client selected)
  primary_goal?: 'strength' | 'hypertrophy' | 'endurance' | 'fat_loss' | 'general_fitness';
  experience_level?: 'beginner' | 'intermediate' | 'advanced';
  available_equipment?: string[];
  injuries?: string[];
  exercise_aversions?: string[];

  // Optional
  include_nutrition?: boolean;
}

export interface GenerationResult {
  success: boolean;
  program_id?: string;
  program?: any;
  workouts_count?: number;
  exercises_count?: number;
  generation_log?: {
    tokens_used: number;
    input_tokens: number;
    output_tokens: number;
    cost_usd: number;
    latency_ms: number;
  };
  filtering_stats?: any;
  error?: string;
}

export function ProgramGeneratorWizard() {
  const router = useRouter();
  const { currentUser } = useUserStore();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('method');
  const [method, setMethod] = useState<GenerationMethod>(null);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [programConfig, setProgramConfig] = useState<ProgramConfig | null>(null);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [progress, setProgress] = useState<string[]>([]);

  // Navigation handlers
  const handleMethodSelect = (selectedMethod: 'ai' | 'manual') => {
    setMethod(selectedMethod);
    if (selectedMethod === 'manual') {
      // Redirect to manual template builder
      router.push('/trainer/sessions/new');
    } else {
      // Continue to client selection
      setCurrentStep('client');
    }
  };

  const handleClientSelect = (client: ClientProfile | null) => {
    setSelectedClient(client);
    setCurrentStep('configure');
  };

  const handleConfigSubmit = (config: ProgramConfig) => {
    setProgramConfig(config);
    setCurrentStep('generating');
    startGeneration(config);
  };

  const startGeneration = async (config: ProgramConfig) => {
    setProgress(['Filtering exercises...']);

    try {
      // Simulate progress updates (API call is one-shot)
      setTimeout(() => setProgress(prev => [...prev, 'Analyzing movement patterns...']), 5000);
      setTimeout(() => setProgress(prev => [...prev, 'Generating workouts...']), 30000);
      setTimeout(() => setProgress(prev => [...prev, 'Saving to database...']), 80000);

      // Prepare API request
      const requestBody = {
        trainer_id: currentUser.id,
        client_profile_id: selectedClient?.id || null,
        program_name: config.program_name,
        total_weeks: config.total_weeks,
        sessions_per_week: config.sessions_per_week,
        session_duration_minutes: config.session_duration_minutes,

        // If no client, use manual params
        ...(selectedClient ? {} : {
          primary_goal: config.primary_goal,
          experience_level: config.experience_level,
          available_equipment: config.available_equipment,
          injuries: config.injuries || [],
          exercise_aversions: config.exercise_aversions || [],
        }),
      };

      const response = await fetch('/api/ai/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const result = await response.json();
      setGenerationResult(result);
      setCurrentStep('results');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationResult({
        success: false,
        error: errorMessage,
      });
      setCurrentStep('results');
    }
  };

  const handleCreateAnother = () => {
    // Reset wizard
    setCurrentStep('method');
    setMethod(null);
    setSelectedClient(null);
    setProgramConfig(null);
    setGenerationResult(null);
    setProgress([]);
  };

  const handleViewProgram = () => {
    if (generationResult?.program_id) {
      router.push(`/trainer/programs/${generationResult.program_id}`);
    }
  };

  const handleCancel = () => {
    router.push('/trainer/programs');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'client':
        setCurrentStep('method');
        break;
      case 'configure':
        setCurrentStep('client');
        break;
      default:
        handleCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
          Create Training Program
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {currentStep === 'method' && 'Choose how you want to create your program'}
          {currentStep === 'client' && 'Select a client or use custom parameters'}
          {currentStep === 'configure' && 'Configure program details'}
          {currentStep === 'generating' && 'Generating your program...'}
          {currentStep === 'results' && (generationResult?.success ? 'Program generated successfully!' : 'Generation failed')}
        </p>
      </div>

      {/* Step Content */}
      {currentStep === 'method' && (
        <MethodSelection
          selectedMethod={method}
          onSelect={handleMethodSelect}
          onCancel={handleCancel}
        />
      )}

      {currentStep === 'client' && (
        <ClientSelection
          selectedClient={selectedClient}
          onSelect={handleClientSelect}
          onBack={handleBack}
        />
      )}

      {currentStep === 'configure' && (
        <ProgramConfiguration
          client={selectedClient}
          onSubmit={handleConfigSubmit}
          onBack={handleBack}
        />
      )}

      {currentStep === 'generating' && (
        <GenerationProgress progress={progress} />
      )}

      {currentStep === 'results' && generationResult && (
        <GenerationResults
          result={generationResult}
          onCreateAnother={handleCreateAnother}
          onViewProgram={handleViewProgram}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
