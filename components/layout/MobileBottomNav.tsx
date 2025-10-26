"use client";

import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Home, Calendar, Settings, FileText, Dumbbell, BookOpen, LayoutDashboard, Clock } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}

// Navigation items for each role
const studioOwnerNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/studio-owner",
  },
  {
    id: "services",
    label: "Services",
    icon: Clock,
    route: "/studio-owner/services",
  },
  {
    id: "templates",
    label: "Templates",
    icon: FileText,
    route: "/studio-owner/templates",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "/settings",
  },
];

const trainerNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/trainer",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    route: "/trainer/calendar",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: Dumbbell,
    route: "/trainer/sessions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "/settings",
  },
];

const clientNavItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    route: "/client",
  },
  {
    id: "history",
    label: "History",
    icon: BookOpen,
    route: "/client/sessions",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    route: "/settings",
  },
];

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentRole } = useUserStore();

  // Select navigation items based on current role
  const navItems =
    currentRole === 'studio_owner' ? studioOwnerNavItems :
    currentRole === 'trainer' ? trainerNavItems :
    clientNavItems;

  const getActiveTab = () => {
    // Settings route (common to all)
    if (pathname.startsWith("/settings")) return "settings";

    // Studio Owner routes
    if (currentRole === 'studio_owner') {
      if (pathname.startsWith("/studio-owner/services")) return "services";
      if (pathname.startsWith("/studio-owner/templates")) return "templates";
      if (pathname.startsWith("/studio-owner/sessions")) return "sessions";
      if (pathname.startsWith("/studio-owner")) return "dashboard";
    }

    // Trainer routes
    if (currentRole === 'trainer') {
      if (pathname.startsWith("/trainer/calendar")) return "calendar";
      if (pathname.startsWith("/trainer/sessions")) return "sessions";
      if (pathname.startsWith("/trainer")) return "dashboard";
    }

    // Client routes
    if (currentRole === 'client') {
      if (pathname.startsWith("/client/sessions")) return "history";
      if (pathname.startsWith("/client")) return "home";
    }

    return navItems[0]?.id || "home";
  };

  const activeTab = getActiveTab();

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 dark:from-white/5 to-transparent pointer-events-none" />

      <div className="relative bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl border-t border-wondrous-grey-light dark:border-gray-700 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Safe area padding for devices with home indicator */}
        <div
          className="px-3 sm:px-4 pt-2 pb-1"
          style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.route)}
                  className="relative flex flex-col items-center justify-center py-1.5 px-2 min-w-0 flex-1 group transition-all touch-manipulation"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Icon Container */}
                  <div className="relative mb-0.5">
                    <motion.div
                      whileTap={{ scale: 0.88 }}
                      className={`p-2 sm:p-2.5 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-wondrous-magenta text-white shadow-lg shadow-wondrous-magenta/30"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-wondrous-grey-dark dark:group-hover:text-gray-300 group-active:bg-gray-100/80 dark:group-active:bg-gray-700"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 sm:w-5 sm:h-5 transition-transform ${
                          isActive ? "scale-110" : ""
                        }`}
                      />
                    </motion.div>
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-semibold transition-all duration-200 truncate max-w-full ${
                      isActive
                        ? "text-wondrous-magenta scale-105"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-wondrous-grey-dark dark:group-hover:text-gray-300"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator Dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-wondrous-magenta rounded-full"
                      style={{ transform: "translateX(-50%)" }}
                      transition={{ type: "spring", damping: 30, stiffness: 500 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
