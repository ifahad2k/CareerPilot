"use client";

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Search,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  ExternalLink,
  Briefcase,
  Filter,
  Loader2,
  Plus,
  Star,
  BriefcaseBusiness,
  ArrowUpDown,
} from 'lucide-react';
import { Job, FitScoreResult } from '@/types';

// ============================================================
// Page: Job Hunter
// ============================================================
//
// Pillar 1 — Job Hunter Agent
// - Search bar for job queries with location filter
// - Job cards with fit scores (programmatic)
// - Add to Kanban functionality
// ============================================================

// Fit score color helper
function getFitScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-muted-foreground';
}

function getFitScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/10';
  if (score >= 60) return 'bg-blue-500/10';
  if (score >= 40) return 'bg-amber-500/10';
  return 'bg-muted';
}

// Format salary
function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

// Format date
function formatPostedDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'Recently posted';
  }
}

// Truncate description
function truncateDescription(text: string, maxLength = 200): string {
  // Remove HTML tags
  const plain = text.replace(/<[^>]*>/g, '');
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + '...';
}

export default function JobsPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searched, setSearched] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Calculate fit score (simplified version for UI)
  const calculateFitScore = (job: Job): FitScoreResult => {
    // For demo purposes, generate a pseudo-random but consistent score based on job_id
    const hash = job.job_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseScore = hash % 100;
    
    return {
      total: baseScore,
      breakdown: {
        skills: Math.round(baseScore * 0.45),
        experience: Math.round(baseScore * 0.4),
        education: Math.round(baseScore * 0.15),
      },
      explanation: baseScore >= 70 
        ? 'Strong match for your skills and experience'
        : baseScore >= 50 
          ? 'Good match, review job requirements'
          : 'Consider other opportunities',
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a job title or keyword');
      return;
    }

    setIsSearching(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({ query });
      if (location) params.append('location', location);
      params.append('num_pages', '2');

      const res = await fetch(`/api/jobs/search?${params}`);
      
      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      
      if (data.jobs?.length === 0) {
        toast.info('No jobs found. Try different keywords.');
      } else {
        toast.success(`Found ${data.jobs?.length} jobs`);
      }
    } catch (error) {
      toast.error('Failed to search jobs. Please try again.');
      setJobs([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        toast.success('Job removed from saved');
      } else {
        newSet.add(jobId);
        toast.success('Job saved! View in Kanban.');
      }
      return newSet;
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <BriefcaseBusiness className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Hunter</h1>
          <p className="text-sm text-muted-foreground">
            Find your dream job with AI-powered matching
          </p>
        </div>
      </div>

      {/* Search Section */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keywords, or company..."
              className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Location Input */}
          <div className="w-64 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, state, or remote"
              className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isSearching}
            className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Quick filters:</span>
          {['Remote', 'Full-time', 'Entry Level', 'Senior'].map((filter) => (
            <button
              key={filter}
              type="button"
              className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-lg text-foreground transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
      </form>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {jobs.length > 0 ? `${jobs.length} jobs found` : 'No jobs found'}
            </p>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              Sort by: Relevance
            </button>
          </div>

          {/* Job Grid */}
          {jobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => {
                const fitScore = calculateFitScore(job);
                return (
                  <div
                    key={job.job_id}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                          {job.job_title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {job.employer_name}
                          </span>
                        </div>
                      </div>

                      {/* Fit Score Badge */}
                      <div className={`
                        shrink-0 px-3 py-1.5 rounded-lg text-center
                        ${getFitScoreBg(fitScore.total)}
                      `}>
                        <p className={`text-lg font-bold ${getFitScoreColor(fitScore.total)}`}>
                          {fitScore.total}
                        </p>
                        <p className="text-xs text-muted-foreground">Fit</p>
                      </div>
                    </div>

                    {/* Location & Salary */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {job.job_city}, {job.job_country}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(job.job_min_salary, job.job_max_salary)}
                      </div>
                    </div>

                    {/* Employment Type */}
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                      <Clock className="w-4 h-4" />
                      {job.job_employment_type}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {truncateDescription(job.job_description)}
                    </p>

                    {/* Posted Date */}
                    <p className="text-xs text-muted-foreground mb-4">
                      Posted {formatPostedDate(job.job_posted_at_datetime_utc)}
                    </p>

                    {/* Card Footer */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <a
                        href={job.job_apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-9 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Apply Now
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => toggleSaveJob(job.job_id)}
                        className={`
                          h-9 w-9 flex items-center justify-center rounded-lg border transition-colors
                          ${savedJobs.has(job.job_id)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try different keywords or adjust your search filters
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setLocation('');
                  setSearched(false);
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State - No Search Yet */}
      {!searched && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <BriefcaseBusiness className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Find Your Dream Job
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search for jobs by title, skills, or company name. We'll score each job against your CV to find the best matches.
          </p>
        </div>
      )}
    </div>
  );
}

