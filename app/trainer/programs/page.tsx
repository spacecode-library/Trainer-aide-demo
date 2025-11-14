'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProgramCard } from '@/components/ai-programs/ProgramCard';
import type { AIProgram } from '@/lib/types/ai-program';

type FilterType = 'all' | 'draft' | 'active' | 'completed' | 'archived';

export default function ProgramsListPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<AIProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    async function fetchPrograms() {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await fetch('/api/programs');
        // const data = await response.json();

        // Mock data for now
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockPrograms: AIProgram[] = [
          {
            id: '1',
            trainer_id: 'trainer-1',
            client_profile_id: '1',
            program_name: "Sarah's 8-Week Muscle Builder",
            description: 'Hypertrophy-focused program for beginner trainee',
            total_weeks: 8,
            sessions_per_week: 3,
            session_duration_minutes: 45,
            primary_goal: 'hypertrophy',
            experience_level: 'beginner',
            ai_model: 'claude-sonnet-4-5-20250929',
            movement_balance_summary: {
              push_horizontal: 18,
              pull_horizontal: 18,
              push_vertical: 12,
              squat: 12,
              lunge: 12,
              core: 24,
            },
            status: 'draft',
            created_at: '2025-11-14T10:30:00Z',
            updated_at: '2025-11-14T10:30:00Z',
          },
          {
            id: '2',
            trainer_id: 'trainer-1',
            client_profile_id: '2',
            program_name: "Mike's 12-Week Strength Block",
            description: 'Progressive strength development with full gym access',
            total_weeks: 12,
            sessions_per_week: 4,
            session_duration_minutes: 60,
            primary_goal: 'strength',
            experience_level: 'intermediate',
            ai_model: 'claude-sonnet-4-5-20250929',
            movement_balance_summary: {
              push_horizontal: 24,
              pull_horizontal: 24,
              squat: 16,
              hinge: 16,
              core: 12,
            },
            status: 'active',
            created_at: '2025-11-10T14:20:00Z',
            updated_at: '2025-11-14T08:15:00Z',
          },
          {
            id: '3',
            trainer_id: 'trainer-1',
            client_profile_id: '3',
            program_name: "Emily's Fat Loss Program",
            description: 'Metabolic conditioning with minimal equipment',
            total_weeks: 6,
            sessions_per_week: 3,
            session_duration_minutes: 30,
            primary_goal: 'fat_loss',
            experience_level: 'beginner',
            ai_model: 'claude-sonnet-4-5-20250929',
            status: 'active',
            created_at: '2025-11-08T09:45:00Z',
            updated_at: '2025-11-13T16:30:00Z',
          },
          {
            id: '4',
            trainer_id: 'trainer-1',
            program_name: 'Generic 4-Week Upper/Lower Split',
            description: 'Classic upper/lower split for intermediate lifters',
            total_weeks: 4,
            sessions_per_week: 4,
            session_duration_minutes: 45,
            primary_goal: 'hypertrophy',
            experience_level: 'intermediate',
            ai_model: 'claude-sonnet-4-5-20250929',
            status: 'completed',
            created_at: '2025-10-15T11:00:00Z',
            updated_at: '2025-11-12T14:20:00Z',
          },
        ];

        setPrograms(mockPrograms);
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter((program) => {
    // Apply status filter
    if (filter !== 'all' && program.status !== filter) {
      return false;
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        program.program_name.toLowerCase().includes(search) ||
        program.description?.toLowerCase().includes(search) ||
        program.primary_goal?.toLowerCase().includes(search) ||
        program.experience_level?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return programs.length;
    return programs.filter(p => p.status === filterType).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-gray-100">
              AI Training Programs
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create and manage AI-generated workout programs
            </p>
          </div>
          <Button
            onClick={() => router.push('/trainer/programs/new')}
            className="bg-wondrous-primary hover:bg-purple-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            New Program
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['all', 'draft', 'active', 'completed', 'archived'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                onClick={() => setFilter(filterType)}
                variant={filter === filterType ? 'default' : 'outline'}
                className={
                  filter === filterType
                    ? 'bg-wondrous-primary hover:bg-purple-700 text-white'
                    : ''
                }
                size="sm"
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <span className="ml-1.5 text-xs opacity-75">
                  ({getFilterCount(filterType)})
                </span>
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Programs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wondrous-magenta mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading programs...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || filter !== 'all'
                  ? 'No programs found'
                  : 'No programs yet'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first AI-generated program to get started'}
              </p>
              {!searchTerm && filter === 'all' && (
                <Button
                  onClick={() => router.push('/trainer/programs/new')}
                  className="bg-wondrous-primary hover:bg-purple-700 text-white"
                >
                  <Plus size={20} className="mr-2" />
                  Create Program
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
