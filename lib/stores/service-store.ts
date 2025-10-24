import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Service } from '@/lib/types/service';
import { MOCK_SERVICES } from '@/lib/data/services-data';

interface ServiceState {
  services: Service[];
  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getActiveServices: () => Service[];
  reset: () => void;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      services: MOCK_SERVICES,

      addService: (service) =>
        set((state) => ({
          services: [...state.services, service],
        })),

      updateService: (id, updates) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? { ...service, ...updates, updatedAt: new Date().toISOString() }
              : service
          ),
        })),

      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        })),

      getServiceById: (id) => {
        return get().services.find((service) => service.id === id);
      },

      getActiveServices: () => {
        return get().services.filter((service) => service.isActive);
      },

      reset: () => set({ services: MOCK_SERVICES }),
    }),
    {
      name: 'trainer-aide-services',
    }
  )
);
