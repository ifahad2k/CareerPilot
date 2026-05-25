// ============================================================
// CareerPilot v2 — CV Upload API Route
// ============================================================
// 
// Pipeline: parse → preprocess → chunk → embed → store
// All chunks stored in Firestore under cvChunks/{userId}/chunks
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { parseCV } from '@/lib/cv/parser';
import { preprocessText } from '@/lib/cv/preprocessor';
import { chunkCV } from '@/lib/cv/chunker';
import { embedTexts } from '@/lib/ai/embeddings';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAuthToken } from '@/lib/firebase/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Upload and process a CV file
 * POST /api/cv/upload
 * 
 * Steps:
 * 1. Verify Firebase auth token
 * 2. Parse file (PDF/DOCX) → raw text
 * 3. Clean text with preprocessor
 * 4. Classify sections with Gemini
 * 5. Store CV metadata in Firestore
 * 6. Chunk parsed sections
 * 7. Generate embeddings (with rate limit handling)
 * 8. Store chunks in Firestore
 */
export async function POST(req: NextRequest) {
  // 1. Verify authentication
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get file from form data
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    // 3. Parse CV file → raw text
    const rawText = preprocessText(await parseCV(file));

    // 4. Classify sections using Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const sectionResult = await model.generateContent(
      `Parse this CV into JSON with keys: summary (string), experience (string[]), education (string[]), skills (string[]), projects (string[]). Each array item should be one complete entry. Return ONLY valid JSON, no explanation, no backticks, no markdown.\n\nCV:\n${rawText.slice(0, 8000)}`
    );

    // 5. Parse the JSON response
    let parsedSections: Record<string, string | string[]>;
    try {
      const text = sectionResult.response.text().replace(/```json|```/g, '').trim();
      parsedSections = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse CV sections. Try a cleaner PDF format.' },
        { status: 422 }
      );
    }

    // 6. Store CV metadata in Firestore
    await adminDb.collection('cvs').doc(userId).set({
      filename: file.name,
      rawText,
      parsedSections,
      uploadedAt: new Date(),
    });

    // 7. Chunk the parsed sections
    const chunks = chunkCV(parsedSections);

    // 8. Generate embeddings with rate limit handling
    // Gemini free tier: 15 requests/minute
    // Add 100ms delay between every 10 embed calls
    const embeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += 10) {
      const batch = chunks.slice(i, i + 10);
      const batchEmbeddings = await embedTexts(batch.map(c => c.content));
      embeddings.push(...batchEmbeddings);
      
      // Rate limit: wait 100ms between batches
      if (i + 10 < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 9. Delete old chunks from Firestore
    const chunksRef = adminDb.collection('cvChunks').doc(userId).collection('chunks');
    const oldChunks = await chunksRef.get();
    if (!oldChunks.empty) {
      const deletePromises = oldChunks.docs.map(d => d.ref.delete());
      await Promise.all(deletePromises);
    }

    // 10. Insert new chunks with embeddings
    const insertPromises = chunks.map((chunk, i) =>
      chunksRef.add({
        section: chunk.section,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        embedding: embeddings[i],
      })
    );
    await Promise.all(insertPromises);

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length,
    });

  } catch (error) {
    console.error('CV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process CV. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Get stored CV data
 * GET /api/cv/upload
 */
export async function GET(req: NextRequest) {
  // 1. Verify authentication
  const userId = await verifyAuthToken(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get CV metadata from Firestore
    const cvRef = adminDb.collection('cvs').doc(userId);
    const cvDoc = await cvRef.get();

    if (!cvDoc.exists) {
      return NextResponse.json({ cv: null });
    }

    const cvData = cvDoc.data();

    // Get chunk count
    const chunksRef = adminDb.collection('cvChunks').doc(userId).collection('chunks');
    const chunksSnapshot = await chunksRef.get();

    return NextResponse.json({
      cv: {
        filename: cvData?.filename,
        uploadedAt: cvData?.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        parsedSections: cvData?.parsedSections,
        chunkCount: chunksSnapshot.size,
      },
    });
  } catch (error) {
    console.error('CV fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CV data' },
      { status: 500 }
    );
  }
}
