// Availability Store - Manage trainer availability and blocked time periods

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AvailabilityBlock, TrainerAvailability } from '../types/availability';
import { DEFAULT_TRAINER_AVAILABILITY } from '../data/availability-data';

interface AvailabilityStore {
  availability: TrainerAvailability;

  // Block management
  addBlock: (block: AvailabilityBlock) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<AvailabilityBlock>) => void;

  // Query methods
  getBlocksForDate: (date: Date) => AvailabilityBlock[];
  getBlockById: (blockId: string) => AvailabilityBlock | undefined;
  getAllBlocks: () => AvailabilityBlock[];
  getAvailableBlocks: () => AvailabilityBlock[];
  getBlockedBlocks: () => AvailabilityBlock[];

  // Bulk operations
  replaceAllBlocks: (blocks: AvailabilityBlock[]) => void;
  resetToDefault: () => void;
}

export const useAvailabilityStore = create<AvailabilityStore>()(
  persist(
    (set, get) => ({
      availability: DEFAULT_TRAINER_AVAILABILITY,

      // Add a new availability or blocked block
      addBlock: (block: AvailabilityBlock) => {
        set((state) => ({
          availability: {
            ...state.availability,
            blocks: [...state.availability.blocks, block],
          },
        }));
      },

      // Remove a block by ID
      removeBlock: (blockId: string) => {
        set((state) => ({
          availability: {
            ...state.availability,
            blocks: state.availability.blocks.filter((b) => b.id !== blockId),
          },
        }));
      },

      // Update an existing block
      updateBlock: (blockId: string, updates: Partial<AvailabilityBlock>) => {
        set((state) => ({
          availability: {
            ...state.availability,
            blocks: state.availability.blocks.map((block) =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
          },
        }));
      },

      // Get all blocks that apply to a specific date
      getBlocksForDate: (date: Date) => {
        const state = get();
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];

        return state.availability.blocks.filter((block) => {
          // Weekly recurring blocks
          if (block.recurrence === 'weekly') {
            return block.dayOfWeek === dayOfWeek;
          }

          // One-time blocks
          if (block.recurrence === 'once' && block.specificDate) {
            // Single-day block
            if (!block.endDate || block.endDate === block.specificDate) {
              return block.specificDate === dateStr;
            }

            // Multi-day block
            return dateStr >= block.specificDate && dateStr <= block.endDate;
          }

          return false;
        });
      },

      // Get a specific block by ID
      getBlockById: (blockId: string) => {
        const state = get();
        return state.availability.blocks.find((b) => b.id === blockId);
      },

      // Get all blocks
      getAllBlocks: () => {
        const state = get();
        return state.availability.blocks;
      },

      // Get only available blocks
      getAvailableBlocks: () => {
        const state = get();
        return state.availability.blocks.filter((b) => b.blockType === 'available');
      },

      // Get only blocked blocks
      getBlockedBlocks: () => {
        const state = get();
        return state.availability.blocks.filter((b) => b.blockType === 'blocked');
      },

      // Replace all blocks (for bulk updates)
      replaceAllBlocks: (blocks: AvailabilityBlock[]) => {
        set((state) => ({
          availability: {
            ...state.availability,
            blocks,
          },
        }));
      },

      // Reset to default availability
      resetToDefault: () => {
        set({
          availability: DEFAULT_TRAINER_AVAILABILITY,
        });
      },
    }),
    {
      name: 'availability-storage',
    }
  )
);
