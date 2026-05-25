"use client";
// ============================================================
// Layout: Dashboard Shell
// ============================================================
// 
// Provides sidebar navigation and main content wrapper.
// Sidebar includes:
// - Main: Dashboard, Job Hunter, AI Assistant, My Profile
// - Tracker: Kanban, Calendar, Goals
// - Account: Settings, Logout
// ============================================================

import { useFirebaseAuth } from "@/components/Providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}

