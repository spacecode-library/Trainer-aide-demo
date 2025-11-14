'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { ClientProfile } from '@/lib/types/client-profile';
import type { ProgramConfig } from './ProgramGeneratorWizard';

interface ProgramConfigurationProps {
  client: ClientProfile | null;
  onSubmit: (config: ProgramConfig) => void;
  onBack: () => void;
}

export function ProgramConfiguration({ client, onSubmit, onBack }: ProgramConfigurationProps) {
  // Program structure
  const [programName, setProgramName] = useState(
    client
      ? `${client.first_name}'s Training Program`
      : 'Custom Training Program'
  );
  const [totalWeeks, setTotalWeeks] = useState(client?.preferred_training_frequency ? 8 : 4);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(client?.preferred_training_frequency || 3);
  const [sessionDuration, setSessionDuration] = useState(client?.preferred_session_duration_minutes || 45);

  // Client parameters (if no client)
  const [primaryGoal, setPrimaryGoal] = useState<ProgramConfig['primary_goal']>(
    client?.primary_goal as any || 'hypertrophy'
  );
  const [experienceLevel, setExperienceLevel] = useState<ProgramConfig['experience_level']>(
    client?.experience_level as any || 'beginner'
  );
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(
    client?.available_equipment || ['dumbbells']
  );
  const [injuries, setInjuries] = useState<string[]>(
    client?.injuries?.map(inj => inj.description) || []
  );
  const [newInjury, setNewInjury] = useState('');

  // Optional
  const [includeNutrition, setIncludeNutrition] = useState(false);

  const equipmentOptions = [
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'bench', label: 'Bench' },
    { value: 'squat_rack', label: 'Squat Rack' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' },
    { value: 'cable', label: 'Cable Machine' },
    { value: 'kettlebell', label: 'Kettlebells' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'bodyweight', label: 'Bodyweight Only' },
  ];

  const handleEquipmentToggle = (equipment: string) => {
    setAvailableEquipment((prev) =>
      prev.includes(equipment)
        ? prev.filter((e) => e !== equipment)
        : [...prev, equipment]
    );
  };

  const handleAddInjury = () => {
    if (newInjury.trim()) {
      setInjuries((prev) => [...prev, newInjury.trim()]);
      setNewInjury('');
    }
  };

  const handleRemoveInjury = (index: number) => {
    setInjuries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: ProgramConfig = {
      program_name: programName,
      total_weeks: totalWeeks,
      sessions_per_week: sessionsPerWeek,
      session_duration_minutes: sessionDuration,
      include_nutrition: includeNutrition,
    };

    // Add client params if no client selected
    if (!client) {
      config.primary_goal = primaryGoal;
      config.experience_level = experienceLevel;
      config.available_equipment = availableEquipment;
      config.injuries = injuries;
    }

    onSubmit(config);
  };

  const isFormValid = () => {
    if (!programName.trim()) return false;
    if (!client && availableEquipment.length === 0) return false;
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Profile Preview (if client selected) */}
      {client && (
        <Card className="bg-purple-50/50 dark:bg-purple-900/20 border-wondrous-magenta">
          <CardHeader>
            <CardTitle className="text-base">Client Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Goal:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {client.primary_goal}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Experience:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {client.experience_level}
                </span>
              </div>
            </div>
            {client.available_equipment && client.available_equipment.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Equipment:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {client.available_equipment.join(', ')}
                </span>
              </div>
            )}
            {client.injuries && client.injuries.length > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Injuries/Restrictions:</span>{' '}
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {client.injuries.map(inj => inj.description).join(', ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Parameters (if no client) */}
      {!client && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal *</Label>
                <select
                  id="goal"
                  value={primaryGoal}
                  onChange={(e) => setPrimaryGoal(e.target.value as any)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="strength">Strength</option>
                  <option value="hypertrophy">Muscle Gain (Hypertrophy)</option>
                  <option value="endurance">Endurance</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level *</Label>
                <select
                  id="experience"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Equipment * (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={availableEquipment.includes(option.value)}
                      onCheckedChange={() => handleEquipmentToggle(option.value)}
                    />
                    <label
                      htmlFor={option.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              {availableEquipment.length === 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please select at least one equipment option
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="injury">Injuries/Restrictions (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="injury"
                  value={newInjury}
                  onChange={(e) => setNewInjury(e.target.value)}
                  placeholder="e.g., lower back pain, shoulder issues"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInjury();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddInjury}>
                  Add
                </Button>
              </div>
              {injuries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {injuries.map((injury, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm"
                    >
                      {injury}
                      <button
                        type="button"
                        onClick={() => handleRemoveInjury(index)}
                        className="hover:text-orange-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Program Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programName">Program Name *</Label>
            <Input
              id="programName"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g., 8-Week Strength Builder"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <select
                id="duration"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value={2}>2 weeks</option>
                <option value={4}>4 weeks</option>
                <option value={6}>6 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <select
                id="frequency"
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value={2}>2x per week</option>
                <option value={3}>3x per week</option>
                <option value={4}>4x per week</option>
                <option value={5}>5x per week</option>
                <option value={6}>6x per week</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDuration">Session Duration *</Label>
            <select
              id="sessionDuration"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={75}>75 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Optional Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Optional Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nutrition"
              checked={includeNutrition}
              onCheckedChange={(checked) => setIncludeNutrition(checked as boolean)}
            />
            <label
              htmlFor="nutrition"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Include nutrition guidance
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid()}
          className="bg-wondrous-primary hover:bg-purple-700 text-white"
        >
          Generate Program →
        </Button>
      </div>
    </form>
  );
}
