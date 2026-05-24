// ============================================================
// CareerPilot v2 — Adzuna Job Search API
// ============================================================
// 
// Adzuna aggregates job listings from thousands of sources.
// Completely free — no RapidAPI dependency needed.
// 
// Docs: https://developer.adzuna.com/overview
// ============================================================

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  salary?: string;
  postedDate: string;
}

export interface SearchJobsParams {
  query: string;
  location?: string;
  country?: string;
}

/**
 * Search for jobs using Adzuna API
 * 
 * @param query - Job search query (e.g., "Python developer")
 * @param location - Optional location filter (e.g., "London")
 * @returns Array of job results
 */
export async function searchJobs(
  query: string,
  location = ''
): Promise<JobResult[]> {
  const country = 'gb'; // Adzuna uses country codes; 'gb' has most global listings
  
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    results_per_page: '10',
    what: query,
    ...(location && { where: location }),
    content_type: 'application/json',
  });

  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
    );

    if (!response.ok) {
      console.error(`Adzuna API error: ${response.status}`);
      return getFallbackJobs(query);
    }

    const data = await response.json();
    
    return (data.results ?? []).map((job: Record<string, unknown>) => ({
      id: job.id as string,
      title: job.title as string,
      company: (job.company as Record<string, string>)?.display_name ?? 'Unknown',
      location: (job.location as Record<string, string>)?.display_name ?? '',
      description: (job.description as string) ?? '',
      applyUrl: (job.redirect_url as string) ?? '#',
      salary: formatSalary(job.salary_min as number, job.salary_max as number),
      postedDate: (job.created as string) ?? new Date().toISOString(),
    }));
  } catch (error) {
    console.error('[Adzuna] Search failed:', error);
    return getFallbackJobs(query);
  }
}

/**
 * Format salary range for display
 */
function formatSalary(min?: number, max?: number): string | undefined {
  if (!min) return undefined;
  
  const formatK = (n: number) => `$${Math.round(n / 1000)}k`;
  const minStr = formatK(min);
  const maxStr = max ? formatK(max) : undefined;
  
  return maxStr ? `${minStr} – ${maxStr}` : minStr;
}

/**
 * Static fallback jobs — keeps demo running even if Adzuna is down
 */
function getFallbackJobs(query: string): JobResult[] {
  return [
    {
      id: 'fallback-1',
      title: `${query} Engineer`,
      company: 'TechCorp (Demo)',
      location: 'Remote',
      description: `We are looking for a skilled ${query} Engineer to join our growing team. Requirements include strong problem-solving skills and experience with modern tools.`,
      applyUrl: '#',
      salary: '$80k – $120k',
      postedDate: new Date().toISOString(),
    },
    {
      id: 'fallback-2',
      title: `Senior ${query} Developer`,
      company: 'StartupXYZ (Demo)',
      location: 'New York, NY',
      description: `Join our innovative team as a Senior ${query} Developer. We offer competitive salary, equity, and flexible work arrangements.`,
      applyUrl: '#',
      salary: '$100k – $150k',
      postedDate: new Date().toISOString(),
    },
  ];
}