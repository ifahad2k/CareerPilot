"use client";

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Kanban,
  Plus,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Loader2,
  X,
  GripVertical,
  MapPin,
  DollarSign,
  Edit2,
  Check,
  Briefcase,
} from 'lucide-react';
import { Application, ApplicationStatus } from '@/types';

// ============================================================
// Page: Kanban Tracker
// ============================================================
//
// Pillar 4 — Productivity & Progress Tracker
// - Kanban board with 4 columns: Applied, Interviewing, Offer, Rejected
// - Drag-and-drop between columns
// - Add/edit/delete applications
// ============================================================

interface KanbanColumn {
  status: ApplicationStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const COLUMNS: KanbanColumn[] = [
  {
    status: 'applied',
    title: 'Applied',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    status: 'interviewing',
    title: 'Interviewing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    status: 'offer',
    title: 'Offer',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    status: 'rejected',
    title: 'Rejected',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
];

interface NewApplication {
  role: string;
  company: string;
  location: string;
  salaryRange: string;
  jobUrl: string;
}

export default function KanbanPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<ApplicationStatus | null>(null);
  const [newApp, setNewApp] = useState<NewApplication>({
    role: '',
    company: '',
    location: '',
    salaryRange: '',
    jobUrl: '',
  });

  // Fetch applications
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addApplication = async () => {
    if (!newApp.role || !newApp.company) {
      toast.error('Please fill in role and company');
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newApp.role,
          company: newApp.company,
          location: newApp.location || null,
          salary_range: newApp.salaryRange || null,
          job_url: newApp.jobUrl || null,
          status: 'applied',
        }),
      });

      if (res.ok) {
        toast.success('Application added!');
        setShowAddModal(false);
        setNewApp({ role: '', company: '', location: '', salaryRange: '', jobUrl: '' });
        fetchApplications();
      } else {
        toast.error('Failed to add application');
      }
    } catch (error) {
      toast.error('Failed to add application');
    }
  };

  const updateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
      fetchApplications(); // Revert on error
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm('Delete this application?')) return;

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Application deleted');
        setApplications(prev => prev.filter(app => app.id !== appId));
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedId(appId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDropTarget(status);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    if (draggedId) {
      updateStatus(draggedId, newStatus);
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const getColumnApplications = (status: ApplicationStatus) =>
    applications.filter(app => app.status === status);

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
            <Kanban className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Tracker</h1>
            <p className="text-sm text-muted-foreground">
              {applications.length} applications tracked
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnApps = getColumnApplications(column.status);
          const isDropTarget = dropTarget === column.status;

          return (
            <div
              key={column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`
                flex-shrink-0 w-80 min-h-[500px] rounded-xl border-2 border-dashed p-4 transition-colors
                ${isDropTarget
                  ? `${column.borderColor} ${column.bgColor}`
                  : 'border-border'
                }
              `}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color.replace('text-', 'bg-')}`} />
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                </div>
                <span className="px-2 py-0.5 bg-muted rounded text-sm text-muted-foreground">
                  {columnApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {columnApps.map((app) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing
                      hover:border-primary/30 transition-colors
                      ${draggedId === app.id ? 'opacity-50' : ''}
                    `}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-2">
                          {app.role}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {app.company}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Card Details */}
                    {app.location && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {app.location}
                      </div>
                    )}
                    {app.salary_range && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                        <DollarSign className="w-4 h-4" />
                        {app.salary_range}
                      </div>
                    )}

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(app.applied_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {columnApps.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No applications</p>
                    <p className="text-xs mt-1">Drag jobs here or click Add</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add Application</h2>
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
                  Job Title *
                </label>
                <input
                  type="text"
                  value={newApp.role}
                  onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  placeholder="e.g. Google"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={newApp.location}
                  onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={newApp.salaryRange}
                  onChange={(e) => setNewApp({ ...newApp, salaryRange: e.target.value })}
                  placeholder="e.g. $120k - $150k"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Job URL
                </label>
                <input
                  type="url"
                  value={newApp.jobUrl}
                  onChange={(e) => setNewApp({ ...newApp, jobUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                onClick={addApplication}
                className="flex-1 h-10 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}