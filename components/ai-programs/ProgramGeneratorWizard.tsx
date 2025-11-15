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

  // Real-time progress tracking
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [currentProgressStep, setCurrentProgressStep] = useState<number>(0);
  const [totalProgressSteps, setTotalProgressSteps] = useState<number>(0);
  const [progressLog, setProgressLog] = useState<string[]>([]);

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
    // Initialize progress tracking
    setProgressMessage('Submitting program request...');
    setProgressPercentage(0);
    setProgressLog(['Submitting program request...']);

    try {
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

      // Step 1: Submit generation request (returns immediately with program_id)
      const response = await fetch('/api/ai/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const { program_id } = await response.json();

      // Step 2: Poll for status every 2 seconds
      // Calculate timeout based on program size
      // Chunked generation: ~90s per 1-week chunk
      const estimatedChunks = Math.ceil(config.total_weeks / 1); // 1 week per chunk now
      const estimatedSeconds = 60 + (estimatedChunks * 90); // Base + chunks (90s per 1-week chunk)
      const maxPollAttempts = Math.max(120, Math.ceil(estimatedSeconds / 2)); // At least 4 minutes

      console.log(`⏱️  Polling timeout: ${maxPollAttempts * 2}s (estimated ${estimatedSeconds}s for ${estimatedChunks} chunks)`);

      let pollAttempts = 0;

      const pollInterval = setInterval(async () => {
        try {
          pollAttempts++;

          // Timeout after max attempts
          if (pollAttempts > maxPollAttempts) {
            clearInterval(pollInterval);
            console.error(`❌ Polling timeout after ${pollAttempts * 2} seconds`);
            throw new Error(`Generation is taking longer than expected (${Math.floor(maxPollAttempts * 2 / 60)} minutes). The program may still be generating in the background. Check your programs list in a few minutes.`);
          }

          const statusResponse = await fetch(`/api/ai-programs/${program_id}`);

          if (!statusResponse.ok) {
            clearInterval(pollInterval);
            throw new Error('Failed to check generation status');
          }

          const response = await statusResponse.json();
          // API returns { program: { ...fields } }, so we need to unwrap it
          const programData = response.program || response;

          // Extract real-time progress data
          const message = programData?.progress_message || 'Generating...';
          const percentage = programData?.progress_percentage || 0;
          const currentStep = programData?.current_step || 0;
          const totalSteps = programData?.total_steps || 0;

          // Update progress state
          setProgressMessage(message);
          setProgressPercentage(percentage);
          setCurrentProgressStep(currentStep);
          setTotalProgressSteps(totalSteps);

          // Add to progress log if message changed
          setProgressLog(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage !== message && message) {
              return [...prev, message];
            }
            return prev;
          });

          // Debug logging
          if (pollAttempts % 10 === 0) {
            console.log(`Poll #${pollAttempts}: status = ${programData?.generation_status}, progress = ${percentage}%, ${message}`);
          }

          if (programData?.generation_status === 'completed') {
            clearInterval(pollInterval);
            console.log('✅ Generation completed successfully');

            setGenerationResult({
              success: true,
              program_id: program_id,
              program: programData,
            });
            setCurrentStep('results');
          } else if (programData?.generation_status === 'failed') {
            clearInterval(pollInterval);
            console.error('❌ Generation failed:', programData.generation_error);
            throw new Error(programData.generation_error || 'Generation failed');
          }
        } catch (pollError) {
          clearInterval(pollInterval);
          throw pollError;
        }
      }, 2000); // Poll every 2 seconds

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

    // Reset progress tracking
    setProgressMessage(null);
    setProgressPercentage(0);
    setCurrentProgressStep(0);
    setTotalProgressSteps(0);
    setProgressLog([]);
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
        <GenerationProgress
          progressMessage={progressMessage}
          progressPercentage={progressPercentage}
          currentStep={currentProgressStep}
          totalSteps={totalProgressSteps}
          progressLog={progressLog}
        />
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
