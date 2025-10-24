"use client";

import { useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/session-store';
import { useTemplateStore } from '@/lib/stores/template-store';

export function StoreInitializer() {
  const initializeSessions = useSessionStore((state) => state.initializeSessions);
  const initializeTemplates = useTemplateStore((state) => state.initializeTemplates);

  useEffect(() => {
    // Initialize stores with mock data on client side
    initializeSessions();
    initializeTemplates();
  }, [initializeSessions, initializeTemplates]);

  return null;
}
