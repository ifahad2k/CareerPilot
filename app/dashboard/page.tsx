"use client";
// ============================================================
// Page: Dashboard Home
// ============================================================
// 
// Design: DESIGN.md Sections 2-4
// Statistics overview with:
// - Applications sent this week
// - Applications by status
// - Current streak
// - Roadmap progress
// - AI nudge banner (when inactive)
// ============================================================

import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/components/Providers";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";

// Mock data for demonstration
const mockStats = {
  applicationsThisWeek: 12,
  totalApplications: 47,
  interviewing: 5,
  offers: 1,
  streak: 7,
  avgFitScore: 78,
};

export default function DashboardPage() {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skeleton loading state
  if (!mounted || loading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by layout, but safety check)
  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here&apos;s your career activity overview.
        </p>
      </div>

      {/* Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Applications This Week */}
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={mockStats.applicationsThisWeek}
          subtext={`${mockStats.totalApplications} total`}
          color="blue"
        />

        {/* Interviewing */}
        <StatCard
          icon={Clock}
          label="Interviewing"
          value={mockStats.interviewing}
          subtext={`${mockStats.offers} offer${mockStats.offers !== 1 ? "s" : ""}`}
          color="purple"
        />

        {/* Fit Score */}
        <StatCard
          icon={TrendingUp}
          label="Avg Fit Score"
          value={`${mockStats.avgFitScore}%`}
          subtext="Across all jobs"
          color="green"
        />

        {/* Streak */}
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${mockStats.streak} days`}
          subtext="Keep it going!"
          color="orange"
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Nudge Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">AI Career Nudge</h3>
              <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                Based on your profile, there are 3 new ML internships in Dhaka matching your skills.
              </p>
              <button className="mt-3 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
                View Jobs
              </button>
            </div>
          </div>
        </div>

        {/* Goal Progress Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Weekly Goal</h3>
              <p className="text-xs text-slate-500">Apply to 5 jobs</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-semibold text-slate-800">3/5</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Recent Activity</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
          </div>
          <div className="space-y-3">
            <ActivityItem
              text="Applied to Software Engineer at TechCorp"
              time="2 hours ago"
            />
            <ActivityItem
              text="Interview scheduled with DataAI Inc."
              time="Yesterday"
            />
            <ActivityItem
              text="CV updated with new project"
              time="2 days ago"
            />
          </div>
        </div>
      </div>

      {/* Application Status Breakdown */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Application Pipeline
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <PipelineColumn
            label="Applied"
            count={15}
            color="blue"
          />
          <PipelineColumn
            label="Interviewing"
            count={mockStats.interviewing}
            color="purple"
          />
          <PipelineColumn
            label="Offers"
            count={mockStats.offers}
            color="green"
          />
          <PipelineColumn
            label="Rejected"
            count={8}
            color="slate"
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">{text}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

// Pipeline Column Component
function PipelineColumn({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "blue" | "purple" | "green" | "slate";
}) {
  const colorClasses = {
    blue: "border-blue-500 bg-blue-50 text-blue-700",
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    green: "border-green-500 bg-green-50 text-green-700",
    slate: "border-slate-300 bg-slate-50 text-slate-600",
  };

  return (
    <div className={`rounded-xl p-4 border-l-4 ${colorClasses[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-semibold mt-1">{label}</p>
    </div>
  );
}

