"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import { getExerciseById } from '@/lib/mock-data';
import { generateId } from '@/lib/utils/generators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseLibrary } from '@/components/studio-owner/ExerciseLibrary';
import { WorkoutTemplate, WorkoutBlock, TemplateExercise, Exercise, TemplateType } from '@/lib/types';
import { Plus, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function TemplateBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');
  const { toast } = useToast();

  const { templates, addTemplate, updateTemplate } = useTemplateStore();

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('standard');
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([
    { id: generateId('block'), blockNumber: 1, name: 'Block 1', exercises: [] },
    { id: generateId('block'), blockNumber: 2, name: 'Block 2', exercises: [] },
    { id: generateId('block'), blockNumber: 3, name: 'Block 3', exercises: [] },
  ]);

  // Exercise library modal state
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const [requireCardio, setRequireCardio] = useState(false);

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setTemplateName(template.name);
        setDescription(template.description);
        setTemplateType(template.type);
        setBlocks(template.blocks);
      }
    }
  }, [templateId, templates]);

  const handleAddBlock = () => {
    const newBlock: WorkoutBlock = {
      id: generateId('block'),
      blockNumber: blocks.length + 1,
      name: `Block ${blocks.length + 1}`,
      exercises: [],
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleRemoveBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      toast({
        variant: "warning",
        title: "Cannot remove block",
        description: "You must have at least one block in your template.",
      });
      return;
    }
    setBlocks(blocks.filter(b => b.id !== blockId).map((b, index) => ({
      ...b,
      blockNumber: index + 1,
      name: `Block ${index + 1}`,
    })));
  };

  const handleOpenExerciseLibrary = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Check if this is the first exercise and template is standard
    const isFirstExercise = block.exercises.length === 0;
    const needsCardio = templateType === 'standard' && isFirstExercise;

    setCurrentBlockId(blockId);
    setRequireCardio(needsCardio);
    setShowExerciseLibrary(true);
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!currentBlockId) return;

    const newExercise: TemplateExercise = {
      id: generateId('exercise'),
      exerciseId: exercise.id,
      position: blocks.find(b => b.id === currentBlockId)!.exercises.length + 1,
      muscleGroup: exercise.category,
      resistanceType: exercise.category === 'cardio' || exercise.category === 'stretch' ? 'bodyweight' : 'weight',
      resistanceValue: exercise.category === 'cardio' || exercise.category === 'stretch' ? 0 : 20,
      repsMin: exercise.category === 'cardio' || exercise.category === 'stretch' ? 0 : 10,
      repsMax: exercise.category === 'cardio' || exercise.category === 'stretch' ? 0 : 15,
      sets: 2,
      cardioDuration: exercise.category === 'cardio' ? 180 : exercise.category === 'stretch' ? 30 : undefined,
      cardioIntensity: exercise.category === 'cardio' ? 7 : exercise.category === 'stretch' ? 2 : undefined,
    };

    setBlocks(blocks.map(b =>
      b.id === currentBlockId
        ? { ...b, exercises: [...b.exercises, newExercise] }
        : b
    ));

    setShowExerciseLibrary(false);
    setCurrentBlockId(null);
  };

  const handleRemoveExercise = (blockId: string, exerciseId: string) => {
    setBlocks(blocks.map(b =>
      b.id === blockId
        ? {
            ...b,
            exercises: b.exercises.filter(e => e.id !== exerciseId).map((e, index) => ({
              ...e,
              position: index + 1,
            })),
          }
        : b
    ));
  };

  const handleMoveExercise = (blockId: string, exerciseId: string, direction: 'up' | 'down') => {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;

      const exercises = [...b.exercises];
      const currentIndex = exercises.findIndex(e => e.id === exerciseId);

      if (currentIndex === -1) return b;
      if (direction === 'up' && currentIndex === 0) return b;
      if (direction === 'down' && currentIndex === exercises.length - 1) return b;

      // For standard templates, don't allow moving cardio from first position
      if (templateType === 'standard' && currentIndex === 0 && direction === 'down') {
        toast({
          variant: "warning",
          title: "Cardio must be first",
          description: "In standard templates, cardio must remain as the first exercise in each block.",
        });
        return b;
      }
      if (templateType === 'standard' && currentIndex === 1 && direction === 'up' && exercises[0].muscleGroup === 'cardio') {
        toast({
          variant: "warning",
          title: "Cardio must be first",
          description: "In standard templates, cardio must remain as the first exercise in each block.",
        });
        return b;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [exercises[currentIndex], exercises[newIndex]] = [exercises[newIndex], exercises[currentIndex]];

      return {
        ...b,
        exercises: exercises.map((e, index) => ({ ...e, position: index + 1 })),
      };
    }));
  };

  const handleSave = () => {
    // Validation
    if (!templateName.trim()) {
      toast({
        variant: "destructive",
        title: "Template name required",
        description: "Please enter a name for your template before saving.",
      });
      return;
    }

    if (blocks.some(b => b.exercises.length === 0)) {
      toast({
        variant: "destructive",
        title: "Empty blocks found",
        description: "Each block must have at least one exercise. Please add exercises to all blocks.",
      });
      return;
    }

    // Check cardio requirement for standard templates
    if (templateType === 'standard') {
      const hasCardioFirst = blocks.every(b => b.exercises.length > 0 && b.exercises[0].muscleGroup === 'cardio');
      if (!hasCardioFirst) {
        toast({
          variant: "destructive",
          title: "Cardio required",
          description: "Standard templates must have cardio as the first exercise in each block.",
        });
        return;
      }
    }

    const template: WorkoutTemplate = {
      id: templateId || generateId('template'),
      name: templateName,
      description,
      type: templateType,
      createdBy: 'user_owner_1',
      assignedStudios: ['studio_1'], // Default, can be updated later
      blocks,
      createdAt: templateId ? templates.find(t => t.id === templateId)!.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (templateId) {
      updateTemplate(templateId, template);
    } else {
      addTemplate(template);
    }

    router.push('/studio-owner/templates');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-4 lg:mb-8">
        {/* Title and Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-4 lg:mb-6">
          <h1 className="text-xl lg:text-heading-1 font-bold text-gray-900 dark:text-gray-100 flex-1 min-w-0">
            {templateId ? 'Edit Template' : 'Create Template'}
          </h1>

          {/* Action Buttons - Compact on mobile, full on desktop */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => router.back()}
              size="sm"
              className="gap-1.5 lg:gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <X size={16} className="lg:w-[18px] lg:h-[18px]" />
              <span className="text-xs lg:text-sm">Cancel</span>
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="gap-1.5 lg:gap-2 bg-wondrous-magenta hover:bg-wondrous-magenta-dark"
            >
              <Save size={16} className="lg:w-[18px] lg:h-[18px]" />
              <span className="text-xs lg:text-sm">Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Template Details */}
      <Card className="mb-4 lg:mb-6 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base lg:text-lg dark:text-gray-100">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm dark:text-gray-200">Template Name *</Label>
            <Input
              id="name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., =Results First Session"
              className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm dark:text-gray-200">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this workout template"
              rows={3}
              className="mt-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <div>
            <Label className="text-sm dark:text-gray-200">Template Type *</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  value="standard"
                  checked={templateType === 'standard'}
                  onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                  className="w-4 h-4 text-wondrous-primary"
                />
                <span className="text-xs lg:text-sm dark:text-gray-200">Standard 3-Block (with cardio)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  value="resistance_only"
                  checked={templateType === 'resistance_only'}
                  onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                  className="w-4 h-4 text-wondrous-primary"
                />
                <span className="text-xs lg:text-sm dark:text-gray-200">Resistance Only (no cardio required)</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <div className="space-y-4 lg:space-y-6 mb-4 lg:mb-6">
        {blocks.map((block, blockIndex) => {
          const isFirstBlock = blockIndex === 0;
          const isLastBlock = blockIndex === blocks.length - 1;

          return (
            <Card key={block.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base lg:text-lg dark:text-gray-100">{block.name}</CardTitle>
                  {blocks.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveBlock(block.id)}
                      className="text-red-600 hover:text-red-700 dark:border-gray-600 text-xs flex-shrink-0"
                    >
                      <Trash2 size={14} className="mr-1" />
                      <span className="hidden sm:inline">Remove</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Exercises List */}
                <div className="space-y-2 lg:space-y-3 mb-4">
                  {block.exercises.length === 0 && (
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No exercises added yet. Click &quot;Add Exercise&quot; below.
                    </p>
                  )}

                  {block.exercises.map((templateExercise, exerciseIndex) => {
                    const exercise = getExerciseById(templateExercise.exerciseId);
                    if (!exercise) return null;

                    const isFirst = exerciseIndex === 0;
                    const isLast = exerciseIndex === block.exercises.length - 1;

                    return (
                      <div key={templateExercise.id} className="flex items-start gap-2 p-2 lg:p-3 border border-gray-200 dark:border-gray-600 rounded-lg dark:bg-gray-700/50">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveExercise(block.id, templateExercise.id, 'up')}
                            disabled={isFirst}
                            className="h-6 w-6 p-0 dark:hover:bg-gray-600"
                          >
                            <ChevronUp size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveExercise(block.id, templateExercise.id, 'down')}
                            disabled={isLast}
                            className="h-6 w-6 p-0 dark:hover:bg-gray-600"
                          >
                            <ChevronDown size={14} />
                          </Button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm lg:text-base dark:text-gray-100 truncate">{exercise.name}</span>
                            <Badge variant="outline" className="capitalize text-xs dark:border-gray-500">
                              {templateExercise.muscleGroup}
                            </Badge>
                          </div>
                          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                            {templateExercise.muscleGroup === 'cardio' ? (
                              <span>
                                {Math.floor((templateExercise.cardioDuration || 0) / 60)} min • Intensity {templateExercise.cardioIntensity}/10
                              </span>
                            ) : templateExercise.muscleGroup === 'stretch' ? (
                              <span>
                                {templateExercise.cardioDuration}s hold
                              </span>
                            ) : (
                              <span>
                                {templateExercise.resistanceValue}kg • {templateExercise.repsMin}-{templateExercise.repsMax} reps • {templateExercise.sets} sets
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(block.id, templateExercise.id)}
                          className="text-red-600 hover:text-red-700 dark:hover:bg-red-900/20 flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Exercise Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => handleOpenExerciseLibrary(block.id)}
                >
                  <Plus size={18} />
                  <span>Add Exercise</span>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Block Button */}
      <Button
        variant="outline"
        className="w-full py-4 lg:py-6 border-2 border-dashed gap-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        onClick={handleAddBlock}
      >
        <Plus size={18} />
        <span>Add Another Block</span>
      </Button>

      {/* Exercise Library Modal */}
      <ExerciseLibrary
        open={showExerciseLibrary}
        onClose={() => {
          setShowExerciseLibrary(false);
          setCurrentBlockId(null);
        }}
        onSelect={handleAddExercise}
        filterCardioOnly={requireCardio}
      />
    </div>
  );
}

export default function TemplateBuilder() {
  return (
    <Suspense fallback={<div className="p-4 lg:p-8 max-w-7xl mx-auto">Loading...</div>}>
      <TemplateBuilderContent />
    </Suspense>
  );
}
