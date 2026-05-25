// ============================================================
// CareerPilot — Job Search API Route
// ============================================================
//
// Searches jobs via JSearch API (RapidAPI)
// Returns structured job listings with optional fit scores
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface JSearchJob {
  employer_name: string;
  job_id: string;
  job_title: string;
  job_city: string;
  job_country: string;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_employment_type?: string;
}

interface JSearchResponse {
  data: JSearchJob[];
}

/**
 * Search for jobs
 * GET /api/jobs/search?query=...&location=...&page=...
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const page = searchParams.get('page') || '1';
  const numPages = searchParams.get('num_pages') || '5';

  if (!query) {
    return NextResponse.json({ jobs: [] });
  }

  try {
    const apiKey = process.env.JSEARCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'JSearch API key not configured' }, { status: 500 });
    }

    // Build query
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await fetch(
      `https://jsearch-api.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&num_pages=${numPages}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch-api.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`);
    }

    const data: JSearchResponse = await response.json();

    // Transform to our Job type
    const jobs = data.data.map((job) => ({
      job_id: job.job_id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      job_city: job.job_city || 'Unknown',
      job_country: job.job_country || 'Unknown',
      job_description: job.job_description,
      job_apply_link: job.job_apply_link,
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc,
      job_min_salary: job.job_min_salary,
      job_max_salary: job.job_max_salary,
      job_employment_type: job.job_employment_type || 'Not specified',
    }));

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Job search error:', error);
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    );
  }
}
