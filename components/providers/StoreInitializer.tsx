"use client";

import { useEffect } from 'react';
import { useSessionStore } from '@/lib/stores/session-store';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useCalendarStore } from '@/lib/stores/calendar-store';

export function StoreInitializer() {
  const initializeSessions = useSessionStore((state) => state.initializeSessions);
  const initializeTemplates = useTemplateStore((state) => state.initializeTemplates);
  const initializeCalendarSessions = useCalendarStore((state) => state.initializeSessions);

  useEffect(() => {
    // Initialize stores with mock data on client side
    initializeSessions();
    initializeTemplates();
    initializeCalendarSessions();
  }, [initializeSessions, initializeTemplates, initializeCalendarSessions]);

  return null;
}
