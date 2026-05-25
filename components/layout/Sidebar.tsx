"use client";
// ============================================================
// Component: Sidebar Navigation
// ============================================================
// 
// Design: DESIGN.md Section 9
// - 240px fixed left sidebar
// - Logo, main nav, tracker nav, user card
// ============================================================

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  User,
  Columns,
  CalendarDays,
  Target,
  LogOut,
  Rocket,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useFirebaseAuth } from "@/components/Providers";

// Nav items with icons and labels
const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/jobs", icon: Search, label: "Job Hunter" },
  { href: "/dashboard/assistant", icon: MessageSquare, label: "AI Assistant" },
  { href: "/dashboard/profile", icon: User, label: "My Profile" },
];

const trackerNavItems = [
  { href: "/dashboard/tracker/kanban", icon: Columns, label: "Kanban" },
  { href: "/dashboard/tracker/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/dashboard/tracker/goals", icon: Target, label: "Goals" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useFirebaseAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      const parts = name.split(" ");
      return parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();
    }
    return email?.[0]?.toUpperCase() || "U";
  };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Rocket className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-slate-900">CareerPilot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main
          </p>
          <div className="space-y-1">
            {mainNavItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tracker Section */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Tracker
          </p>
          <div className="space-y-1">
            {trackerNavItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Card */}
      {user && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
              {getInitials(user.displayName, user.email)}
            </div>
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            {/* Logout */}
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="ml-auto text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
