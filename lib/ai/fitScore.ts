// ============================================================
// CareerPilot v2 — Fit Score Engine
// ============================================================
// 
// Programmatic fit score using Gemini embeddings + cosine similarity
// Weights: Skills 45%, Experience 40%, Education 15%
// ============================================================

import { cosineSimilarity } from './cosine';
import { generateEmbedding } from './embeddings';
import { CVChunk, FitScoreResult } from '@/types';

interface CVProfile {
  skills: string[];
  experience: string;
  education: string;
}

interface JobProfile {
  title: string;
  description: string;
  requirements?: string;
}

/**
 * Calculate fit score between CV and job description
 * Uses Gemini embeddings for semantic similarity
 */
export async function calculateFitScore(
  cvProfile: CVProfile,
  job: JobProfile
): Promise<FitScoreResult> {
  const jobText = `${job.title}. ${job.description} ${job.requirements || ''}`;

  // Generate embeddings for each CV section and job
  const [skillEmb, expEmb, eduEmb, jobEmb] = await Promise.all([
    generateEmbedding(cvProfile.skills.join('. ')),
    generateEmbedding(cvProfile.experience),
    generateEmbedding(cvProfile.education),
    generateEmbedding(jobText),
  ]);

  // Calculate section similarities
  const skillSim = cosineSimilarity(skillEmb, jobEmb);
  const expSim = cosineSimilarity(expEmb, jobEmb);
  const eduSim = cosineSimilarity(eduEmb, jobEmb);

  // Calculate weighted total
  const total = Math.round(
    skillSim * 45 + expSim * 40 + eduSim * 15
  );

  return {
    total: Math.min(100, total),
    breakdown: {
      skills: Math.round(skillSim * 100),
      experience: Math.round(expSim * 100),
      education: Math.round(eduSim * 100),
    },
    explanation: buildExplanation(cvProfile.skills, job.description),
  };
}

/**
 * Score a list of CV chunks against a job description
 * Returns chunks sorted by relevance
 */
export async function scoreChunksAgainstJob(
  chunks: CVChunk[],
  jobDescription: string
): Promise<{ chunk: CVChunk; score: number }[]> {
  const jobEmb = await generateEmbedding(jobDescription);
  
  const scored = chunks.map(async (chunk) => {
    const chunkEmb = await generateEmbedding(chunk.content);
    const score = cosineSimilarity(chunkEmb, jobEmb);
    return { chunk, score };
  });

  return (await Promise.all(scored)).sort((a, b) => b.score - a.score);
}

/**
 * Build human-readable explanation of fit
 */
function buildExplanation(cvSkills: string[], jobDescription: string): string {
  const jobLower = jobDescription.toLowerCase();
  const matched = cvSkills.filter(skill => 
    jobLower.includes(skill.toLowerCase())
  );
  const missing = cvSkills.filter(skill => 
    !jobLower.includes(skill.toLowerCase())
  );

  let explanation = '';
  if (matched.length > 0) {
    explanation += `Strong match on: ${matched.slice(0, 5).join(', ')}. `;
  }
  if (missing.length > 0) {
    explanation += `Consider highlighting: ${missing.slice(0, 3).join(', ')}`;
  }
  if (!explanation) {
    explanation = 'Review job requirements to align your CV.';
  }
  return explanation;
}
