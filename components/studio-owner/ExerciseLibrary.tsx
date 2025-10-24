"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_EXERCISES, getExercisesByCategory } from '@/lib/mock-data';
import { Exercise, MuscleGroup } from '@/lib/types';
import { Search, Dumbbell } from 'lucide-react';

interface ExerciseLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  filterCardioOnly?: boolean;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'cardio',
  'chest',
  'back',
  'legs',
  'core',
  'shoulders',
  'biceps',
  'triceps',
  'stretch',
];

export function ExerciseLibrary({
  open,
  onClose,
  onSelect,
  filterCardioOnly = false,
}: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MuscleGroup | 'all'>('all');

  const filteredExercises = MOCK_EXERCISES.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesCardioFilter = !filterCardioOnly || exercise.category === 'cardio';
    return matchesSearch && matchesCategory && matchesCardioFilter;
  });

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Exercise Library</DialogTitle>
          <DialogDescription>
            {filterCardioOnly
              ? 'Select a cardio exercise (required for first position)'
              : 'Browse and select exercises for your template'}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        {!filterCardioOnly && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {MUSCLE_GROUPS.map((group) => (
              <Button
                key={group}
                variant={selectedCategory === group ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(group)}
                className="capitalize"
              >
                {group}
              </Button>
            ))}
          </div>
        )}

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-wondrous-blue hover:bg-blue-50/50 cursor-pointer transition-colors"
              onClick={() => handleSelect(exercise)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                    <Badge variant="outline" className="capitalize">
                      {exercise.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {exercise.level}
                    </Badge>
                  </div>
                  {exercise.equipment && (
                    <p className="text-sm text-gray-600 mb-2">
                      Equipment: {exercise.equipment}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {exercise.instructions[0]}
                  </p>
                </div>
                <Button size="sm" onClick={() => handleSelect(exercise)}>
                  Add
                </Button>
              </div>
            </div>
          ))}

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">No exercises found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
