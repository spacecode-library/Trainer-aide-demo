"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Clock, User, X, Search, Calendar as CalendarIcon, Inbox, CheckCircle, XCircle, MessageSquare, AlertCircle, Play, AlertTriangle, UserX, CalendarX, Check, TrendingUp, Repeat, StickyNote, Dumbbell, Bell, CalendarDays, Timer, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/lib/stores/user-store";
import { useCalendarStore } from "@/lib/stores/calendar-store";
import {
  SERVICE_TYPES,
  CALENDAR_CLIENTS,
  WORKOUT_TEMPLATES,
  getServiceType,
  getClient,
  getWorkoutTemplate,
  type CalendarClient,
} from "@/lib/data/calendar-data";
import {
  generateTimeSlots,
  isTimeAvailable,
  calculateSessionHeight,
  getTimeRemaining,
  getStatusBadge,
  getWeekDates,
  formatDate,
  formatTime,
} from "@/lib/utils/calendar-utils";
import type { CalendarSession } from "@/lib/types/calendar";
import type { BookingRequest } from "@/lib/types/booking-request";
import type { SessionCompletionFormData } from "@/lib/types/session-completion";
import { MOCK_BOOKING_REQUESTS } from "@/lib/data/booking-requests";
import { DEFAULT_TRAINER_AVAILABILITY, isWithinAvailability, getAvailabilityForDay } from "@/lib/data/availability-data";
import { cn } from "@/lib/utils/cn";

type ViewMode = "day" | "week";
type CalendarTab = "schedule" | "requests";

