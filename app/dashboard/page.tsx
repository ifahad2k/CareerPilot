"use client";
// ============================================================
// Page: Dashboard Home
// ============================================================

import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/components/Providers";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  Flame,
} from "lucide-react";

interface DashboardActivity {
  text: string;
  time: string;
}

interface DashboardStats {
  applicationsThisWeek: number;
  totalApplications: number;
  interviewing: number;
  offers: number;
  rejected: number;
  applied: number;
  streak: number;
  avgFitScore: number;
  recentActivity: DashboardActivity[];
}

const EMPTY_STATS: DashboardStats = {
  applicationsThisWeek: 0,
  totalApplications: 0,
  interviewing: 0,
  offers: 0,
  rejected: 0,
  applied: 0,
  streak: 0,
  avgFitScore: 0,
  recentActivity: [],
};

export default function DashboardPage() {
  const { user, loading } = useFirebaseAuth();
  const [mounted, setMounted] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setStats(EMPTY_STATS);
          return;
        }

        const data = await res.json();
        setStats({
          applicationsThisWeek: Number(data.applicationsThisWeek ?? 0),
          totalApplications: Number(data.totalApplications ?? 0),
          interviewing: Number(data.interviewing ?? 0),
          offers: Number(data.offers ?? 0),
          rejected: Number(data.rejected ?? 0),
          applied: Number(data.applied ?? 0),
          streak: Number(data.streak ?? 0),
          avgFitScore: Number(data.avgFitScore ?? 0),
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setStats(EMPTY_STATS);
      } finally {
        setStatsLoading(false);
      }
    }

    if (mounted && user) {
      fetchStats();
    } else if (mounted && !user) {
      setStatsLoading(false);
    }
  }, [mounted, user]);

  // Skeleton loading state
  if (!mounted || loading || statsLoading) {
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

  if (!user) {
    return null;
  }

  const weeklyGoalTarget = 5;
  const weeklyGoalProgress = Math.min(stats.applicationsThisWeek, weeklyGoalTarget);
  const weeklyGoalPercent = Math.round((weeklyGoalProgress / weeklyGoalTarget) * 100);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here&apos;s your career activity overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={stats.applicationsThisWeek}
          subtext={`${stats.totalApplications} total`}
          color="blue"
        />

        <StatCard
          icon={Clock}
          label="Interviewing"
          value={stats.interviewing}
          subtext={`${stats.offers} offer${stats.offers !== 1 ? "s" : ""}`}
          color="purple"
        />

        <StatCard
          icon={TrendingUp}
          label="Avg Fit Score"
          value={`${stats.avgFitScore}%`}
          subtext="Across all jobs"
          color="green"
        />

        <StatCard
          icon={Flame}
          label="Streak"
          value={`${stats.streak} day${stats.streak !== 1 ? "s" : ""}`}
          subtext={stats.streak > 0 ? "Keep it going!" : "Start your streak"}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base">AI Career Nudge</h3>
              <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                {stats.totalApplications === 0
                  ? "You have no tracked applications yet. Add your first job in Kanban or Job Hunter."
                  : `You have ${stats.interviewing} active interview${stats.interviewing !== 1 ? "s" : ""}. Keep your momentum this week.`}
              </p>
            </div>
          </div>
        </div>

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
              <span className="font-semibold text-slate-800">
                {weeklyGoalProgress}/{weeklyGoalTarget}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${weeklyGoalPercent}%` }}
              />
            </div>
          </div>
        </div>

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
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item, index) => (
                <ActivityItem key={`${item.text}-${index}`} text={item.text} time={item.time} />
              ))
            ) : (
              <p className="text-sm text-slate-500">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Application Pipeline
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <PipelineColumn label="Applied" count={stats.applied} color="blue" />
          <PipelineColumn label="Interviewing" count={stats.interviewing} color="purple" />
          <PipelineColumn label="Offers" count={stats.offers} color="green" />
          <PipelineColumn label="Rejected" count={stats.rejected} color="slate" />
        </div>
      </div>
    </div>
  );
}

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
