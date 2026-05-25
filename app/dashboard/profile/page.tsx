"use client";

import { useState, useEffect, useCallback, DragEvent } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  ChevronRight,
  X,
} from 'lucide-react';

// ============================================================
// Page: My Profile / CV Upload
// ============================================================
//
// Pillar 2 — Profile & Resume Intelligence
// - CV upload (PDF/DOCX) with drag-drop
// - CV section viewer (summary, experience, education, skills, projects)
// - Profile settings
// ============================================================

interface CVData {
  filename: string;
  uploadedAt: string;
  parsedSections: {
    summary?: string;
    experience?: string[];
    education?: string[];
    skills?: string[];
    projects?: string[];
  };
  chunkCount?: number;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export default function ProfilePage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [chunks, setChunks] = useState<{ id: string; section: string; content: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch CV data on mount
  useEffect(() => {
    if (user) {
      fetchCVData();
      fetchChunks();
    }
  }, [user]);

  const fetchCVData = async () => {
    try {
      const res = await fetch('/api/cv/upload', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.cv) {
          setCvData(data.cv);
        }
      }
    } catch (error) {
      console.error('Failed to fetch CV data:', error);
    }
  };

  const fetchChunks = async () => {
    try {
      const res = await fetch('/api/cv/chunks');
      if (res.ok) {
        const data = await res.json();
        setChunks(data.chunks || []);
      }
    } catch (error) {
      console.error('Failed to fetch chunks:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(10);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(30);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 500);

      setUploadStatus('processing');
      setUploadProgress(50);

      const res = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);
      setUploadStatus('complete');

      toast.success(`CV uploaded successfully! ${data.chunkCount} chunks created.`);

      // Refresh CV data
      await fetchCVData();
      await fetchChunks();

    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to process CV');
      toast.error(error.message || 'Failed to upload CV');
    }
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
  };

  // Section card configuration
  const sectionConfig = [
    { key: 'summary', icon: User, label: 'Summary', color: 'text-violet-500' },
    { key: 'experience', icon: Briefcase, label: 'Experience', color: 'text-blue-500' },
    { key: 'education', icon: GraduationCap, label: 'Education', color: 'text-emerald-500' },
    { key: 'skills', icon: Code2, label: 'Skills', color: 'text-amber-500' },
    { key: 'projects', icon: FolderGit2, label: 'Projects', color: 'text-rose-500' },
  ] as const;

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage your CV for AI-powered job matching
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upload Your CV</h2>
          
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : uploadStatus === 'error' 
                  ? 'border-red-500 bg-red-500/5' 
                  : uploadStatus === 'complete'
                    ? 'border-emerald-500 bg-emerald-500/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3">
                  <div className={`
                    w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center
                    ${isDragging ? 'bg-primary/10' : ''}
                  `}>
                    <Upload className={`w-6 h-6 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {isDragging ? 'Drop your CV here' : 'Drag & drop your CV'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse (PDF, DOCX up to 10MB)
                    </p>
                  </div>
                </div>
              </>
            ) : uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing CV...'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This may take a moment
                  </p>
                </div>
                {/* Progress Bar */}
                <div className="w-full max-w-xs mx-auto">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
                </div>
              </div>
            ) : uploadStatus === 'complete' ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">CV Uploaded Successfully!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {chunks.length} chunks indexed for AI matching
                  </p>
                </div>
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Upload New CV
                </button>
              </div>
            ) : null}
          </div>

          {uploadStatus === 'error' && errorMessage && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-500">Upload Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <button onClick={resetUpload} className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">CV Status</h2>
          
          {cvData ? (
            <div className="space-y-4">
              {/* Current CV Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{cvData.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {new Date(cvData.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chunk Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Chunks Created</p>
                  <p className="text-2xl font-bold text-foreground">{chunks.length}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold text-emerald-500">Ready</p>
                </div>
              </div>

              {/* Sections Summary */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Parsed Sections</p>
                <div className="grid grid-cols-2 gap-2">
                  {sectionConfig.map(({ key, icon: Icon, label, color }) => {
                    const value = cvData.parsedSections[key as keyof typeof cvData.parsedSections];
                    const count = Array.isArray(value) ? value.length : value ? 1 : 0;
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-foreground">{label}</span>
                        <span className="text-muted-foreground ml-auto">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No CV uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your CV to enable AI-powered job matching
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Parsed Sections */}
      {cvData && cvData.parsedSections && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Parsed CV Sections</h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sectionConfig.map(({ key, icon: Icon, label, color }) => {
              const value = cvData.parsedSections[key as keyof typeof cvData.parsedSections];
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{label}</h3>
                  </div>

                  {typeof value === 'string' ? (
                    <p className="text-sm text-muted-foreground line-clamp-4">{value}</p>
                  ) : (
                    <ul className="space-y-2">
                      {value.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground line-clamp-2">{item}</span>
                        </li>
                      ))}
                      {value.length > 5 && (
                        <li className="text-sm text-muted-foreground pl-6">
                          +{value.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