export default function TrainerCalendar() {
  // Store hooks
  const currentUser = useUserStore((state) => state.currentUser);
  const { sessions, initializeSessions, addSession, updateSession, removeSession } = useCalendarStore();
  const { toast } = useToast();

  // Client-side only flag to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);

  // Local state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [calendarTab, setCalendarTab] = useState<CalendarTab>("schedule");
  const [clients, setClients] = useState<CalendarClient[]>(CALENDAR_CLIENTS);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(MOCK_BOOKING_REQUESTS);
  const [trainerAvailability] = useState(DEFAULT_TRAINER_AVAILABILITY);

  // Inline booking panel state (NO MODALS)
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [searchClient, setSearchClient] = useState("");

  // Inline session details state (NO MODALS)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<SessionCompletionFormData>({
    rpe: 5,
    notes: "",
  });

  // Reschedule state (INLINE, NO MODALS)
  const [reschedulingSessionId, setReschedulingSessionId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");

  // Mark as mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize sessions from store
  useEffect(() => {
    initializeSessions();
  }, [initializeSessions]);

  // Soft hold expiry enforcement
  useEffect(() => {
    const checkExpiredHolds = () => {
      const now = new Date();
      let hasExpired = false;

      sessions.forEach((session) => {
        const holdExpiryDate = session.holdExpiry instanceof Date
          ? session.holdExpiry
          : session.holdExpiry ? new Date(session.holdExpiry) : null;

        if (
          session.status === "soft-hold" &&
          holdExpiryDate &&
          now > holdExpiryDate
        ) {
          hasExpired = true;
          updateSession(session.id, { status: "cancelled" as const });
        }
      });

      if (hasExpired) {
        toast({
          variant: "warning",
          title: "Soft Holds Expired",
          description: "Some soft hold bookings have expired and been removed",
        });
      }
    };

    // Check immediately
    checkExpiredHolds();

    // Check every minute
    const interval = setInterval(checkExpiredHolds, 60000);

    return () => clearInterval(interval);
    // Only depend on sessions length to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length]);

  // Navigation
  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(currentDate.getDate() + direction);
    } else {
      newDate.setDate(currentDate.getDate() + direction * 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Get today's sessions
  const todaysSessions = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return sessions
      .filter((s) => s.datetime >= today && s.datetime < tomorrow)
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  }, [currentDate, sessions]);

  // Get week dates and sessions
  const weekDates = getWeekDates(currentDate);
  const weekSessions = useMemo(() => {
    return sessions.filter((s) => {
      return s.datetime >= weekDates[0] && s.datetime <= weekDates[6];
    });
  }, [sessions, weekDates]);

  // Time slots for quick booking
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6am-8pm

  // Handle quick slot click
  const handleQuickSlotClick = (datetime: Date) => {
    setSelectedSlot(datetime);
    setSelectedServiceType(SERVICE_TYPES[0].id);
    setShowBookingPanel(true);
    setSearchClient("");
  };

  // Handle session click
  const handleSessionClick = (sessionId: string) => {
    // If clicking from week view, switch to day view and navigate to that session's date
    if (viewMode === "week") {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setCurrentDate(new Date(session.datetime));
        setViewMode("day");
        setExpandedSessionId(sessionId);
      }
    } else {
      // In day view, just toggle expansion
      setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
    }
  };

  // Close booking panel
  const closeBookingPanel = () => {
    setShowBookingPanel(false);
    setSelectedSlot(null);
    setSelectedServiceType(null);
    setSearchClient("");
  };

  // Create booking (instructor-led as per guide)
  const handleCreateBooking = (clientId: string, serviceTypeId: string, datetime: Date) => {
    const client = clients.find((c) => c.id === clientId);
    const serviceType = getServiceType(serviceTypeId);

    if (!client || !serviceType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Client or service type not found",
      });
      return;
    }

    // Check credits
    if (client.credits < serviceType.creditsRequired) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: `${client.name} needs ${serviceType.creditsRequired} credits but only has ${client.credits}`,
      });
      return;
    }

    // Check availability
    if (!isWithinAvailability(datetime, trainerAvailability)) {
      toast({
        variant: "destructive",
        title: "Outside Availability",
        description: "Trainer is not available at this time",
      });
      return;
    }

    // Check conflicts
    if (!isTimeAvailable(datetime, serviceType.duration, sessions)) {
      toast({
        variant: "destructive",
        title: "Time Conflict",
        description: "This time slot is already booked",
      });
      return;
    }

    // Create new session
    const newSession: CalendarSession = {
      id: `session_${Date.now()}`,
      datetime: datetime,
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar,
      clientColor: client.color,
      clientCredits: client.credits - serviceType.creditsRequired,
      status: "confirmed",
      serviceTypeId: serviceType.id,
      workoutId: null,
    };

    // Update sessions
    addSession(newSession);

    // Deduct credits
    setClients(
      clients.map((c) =>
        c.id === clientId
          ? { ...c, credits: c.credits - serviceType.creditsRequired }
          : c
      )
    );

    // Success notification
    toast({
      title: "Booking Confirmed",
      description: `${client.name} booked for ${formatTime(datetime)} • ${serviceType.name}`,
    });

    // Close panel
    closeBookingPanel();
  };

  // Start session
  const handleStartSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    updateSession(sessionId, { status: "checked-in" });

    toast({
      title: "Session Started",
      description: `${session.clientName} checked in`,
    });
  };

  // Complete session
  const handleCompleteSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Show completion form
    setCompletingSessionId(sessionId);
    setCompletionData({ rpe: 5, notes: "" });
  };

  // Submit session completion
  const submitSessionCompletion = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    updateSession(sessionId, { status: "completed" });

    toast({
      title: "Session Completed",
      description: `${session.clientName}'s session saved with RPE ${completionData.rpe}/10`,
    });

    setCompletingSessionId(null);
    setExpandedSessionId(null);
  };

  // Quick rebook after completion
  const handleQuickRebook = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Pre-fill booking panel with same client and service type
    const nextWeek = new Date(session.datetime);
    nextWeek.setDate(nextWeek.getDate() + 7);

    setSelectedSlot(nextWeek);
    setSelectedServiceType(session.serviceTypeId);
    setShowBookingPanel(true);
    setSearchClient(session.clientName);

    toast({
      title: "Quick Rebook",
      description: `Pre-filled for ${session.clientName} - Select time`,
    });
  };

  // Mark late
  const handleMarkLate = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    updateSession(sessionId, { status: "late" });

    toast({
      variant: "warning",
      title: "Marked as Late",
      description: `${session.clientName} - Late arrival recorded`,
    });
  };

  // Mark no show
  const handleMarkNoShow = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const serviceType = getServiceType(session.serviceTypeId);
    const client = clients.find((c) => c.id === session.clientId);

    if (!serviceType || !client) return;

    // Update session status
    updateSession(sessionId, { status: "no-show" });

    // Refund credit
    setClients(
      clients.map((c) =>
        c.id === session.clientId
          ? { ...c, credits: c.credits + serviceType.creditsRequired }
          : c
      )
    );

    toast({
      variant: "destructive",
      title: "No Show",
      description: `${session.clientName} - Credit refunded`,
    });
  };

  // Cancel session
  const handleCancelSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const serviceType = getServiceType(session.serviceTypeId);
    const client = clients.find((c) => c.id === session.clientId);

    if (!serviceType || !client) return;

    // Remove session
    removeSession(sessionId);

    // Refund credit
    setClients(
      clients.map((c) =>
        c.id === session.clientId
          ? { ...c, credits: c.credits + serviceType.creditsRequired }
          : c
      )
    );

    toast({
      title: "Session Cancelled",
      description: `${session.clientName} - Credit refunded`,
    });

    setExpandedSessionId(null);
  };

  // Reschedule session (INLINE, NO MODALS)
  const handleRescheduleSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Pre-fill with current session datetime
    const currentDate = new Date(session.datetime);
    const dateStr = currentDate.toISOString().split('T')[0];
    const timeStr = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

    setReschedulingSessionId(sessionId);
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
  };

  // Submit reschedule
  const submitReschedule = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    if (!rescheduleDate || !rescheduleTime) {
      toast({
        variant: "destructive",
        title: "Invalid Date/Time",
        description: "Please select a valid date and time",
      });
      return;
    }

    // Create new datetime
    const newDatetime = new Date(`${rescheduleDate}T${rescheduleTime}`);

    // Check availability
    if (!isWithinAvailability(newDatetime, trainerAvailability)) {
      toast({
        variant: "destructive",
        title: "Outside Availability",
        description: "Trainer is not available at this time",
      });
      return;
    }

    const serviceType = getServiceType(session.serviceTypeId);
    if (!serviceType) return;

    // Check conflicts (excluding current session)
    const otherSessions = sessions.filter((s) => s.id !== sessionId);
    if (!isTimeAvailable(newDatetime, serviceType.duration, otherSessions)) {
      toast({
        variant: "destructive",
        title: "Time Conflict",
        description: "This time slot is already booked",
      });
      return;
    }

    // Update session datetime
    updateSession(sessionId, { datetime: newDatetime });

    toast({
      title: "Session Rescheduled",
      description: `${session.clientName} rescheduled to ${formatDate(newDatetime)} at ${formatTime(newDatetime)}`,
    });

    setReschedulingSessionId(null);
    setExpandedSessionId(null);
  };

  // Accept booking request
  const handleAcceptRequest = (requestId: string, selectedTime: Date) => {
    const request = bookingRequests.find((r) => r.id === requestId);
    if (!request) return;

    const client = clients.find((c) => c.id === request.clientId);
    const serviceType = getServiceType(request.serviceTypeId);

    if (!client || !serviceType) return;

    // Check credits
    if (client.credits < serviceType.creditsRequired) {
      toast({
        variant: "destructive",
        title: "Insufficient Credits",
        description: `${client.name} needs ${serviceType.creditsRequired} credits but only has ${client.credits}`,
      });
      return;
    }

    // Check conflicts
    if (!isTimeAvailable(selectedTime, serviceType.duration, sessions)) {
      toast({
        variant: "destructive",
        title: "Time Conflict",
        description: "This time slot is already booked",
      });
      return;
    }

    // Create session from request
    const newSession: CalendarSession = {
      id: `session_${Date.now()}`,
      datetime: selectedTime,
      clientId: request.clientId,
      clientName: request.clientName,
      clientAvatar: request.clientAvatar,
      clientColor: request.clientColor,
      clientCredits: client.credits - serviceType.creditsRequired,
      status: "confirmed",
      serviceTypeId: request.serviceTypeId,
      workoutId: null,
    };

    addSession(newSession);

    // Deduct credits
    setClients(
      clients.map((c) =>
        c.id === request.clientId
          ? { ...c, credits: c.credits - serviceType.creditsRequired }
          : c
      )
    );

    // Mark request as accepted
    setBookingRequests(
      bookingRequests.map((r) =>
        r.id === requestId ? { ...r, status: "accepted" as const } : r
      )
    );

    toast({
      title: "Request Accepted",
      description: `${request.clientName} booked for ${formatTime(selectedTime)}`,
    });
  };

  // Decline booking request
  const handleDeclineRequest = (requestId: string, reason?: string) => {
    const request = bookingRequests.find((r) => r.id === requestId);
    if (!request) return;

    setBookingRequests(
      bookingRequests.map((r) =>
        r.id === requestId ? { ...r, status: "declined" as const } : r
      )
    );

    toast({
      title: "Request Declined",
      description: `${request.clientName}'s request has been declined`,
    });
  };

  // Pending requests count
  const pendingRequestsCount = bookingRequests.filter(
    (r) => r.status === "pending"
  ).length;

  // Filtered clients
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchClient.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Calendar Controls - Fixed Header (Mobile & Desktop Optimized) */}
      <div className="fixed top-[73px] lg:top-0 left-0 right-0 lg:left-64 z-10 bg-white dark:bg-gray-800 shadow-md border-t border-gray-100 dark:border-gray-700">
        {/* View Toggle & Navigation */}
        <div className="p-2 lg:p-4 border-b border-wondrous-grey-light lg:px-8">
          <div className="lg:max-w-7xl lg:mx-auto">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <div className="flex gap-1.5 lg:gap-2">
                <button
                  onClick={() => navigateDay(-1)}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg hover:opacity-80 flex items-center justify-center font-bold text-sm bg-wondrous-grey-light text-wondrous-grey-dark active:scale-95 transition-transform"
                  aria-label="Previous day"
                >
                  <ChevronLeft size={16} className="lg:w-[18px] lg:h-[18px]" />
                </button>
                <button
                  onClick={() => navigateDay(1)}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg hover:opacity-80 flex items-center justify-center font-bold text-sm bg-wondrous-grey-light text-wondrous-grey-dark active:scale-95 transition-transform"
                  aria-label="Next day"
                >
                  <ChevronRight size={16} className="lg:w-[18px] lg:h-[18px]" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-2.5 lg:px-3 h-8 lg:h-9 rounded-lg text-[11px] lg:text-xs font-semibold hover:opacity-80 bg-wondrous-grey-light text-wondrous-grey-dark active:scale-95 transition-transform"
                  aria-label="Go to today"
                >
                  Today
                </button>
              </div>
              <div className="font-bold text-xs lg:text-sm text-wondrous-grey-dark dark:text-gray-100 font-heading">
                {viewMode === "day" ? (isMounted ? formatDate(currentDate) : "Loading...") : `Week View`}
              </div>
            </div>

            <div className="flex gap-1.5 lg:gap-2">
              <button
                onClick={() => setViewMode("day")}
                className={cn(
                  "flex-1 py-1.5 lg:py-2 rounded-lg text-[11px] lg:text-xs font-semibold transition-all active:scale-95",
                  viewMode === "day"
                    ? "bg-wondrous-blue text-white"
                    : "bg-wondrous-grey-light text-wondrous-grey-dark"
                )}
                aria-label="Day view"
                aria-pressed={viewMode === "day"}
              >
                Day View
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={cn(
                  "flex-1 py-1.5 lg:py-2 rounded-lg text-[11px] lg:text-xs font-semibold transition-all active:scale-95",
                  viewMode === "week"
                    ? "bg-wondrous-blue text-white"
                    : "bg-wondrous-grey-light text-wondrous-grey-dark"
                )}
                aria-label="Week view"
                aria-pressed={viewMode === "week"}
              >
                Week View
              </button>
            </div>
          </div>
        </div>

        {/* Schedule/Requests Tabs */}
        <div className="border-b border-wondrous-grey-light bg-white lg:px-8">
          <div className="lg:max-w-7xl lg:mx-auto px-2 lg:px-0">
            <div className="flex gap-2 lg:gap-4">
              <button
                onClick={() => setCalendarTab("schedule")}
                className={cn(
                  "flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold transition-all relative active:scale-95",
                  calendarTab === "schedule"
                    ? "text-wondrous-blue"
                    : "text-gray-500 hover:text-wondrous-grey-dark"
                )}
                aria-label="Schedule tab"
                aria-pressed={calendarTab === "schedule"}
              >
                <CalendarIcon size={16} className="lg:w-[18px] lg:h-[18px]" />
                <span className="relative z-10">Schedule</span>
                {calendarTab === "schedule" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 lg:h-1 bg-wondrous-blue -z-0" />
                )}
              </button>
              <button
                onClick={() => setCalendarTab("requests")}
                className={cn(
                  "flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold transition-all relative active:scale-95",
                  calendarTab === "requests"
                    ? "text-wondrous-blue"
                    : "text-gray-500 hover:text-wondrous-grey-dark"
                )}
                aria-label="Requests tab"
                aria-pressed={calendarTab === "requests"}
              >
                <Inbox size={16} className="lg:w-[18px] lg:h-[18px]" />
                <span className="relative z-10">Requests</span>
                {pendingRequestsCount > 0 && (
                  <span className="bg-wondrous-orange text-white text-[10px] lg:text-xs font-bold px-1.5 lg:px-2 py-0.5 rounded-full min-w-[18px] lg:min-w-[20px] text-center">
                    {pendingRequestsCount}
                  </span>
                )}
                {calendarTab === "requests" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 lg:h-1 bg-wondrous-blue -z-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable with proper spacing */}
      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6 mt-[153px] lg:mt-[140px]">
        {/* SCHEDULE TAB */}
        {calendarTab === "schedule" && (
          <>
            {/* DAY VIEW */}
            {viewMode === "day" && (
          <div className="space-y-4">
            {/* Session List */}
            <div className="space-y-4">
              {todaysSessions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-wondrous-grey-light dark:border-gray-700">
                  <CalendarDays size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <div className="text-sm font-medium text-wondrous-grey-dark dark:text-gray-200">No sessions today</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your schedule is clear</div>
                </div>
              ) : (
                todaysSessions.map((session) => {
                  const client = getClient(session.clientId);
                  const serviceType = getServiceType(session.serviceTypeId);
                  const statusInfo = getStatusBadge(session.status);
                  const workout = session.workoutId
                    ? getWorkoutTemplate(session.workoutId)
                    : null;
                  const isExpanded = expandedSessionId === session.id;

                  return (
                    <motion.div
                      key={session.id}
                      layout
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl cursor-pointer transition-all overflow-hidden"
                      onClick={() => handleSessionClick(session.id)}
                    >
                      {/* Session Card Header */}
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            style={{ background: client?.color || "#12229D" }}
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md"
                          >
                            {client?.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg text-wondrous-grey-dark dark:text-gray-100 mb-1">
                              {session.clientName}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(session.datetime)}
                              </span>
                              <span className="text-gray-400 dark:text-gray-500">•</span>
                              <span>{serviceType?.duration} minutes</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-wondrous-blue font-heading">
                              {session.datetime.getHours()}:
                              {session.datetime.getMinutes().toString().padStart(2, "0")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            style={{ background: statusInfo.bg, color: statusInfo.text }}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold"
                          >
                            {statusInfo.label}
                          </span>
                          <span
                            style={{ background: serviceType?.color + "15", color: serviceType?.color, borderColor: serviceType?.color + "30" }}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                          >
                            {serviceType?.name}
                          </span>
                          {session.status === "soft-hold" && session.holdExpiry && (
                            <span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-orange-200">
                              <Timer size={14} />
                              {getTimeRemaining(session.holdExpiry)}
                            </span>
                          )}
                          {client && (
                            <span
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border",
                                client.credits >= (serviceType?.creditsRequired || 1)
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              )}
                            >
                              <CreditCard size={14} />
                              {client.credits} credits
                            </span>
                          )}
                        </div>
                      </div>

                      {/* INLINE Expanded Session Details (NO MODAL) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-wondrous-grey-light dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                          >
                            <div className="p-4 space-y-3">
                              {/* Reschedule Form - INLINE */}
                              {reschedulingSessionId === session.id ? (
                                <div className="space-y-3">
                                  <div className="text-sm font-bold text-wondrous-grey-dark dark:text-gray-100">
                                    Reschedule Session
                                  </div>

                                  {/* Date Input */}
                                  <div>
                                    <label className="text-xs font-semibold text-wondrous-grey-dark dark:text-gray-200 mb-2 flex items-center gap-1">
                                      <CalendarIcon size={14} />
                                      New Date
                                    </label>
                                    <Input
                                      type="date"
                                      value={rescheduleDate}
                                      onChange={(e) => setRescheduleDate(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>

                                  {/* Time Input */}
                                  <div>
                                    <label className="text-xs font-semibold text-wondrous-grey-dark dark:text-gray-200 mb-2 flex items-center gap-1">
                                      <Clock size={14} />
                                      New Time
                                    </label>
                                    <Input
                                      type="time"
                                      value={rescheduleTime}
                                      onChange={(e) => setRescheduleTime(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>

                                  {/* Submit Buttons */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReschedulingSessionId(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-wondrous-blue hover:bg-wondrous-blue/90 text-white flex items-center gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        submitReschedule(session.id);
                                      }}
                                    >
                                      <Check size={14} />
                                      Confirm Reschedule
                                    </Button>
                                  </div>
                                </div>
                              ) : completingSessionId === session.id ? (
                                <div className="space-y-3">
                                  <div className="text-sm font-bold text-wondrous-grey-dark dark:text-gray-100">
                                    Complete Session
                                  </div>

                                  {/* RPE Scale */}
                                  <div>
                                    <label className="text-xs font-semibold text-wondrous-grey-dark dark:text-gray-200 mb-2 flex items-center gap-1">
                                      <TrendingUp size={14} />
                                      RPE (Rate of Perceived Exertion)
                                    </label>
                                    <div className="flex items-center gap-2 mt-2">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => (
                                        <button
                                          key={rpe}
                                          onClick={() =>
                                            setCompletionData({ ...completionData, rpe })
                                          }
                                          className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-bold transition-all border-2",
                                            completionData.rpe === rpe
                                              ? "bg-wondrous-blue text-white border-wondrous-blue"
                                              : "bg-white text-gray-600 border-gray-300 hover:border-wondrous-blue"
                                          )}
                                        >
                                          {rpe}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      1=Very Easy, 10=Maximum Effort
                                    </div>
                                  </div>

                                  {/* Notes */}
                                  <div>
                                    <label className="text-xs font-semibold text-wondrous-grey-dark dark:text-gray-200 mb-2 flex items-center gap-1">
                                      <StickyNote size={14} />
                                      Session Notes
                                    </label>
                                    <textarea
                                      value={completionData.notes}
                                      onChange={(e) =>
                                        setCompletionData({
                                          ...completionData,
                                          notes: e.target.value,
                                        })
                                      }
                                      placeholder="e.g., Client showed improvement in squats, increased weight on bench press..."
                                      className="w-full p-2 border-2 border-wondrous-grey-light rounded-lg text-xs resize-none focus:outline-none focus:border-wondrous-blue"
                                      rows={3}
                                    />
                                  </div>

                                  {/* Submit Buttons */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCompletingSessionId(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        submitSessionCompletion(session.id);
                                      }}
                                    >
                                      <Check size={14} />
                                      Save & Complete
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* Quick Actions */}
                                  <div>
                                    <div className="text-xs font-semibold mb-2 text-wondrous-grey-dark dark:text-gray-200">
                                      Quick Actions
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {session.status === "checked-in" ? (
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompleteSession(session.id);
                                          }}
                                        >
                                          <Check size={14} />
                                          Complete
                                        </Button>
                                      ) : session.status === "completed" ? (
                                        <Button
                                          size="sm"
                                          className="bg-wondrous-blue hover:bg-wondrous-blue/90 flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuickRebook(session.id);
                                          }}
                                        >
                                          <Repeat size={14} />
                                          Quick Rebook
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          className="bg-wondrous-blue hover:bg-wondrous-blue/90 flex items-center gap-1"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartSession(session.id);
                                          }}
                                        >
                                          <Play size={14} />
                                          Start
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (client?.phone) {
                                            window.location.href = `sms:${client.phone}`;
                                          }
                                        }}
                                      >
                                        <MessageSquare size={14} />
                                        Message
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Secondary Actions - Only for non-completed sessions and not rescheduling */}
                              {session.status !== "completed" && completingSessionId !== session.id && reschedulingSessionId !== session.id && (
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkLate(session.id);
                                  }}
                                >
                                  <AlertTriangle size={12} />
                                  Late
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkNoShow(session.id);
                                  }}
                                >
                                  <UserX size={12} />
                                  No Show
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRescheduleSession(session.id);
                                  }}
                                >
                                  <CalendarX size={12} />
                                  Reschedule
                                </Button>
                              </div>
                              )}

                              {/* Cancel Button - Only for non-completed sessions and not rescheduling */}
                              {session.status !== "completed" && completingSessionId !== session.id && reschedulingSessionId !== session.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-red-600 border-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelSession(session.id);
                                }}
                              >
                                Cancel Session
                              </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Availability Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-wondrous-grey-light dark:border-gray-700">
              <div className="text-xs font-semibold mb-3 text-wondrous-grey-dark dark:text-gray-100 flex items-center gap-2">
                <AlertCircle size={14} className="text-wondrous-blue" />
                Availability Legend
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-white border-2 border-wondrous-blue shadow-sm"></div>
                  <span className="text-wondrous-grey-dark dark:text-gray-200 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-red-50 border-2 border-red-300 shadow-sm"></div>
                  <span className="text-wondrous-grey-dark dark:text-gray-200 font-medium">Conflict</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 opacity-50 shadow-sm"></div>
                  <span className="text-wondrous-grey-dark dark:text-gray-200 font-medium">Not Available</span>
                </div>
              </div>
            </div>

            {/* Quick Time Selector - INLINE (NO MODAL) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-wondrous-grey-light dark:border-gray-700">
              <div className="text-xs font-semibold mb-2 text-wondrous-grey-dark dark:text-gray-100">
                Quick Book Time
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {hours.slice(0, 12).map((hour) => {
                  const datetime = new Date(currentDate);
                  datetime.setHours(hour, 0, 0, 0);
                  const hasConflict = !isTimeAvailable(datetime, 30, sessions);
                  const isAvailable = isWithinAvailability(datetime, trainerAvailability);

                  return (
                    <button
                      key={hour}
                      onClick={() => !hasConflict && isAvailable && handleQuickSlotClick(datetime)}
                      disabled={hasConflict || !isAvailable}
                      className={cn(
                        "border-2 rounded-lg p-2 text-xs font-semibold transition-all relative",
                        !isAvailable
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                          : hasConflict
                          ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                          : "bg-white border-wondrous-blue text-wondrous-blue hover:bg-wondrous-blue hover:text-white"
                      )}
                    >
                      {hasConflict && isAvailable && (
                        <AlertCircle size={12} className="absolute top-0.5 right-0.5 text-red-500" />
                      )}
                      {hour}:00
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleQuickSlotClick(new Date())}
                className="w-full p-2 rounded-lg text-xs font-semibold hover:opacity-90 bg-wondrous-orange text-white flex items-center justify-center gap-2"
              >
                <Clock size={14} />
                Custom Time
              </button>
            </div>
          </div>
        )}

        {/* WEEK VIEW */}
        {viewMode === "week" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-4 overflow-x-auto border-2 border-wondrous-grey-light dark:border-gray-700 shadow-md">
            <div className="min-w-[600px] lg:min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 gap-0.5 lg:gap-1 mb-2">
                <div /> {/* Empty corner */}
                {weekDates.map((date, i) => {
                  const isToday =
                    date.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-center p-1 lg:p-2 rounded-lg text-[10px] lg:text-xs font-bold",
                        isToday
                          ? "bg-wondrous-blue text-white"
                          : "bg-wondrous-grey-light text-wondrous-grey-dark"
                      )}
                    >
                      <div className="hidden sm:block">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</div>
                      <div className="sm:hidden">{["M", "T", "W", "T", "F", "S", "S"][i]}</div>
                      <div className="text-xs lg:text-base mt-0.5">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Grid with Sessions */}
              <div className="relative">
                {/* Background grid */}
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 gap-0.5 lg:gap-1 min-h-[48px] lg:min-h-[64px] border-t-2 border-wondrous-grey-light dark:border-gray-700">
                    <div className="text-[10px] lg:text-xs font-medium text-right pr-1 lg:pr-2 pt-1 text-wondrous-grey-dark dark:text-gray-300">
                      {hour}:00
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const date = weekDates[dayIndex];
                      const slotTime = new Date(date);
                      slotTime.setHours(hour, 0, 0, 0);
                      const isAvailable = isWithinAvailability(slotTime, trainerAvailability);

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "rounded border transition-colors relative",
                            isAvailable
                              ? "bg-gray-50 dark:bg-gray-700 border-wondrous-grey-light dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer"
                              : "bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 cursor-not-allowed opacity-40"
                          )}
                          onClick={() => isAvailable && handleQuickSlotClick(slotTime)}
                          title={!isAvailable ? "Trainer not available" : "Click to book"}
                        />
                      );
                    })}
                  </div>
                ))}

                {/* Positioned Sessions */}
                {weekDates.map((date, dayIndex) => {
                  const daySessions = weekSessions.filter((s) => {
                    const sessionDate = new Date(s.datetime);
                    return (
                      sessionDate.getFullYear() === date.getFullYear() &&
                      sessionDate.getMonth() === date.getMonth() &&
                      sessionDate.getDate() === date.getDate()
                    );
                  });

                  return daySessions.map((session) => {
                    const serviceType = getServiceType(session.serviceTypeId);
                    const client = clients.find((c) => c.id === session.clientId);
                    const statusInfo = getStatusBadge(session.status);

                    if (!serviceType) return null;

                    // Calculate position (responsive for mobile/desktop)
                    const sessionHour = session.datetime.getHours();
                    const sessionMinute = session.datetime.getMinutes();

                    // Use CSS variables for responsive height calculation
                    // Mobile: 48px per hour, Desktop: 64px per hour
                    const hourHeightMobile = 48;
                    const hourHeightDesktop = 64;

                    const topPositionMobile = (sessionHour - 6) * hourHeightMobile + (sessionMinute / 60) * hourHeightMobile;
                    const topPositionDesktop = (sessionHour - 6) * hourHeightDesktop + (sessionMinute / 60) * hourHeightDesktop;
                    const heightMobile = (serviceType.duration / 60) * hourHeightMobile;
                    const heightDesktop = (serviceType.duration / 60) * hourHeightDesktop;

                    // Calculate left position (column)
                    const columnWidth = 100 / 8; // 8 columns total
                    const leftPosition = (dayIndex + 1) * columnWidth; // +1 to skip time label column

                    return (
                      <div
                        key={session.id}
                        className="absolute rounded-md lg:rounded-lg shadow-sm border lg:border-2 p-1 lg:p-2 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        style={{
                          top: `${topPositionMobile}px`,
                          left: `calc(${leftPosition}% + 2px)`,
                          width: `calc(${columnWidth}% - 4px)`,
                          height: `${heightMobile}px`,
                          minHeight: "32px",
                          background: serviceType.color + "20",
                          borderColor: serviceType.color,
                        }}
                        onClick={() => handleSessionClick(session.id)}
                      >
                        <div className="flex flex-col h-full justify-between text-[10px] lg:text-xs">
                          <div>
                            <div
                              className="font-bold truncate text-[9px] lg:text-xs"
                              style={{ color: serviceType.color }}
                            >
                              <span className="hidden sm:inline">{client?.avatar} </span>
                              <span className="hidden md:inline">{session.clientName}</span>
                              <span className="md:hidden">{client?.avatar}</span>
                            </div>
                            <div className="text-[8px] lg:text-[10px] text-gray-600 dark:text-gray-400 hidden sm:block">
                              {formatTime(session.datetime)}
                            </div>
                          </div>
                          <div
                            className="text-[8px] lg:text-[10px] font-semibold px-1 lg:px-1.5 py-0.5 rounded self-start hidden sm:block"
                            style={{
                              background: statusInfo.bg,
                              color: statusInfo.text,
                            }}
                          >
                            {statusInfo.label}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* REQUESTS TAB */}
        {calendarTab === "requests" && (
          <div className="space-y-3">
            {/* Pending Requests */}
            <div>
              <h3 className="text-base font-bold text-wondrous-grey-dark dark:text-gray-100 mb-3 flex items-center gap-2">
                <Inbox size={20} className="text-wondrous-orange" />
                Pending Requests ({bookingRequests.filter((r) => r.status === "pending").length})
              </h3>

              {bookingRequests.filter((r) => r.status === "pending").length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-wondrous-grey-light dark:border-gray-700">
                  <Inbox size={48} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <div className="text-sm font-medium dark:text-gray-200">No pending requests</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    All caught up!
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingRequests
                    .filter((r) => r.status === "pending")
                    .map((request) => {
                      const serviceType = getServiceType(request.serviceTypeId);
                      if (!serviceType) return null;

                      return (
                        <div
                          key={request.id}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-wondrous-grey-light dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                        >
                          {/* Client Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              style={{ background: request.clientColor }}
                              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                            >
                              <User size={24} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-base text-wondrous-grey-dark dark:text-gray-100">
                                {request.clientName}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {request.clientCredits} credits available
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {Math.floor(
                                  (Date.now() - request.createdAt.getTime()) /
                                    (1000 * 60 * 60)
                                )}
                                h ago
                              </div>
                            </div>
                          </div>

                          {/* Service Type */}
                          <div
                            className="mb-3 p-2 rounded-lg"
                            style={{ background: serviceType.color + "20" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div
                                  className="font-semibold text-sm"
                                  style={{ color: serviceType.color }}
                                >
                                  {serviceType.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  {serviceType.duration} minutes •{" "}
                                  {serviceType.creditsRequired} credits
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Notes */}
                          {request.notes && (
                            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-wondrous-grey-light dark:border-gray-600">
                              <div className="flex items-start gap-2">
                                <MessageSquare size={14} className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-gray-700 dark:text-gray-300">{request.notes}</div>
                              </div>
                            </div>
                          )}

                          {/* Preferred Times */}
                          <div className="mb-3">
                            <div className="text-xs font-semibold text-wondrous-grey-dark dark:text-gray-200 mb-2">
                              Preferred Times
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {request.preferredTimes.map((time, index) => {
                                const available = isTimeAvailable(
                                  time,
                                  serviceType.duration,
                                  sessions
                                );

                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      if (available) {
                                        handleAcceptRequest(request.id, time);
                                      }
                                    }}
                                    disabled={!available}
                                    className={cn(
                                      "p-2 rounded-lg text-xs font-semibold transition-all border-2",
                                      available
                                        ? "bg-white border-wondrous-blue text-wondrous-blue hover:bg-wondrous-blue hover:text-white"
                                        : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                    )}
                                  >
                                    <div>{formatDate(time)}</div>
                                    <div className="font-bold">{formatTime(time)}</div>
                                    {!available && (
                                      <div className="text-[10px] text-red-500">Conflict</div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleDeclineRequest(request.id)}
                            >
                              <XCircle size={16} className="mr-1" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-wondrous-blue border-wondrous-blue hover:bg-wondrous-blue hover:text-white"
                              onClick={() => {
                                toast({
                                  title: "Suggest Alternative",
                                  description: "Feature coming soon",
                                });
                              }}
                            >
                              <Clock size={16} className="mr-1" />
                              Suggest Alt
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INLINE Booking Panel (NO MODAL) */}
      <AnimatePresence>
        {showBookingPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto border-t-4 border-wondrous-magenta"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-wondrous-grey-dark dark:text-gray-100">
                    Book Session
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSlot && formatTime(selectedSlot)}
                  </p>
                </div>
                <button
                  onClick={closeBookingPanel}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Service Type Selection - INLINE */}
              <div className="mb-4">
                <div className="text-xs font-semibold mb-2 text-wondrous-grey-dark dark:text-gray-200">
                  Session Type
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICE_TYPES.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceType(service.id)}
                      style={{
                        background:
                          selectedServiceType === service.id
                            ? service.color
                            : "#F5F5F5",
                        color:
                          selectedServiceType === service.id
                            ? "white"
                            : "#272030",
                        borderColor:
                          selectedServiceType === service.id
                            ? service.color
                            : "#D7D7DB",
                      }}
                      className="border-2 rounded-xl p-3 text-left hover:opacity-90 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm">
                            {service.name}
                          </div>
                          <div className="text-xs opacity-75">
                            {service.duration} minutes • {service.creditsRequired}{" "}
                            credits
                          </div>
                        </div>
                        {selectedServiceType === service.id && (
                          <CheckCircle size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Search - INLINE */}
              <div className="mb-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <Input
                  type="text"
                  placeholder="Search clients..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="border-2 border-wondrous-grey-light pl-10"
                />
              </div>

              {/* Client List - INLINE */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredClients.map((client) => {
                  const serviceType = SERVICE_TYPES.find(
                    (s) => s.id === selectedServiceType
                  );
                  const hasEnoughCredits =
                    serviceType && client.credits >= serviceType.creditsRequired;

                  return (
                    <div
                      key={client.id}
                      className="bg-gray-50 dark:bg-gray-700 border-2 border-wondrous-grey-light dark:border-gray-600 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          style={{ background: client.color }}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-sm"
                        >
                          {client.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-wondrous-grey-dark dark:text-gray-100">
                            {client.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-semibold",
                              hasEnoughCredits
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {client.credits} credits
                            {serviceType &&
                              ` (need ${serviceType.creditsRequired})`}
                          </div>
                        </div>
                      </div>

                      {hasEnoughCredits ? (
                        <Button
                          size="sm"
                          className="w-full bg-wondrous-magenta hover:bg-wondrous-magenta/90 flex items-center justify-center gap-1"
                          onClick={() => {
                            if (selectedSlot && selectedServiceType) {
                              handleCreateBooking(client.id, selectedServiceType, selectedSlot);
                            }
                          }}
                        >
                          <CheckCircle size={16} />
                          Confirm Booking
                        </Button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-orange-50 text-wondrous-orange hover:bg-orange-100 flex items-center justify-center gap-1"
                            onClick={() => {
                              if (selectedSlot && selectedServiceType) {
                                // Create soft hold booking
                                const holdExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                                const newSession: CalendarSession = {
                                  id: `session_${Date.now()}`,
                                  datetime: selectedSlot,
                                  clientId: client.id,
                                  clientName: client.name,
                                  clientAvatar: client.avatar,
                                  clientColor: client.color,
                                  clientCredits: client.credits,
                                  status: "soft-hold",
                                  serviceTypeId: selectedServiceType,
                                  workoutId: null,
                                  holdExpiry: holdExpiry,
                                };
                                addSession(newSession);
                                toast({
                                  title: "Soft Hold Created",
                                  description: `Hold expires in 24 hours • ${client.name}`,
                                });
                                closeBookingPanel();
                              }
                            }}
                          >
                            <Timer size={16} />
                            Soft Hold
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1"
                            onClick={() => {
                              toast({
                                title: "Top Up Email Sent",
                                description: "Credit top-up email sent to client",
                              });
                            }}
                            title="Send credit top-up email to client"
                          >
                            <Mail size={16} />
                            Top Up
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full mt-3"
                onClick={closeBookingPanel}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => handleQuickSlotClick(new Date())}
        className="fixed bottom-24 right-6 lg:bottom-6 w-14 h-14 rounded-full bg-wondrous-magenta text-white text-2xl shadow-lg hover:shadow-xl hover:bg-wondrous-magenta-alt transition-all flex items-center justify-center z-30"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}
