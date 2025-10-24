import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutTemplate } from '@/lib/types';
import { MOCK_TEMPLATES } from '@/lib/mock-data';

interface TemplateState {
  templates: WorkoutTemplate[];

  // Initialize with mock templates
  initializeTemplates: () => void;

  // Template management
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (templateId: string, updates: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  duplicateTemplate: (templateId: string) => void;

  // Getters
  getTemplateById: (templateId: string) => WorkoutTemplate | undefined;
  getTemplatesByStudio: (studioId: string) => WorkoutTemplate[];
  getActiveTemplates: () => WorkoutTemplate[];
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      initializeTemplates: () => {
        const existingTemplates = get().templates;
        if (existingTemplates.length === 0) {
          set({ templates: MOCK_TEMPLATES });
        }
      },

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),

      updateTemplate: (templateId, updates) => set((state) => ({
        templates: state.templates.map(t =>
          t.id === templateId
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        ),
      })),

      deleteTemplate: (templateId) => set((state) => ({
        templates: state.templates.filter(t => t.id !== templateId),
      })),

      duplicateTemplate: (templateId) => set((state) => {
        const template = state.templates.find(t => t.id === templateId);
        if (!template) return state;

        const duplicated: WorkoutTemplate = {
          ...template,
          id: `template_${Date.now()}`,
          name: `${template.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          templates: [...state.templates, duplicated],
        };
      }),

      getTemplateById: (templateId) => {
        return get().templates.find(t => t.id === templateId);
      },

      getTemplatesByStudio: (studioId) => {
        return get().templates.filter(t => t.assignedStudios.includes(studioId));
      },

      getActiveTemplates: () => {
        return get().templates;
      },
    }),
    {
      name: 'trainer-aide-templates',
    }
  )
);
