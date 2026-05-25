"use client";

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  X,
  TrendingUp,
  Zap,
  Sparkles,
  Trash2,
} from 'lucide-react';

// ============================================================
// Page: Goals
// ============================================================
//
// Pillar 4 — Productivity & Progress Tracker
// - Goal categories: Apply, Learn, CV, General
// - Progress tracking with completion percentage
// - AI nudge system for suggestions
// ============================================================

interface Goal {
  id: string;
  title: string;
  category: 'apply' | 'learn' | 'cv' | 'general';
  completed: boolean;
  createdAt: string;
  dueDate?: string;
}

interface AINudge {
  id: string;
  type: 'tip' | 'reminder' | 'suggestion';
  message: string;
  timestamp: string;
}

const CATEGORY_CONFIG = {
  apply: {
    label: 'Applications',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    icon: Target,
  },
  learn: {
    label: 'Learning',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    icon: TrendingUp,
  },
  cv: {
    label: 'CV Builder',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    icon: Sparkles,
  },
  general: {
    label: 'General',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    icon: Zap,
  },
};

const SUGGESTED_GOALS = [
  { title: 'Apply to 5 jobs this week', category: 'apply' as const },
  { title: 'Update my CV with new projects', category: 'cv' as const },
  { title: 'Practice coding interview problems', category: 'learn' as const },
  { title: 'Research company benefits', category: 'general' as const },
];

export default function GoalsPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nudges, setNudges] = useState<AINudge[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'general' as Goal['category'],
    dueDate: '',
  });

  // Fetch goals
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
        if (data.nudges) {
          setNudges(data.nudges);
        }
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (res.ok) {
        toast.success(completed ? 'Goal marked incomplete' : 'Goal completed! 🎉');
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Goal deleted');
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const addGoal = async () => {
    if (!newGoal.title.trim()) {
      toast.error('Please enter a goal');
      return;
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newGoal.title,
          category: newGoal.category,
          dueDate: newGoal.dueDate || null,
        }),
      });

      if (res.ok) {
        toast.success('Goal added');
        setShowAddModal(false);
        setNewGoal({ title: '', category: 'general', dueDate: '' });
        fetchGoals();
      }
    } catch (error) {
      toast.error('Failed to add goal');
    }
  };

  const addSuggestedGoal = (goal: typeof SUGGESTED_GOALS[0]) => {
    setNewGoal({ title: goal.title, category: goal.category, dueDate: '' });
    setShowAddModal(true);
  };

  // Calculate stats
  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.completed).length,
    pending: goals.filter(g => !g.completed).length,
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Goals</h1>
            <p className="text-sm text-muted-foreground">
              Track your career milestones and tasks
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Goals</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-primary">{completionRate}%</p>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Nudges */}
      {nudges.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">AI Suggestions</p>
              <p className="text-sm text-muted-foreground">
                {nudges[0].message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map(category => {
          const config = CATEGORY_CONFIG[category];
          const CategoryIcon = config.icon;
          const categoryGoals = goals.filter(g => g.category === category);
          const completedCount = categoryGoals.filter(g => g.completed).length;
          const progress = categoryGoals.length > 0
            ? Math.round((completedCount / categoryGoals.length) * 100)
            : 0;

          return (
            <div
              key={category}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className={`p-4 border-b border-border ${config.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completedCount}/{categoryGoals.length}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="p-4 space-y-2">
                {categoryGoals.length > 0 ? (
                  categoryGoals.map(goal => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                    >
                      <button
                        onClick={() => toggleGoal(goal.id, goal.completed)}
                        className="flex-shrink-0 transition-colors"
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>
                      <span className={goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                        {goal.title}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No {config.label.toLowerCase()} goals yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Goals */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Suggested Goals
        </h3>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_GOALS.map((goal, index) => (
            <button
              key={index}
              onClick={() => addSuggestedGoal(goal)}
              className="px-3 py-2 bg-muted hover:bg-muted/70 rounded-lg text-sm text-foreground transition-colors flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              {goal.title}
            </button>
          ))}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add New Goal</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Goal *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g. Apply to 5 jobs this week"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map(cat => {
                    const config = CATEGORY_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewGoal({ ...newGoal, category: cat })}
                        className={`
                          px-3 py-2 rounded-lg text-sm capitalize transition-colors border
                          ${newGoal.category === cat
                            ? config.color
                            : 'border-border hover:bg-muted text-foreground'
                          }
                        `}
                      >
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 h-10 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                className="flex-1 h-10 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}