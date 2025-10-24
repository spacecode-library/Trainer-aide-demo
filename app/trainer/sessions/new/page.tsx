"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useUserStore } from '@/lib/stores/user-store';
import { MOCK_CLIENTS } from '@/lib/mock-data';
import { getExerciseById } from '@/lib/mock-data';
import { generateId } from '@/lib/utils/generators';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SignOffMode, Client, WorkoutTemplate, SessionBlock } from '@/lib/types';
import { Play, FileText, User, Settings, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SIGN_OFF_MODES: { value: SignOffMode; label: string; description: string }[] = [
  {
    value: 'full_session',
    label: 'Full Session Sign-Off',
    description: 'Complete entire workout, then sign off at the end',
  },
  {
    value: 'per_block',
    label: 'Per Block Sign-Off',
    description: 'Sign off after completing each block',
  },
  {
    value: 'per_exercise',
    label: 'Per Exercise Sign-Off',
    description: 'Sign off after each individual exercise',
  },
];

function StartNewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templates = useTemplateStore((state) => state.templates);
  const currentUser = useUserStore((state) => state.currentUser);
  const startSession = useSessionStore((state) => state.startSession);
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedSignOffMode, setSelectedSignOffMode] = useState<SignOffMode>('full_session');
  const [clientSearch, setClientSearch] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Pre-fill client from calendar booking
  useEffect(() => {
    const clientId = searchParams?.get('clientId');
    if (clientId) {
      const client = MOCK_CLIENTS.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [searchParams]);

  const filteredClients = MOCK_CLIENTS.filter((client) =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleStart = () => {
    if (!selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Template Required",
        description: "Please select a workout template before starting the session.",
      });
      return;
    }

    // Create session blocks from template
    const sessionBlocks: SessionBlock[] = selectedTemplate.blocks.map((block) => ({
      id: generateId('session-block'),
      blockNumber: block.blockNumber,
      name: block.name,
      completed: false,
      exercises: block.exercises.map((templateExercise) => ({
        id: generateId('session-exercise'),
        exerciseId: templateExercise.exerciseId,
        position: templateExercise.position,
        muscleGroup: templateExercise.muscleGroup,
        resistanceType: templateExercise.resistanceType,
        resistanceValue: templateExercise.resistanceValue,
        repsMin: templateExercise.repsMin,
        repsMax: templateExercise.repsMax,
        sets: templateExercise.sets,
        cardioDuration: templateExercise.cardioDuration,
        cardioIntensity: templateExercise.cardioIntensity,
        actualReps: undefined,
        actualResistance: undefined,
        rpe: undefined,
        completed: false,
      })),
    }));

    const sessionId = startSession({
      trainerId: currentUser.id,
      clientId: selectedClient?.id,
      client: selectedClient || undefined,
      templateId: selectedTemplate.id,
      template: selectedTemplate,
      sessionName: `${selectedTemplate.name} - ${selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Walk-in'}`,
      signOffMode: selectedSignOffMode,
      blocks: sessionBlocks,
    });

    router.push(`/trainer/sessions/${sessionId}`);
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-heading-1 mb-2">Start New Session</h1>
        <p className="text-body-sm text-gray-600">
          Configure your training session in 3 simple steps
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-wondrous-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-wondrous-primary text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:inline">Template</span>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-wondrous-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-wondrous-primary text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:inline">Client</span>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-wondrous-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-wondrous-primary text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="text-sm font-medium hidden sm:inline">Sign-Off Mode</span>
        </div>
      </div>

      {/* Step 1: Select Template */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-wondrous-primary" size={24} />
            <h2 className="text-heading-2">Select Workout Template</h2>
          </div>

          {templates.map((template) => {
            const totalExercises = template.blocks.reduce((sum, block) => sum + block.exercises.length, 0);
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-2 border-wondrous-primary bg-blue-50/30' : 'hover:border-wondrous-blue'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        isSelected ? 'border-wondrous-primary bg-wondrous-primary' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <Badge variant={template.type === 'standard' ? 'default' : 'secondary'}>
                          {template.type === 'standard' ? 'Standard' : 'Resistance Only'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{template.blocks.length} Blocks</span>
                        <span>{totalExercises} Exercises</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
              className="flex-1 sm:flex-none"
            >
              Next: Select Client
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Client */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-wondrous-primary" size={24} />
            <h2 className="text-heading-2">Select Client</h2>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Walk-in Option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedClient === null ? 'border-2 border-wondrous-primary bg-blue-50/30' : 'hover:border-wondrous-blue'
            }`}
            onClick={() => setSelectedClient(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedClient === null ? 'border-wondrous-primary bg-wondrous-primary' : 'border-gray-300'
                  }`}
                >
                  {selectedClient === null && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Walk-in Client</h3>
                  <p className="text-sm text-gray-600">No client assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client List */}
          {filteredClients.map((client) => {
            const isSelected = selectedClient?.id === client.id;

            return (
              <Card
                key={client.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-2 border-wondrous-primary bg-blue-50/30' : 'hover:border-wondrous-blue'
                }`}
                onClick={() => setSelectedClient(client)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-wondrous-primary bg-wondrous-primary' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 sm:flex-none">
              Back
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1 sm:flex-none">
              Next: Sign-Off Mode
              <ChevronRight size={20} className="ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Sign-Off Mode */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="text-wondrous-primary" size={24} />
            <h2 className="text-heading-2">Choose Sign-Off Mode</h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Select how you want to track and sign off on this session
          </p>

          {SIGN_OFF_MODES.map((mode) => {
            const isSelected = selectedSignOffMode === mode.value;

            return (
              <Card
                key={mode.value}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-2 border-wondrous-primary bg-blue-50/30' : 'hover:border-wondrous-blue'
                }`}
                onClick={() => setSelectedSignOffMode(mode.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        isSelected ? 'border-wondrous-primary bg-wondrous-primary' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{mode.label}</h3>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Session Summary */}
          <Card className="bg-gray-50 border-gray-200 mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Template:</span>
                <span className="font-medium text-gray-900">{selectedTemplate?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium text-gray-900">
                  {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Walk-in'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sign-Off Mode:</span>
                <span className="font-medium text-gray-900">
                  {SIGN_OFF_MODES.find((m) => m.value === selectedSignOffMode)?.label}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 sm:flex-none">
              Back
            </Button>
            <Button onClick={handleStart} className="flex-1 sm:flex-none">
              <Play size={20} className="mr-2" />
              Start Session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StartNewSession() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <StartNewSessionContent />
    </Suspense>
  );
}
