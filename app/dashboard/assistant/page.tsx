"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquare,
} from 'lucide-react';
import { ChatMessage, CVChunk } from '@/types';

// ============================================================
// Page: AI Assistant
// ============================================================
//
// Pillar 3 — Personal AI Assistant
// - Conversational interface with session memory
// - RAG-grounded responses from CV context
// - RAG source panel showing which CV sections were used
// ============================================================

interface Message extends ChatMessage {
  isLoading?: boolean;
}

interface RAGSource {
  section: string;
  content: string;
  relevance: number;
}

export default function AssistantPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [currentSources, setCurrentSources] = useState<RAGSource[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!authLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [authLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      session_id: 'current',
      user_id: user?.uid || 'anonymous',
      role: 'user',
      content: userMessage,
      rag_chunks_used: [],
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Add loading message
    const loadingMsg: Message = {
      id: `loading-${Date.now()}`,
      session_id: 'current',
      user_id: 'assistant',
      role: 'assistant',
      content: '',
      rag_chunks_used: [],
      created_at: new Date().toISOString(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.filter(m => !m.isLoading).slice(-10),
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      
      // Remove loading message and add actual response
      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isLoading);
        return [
          ...withoutLoading,
          {
            id: `assistant-${Date.now()}`,
            session_id: 'current',
            user_id: 'assistant',
            role: 'assistant',
            content: data.response,
            rag_chunks_used: data.ragChunks || [],
            created_at: new Date().toISOString(),
          },
        ];
      });

      // Set sources if available
      if (data.ragChunks && data.ragChunks.length > 0) {
        setCurrentSources(
          data.ragChunks.map((chunk: CVChunk) => ({
            section: chunk.section,
            content: chunk.content,
            relevance: 0.85,
          }))
        );
      }

    } catch (error) {
      // Remove loading message on error
      setMessages(prev => prev.filter(m => !m.isLoading));
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentSources([]);
    toast.success('Chat cleared');
  };

  // Suggested prompts
  const suggestedPrompts = [
    "What jobs should I apply for based on my CV?",
    "How can I improve my resume for tech roles?",
    "What skills should I learn for my target role?",
    "Help me prepare for a technical interview",
  ];

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Career Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Powered by your CV context
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Hello, {user?.displayName?.split(' ')[0] || 'there'}! 👋
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              I'm your AI career assistant. I know your CV and can help you with job applications, 
              interview prep, and career advice tailored to your experience.
            </p>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl text-left hover:border-primary/30 transition-colors group"
                >
                  <MessageSquare className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm text-foreground">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`
                shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                ${message.role === 'user' ? 'bg-primary' : 'bg-muted'}
              `}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-primary-foreground" />
                ) : message.isLoading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <Bot className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`
                  inline-block p-4 rounded-2xl text-sm leading-relaxed
                  ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-md'
                    : 'bg-muted text-foreground rounded-tl-md'
                  }
                  ${message.isLoading ? 'animate-pulse' : ''}
                `}>
                  {message.isLoading ? (
                    'Thinking...'
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* RAG Sources Panel */}
      {currentSources.length > 0 && (
        <div className="px-6 py-3 bg-muted/50 border-t border-border">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>{currentSources.length} sources from your CV</span>
            {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showSources && (
            <div className="mt-3 space-y-2">
              {currentSources.map((source, i) => (
                <div key={i} className="p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary uppercase">
                      {source.section}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(source.relevance * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your career..."
              rows={1}
              className="w-full h-12 px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-12 px-6 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Send
          </button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}