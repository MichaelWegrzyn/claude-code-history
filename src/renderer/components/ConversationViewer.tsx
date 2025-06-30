import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ConversationSession } from '@shared/types/conversation';
import { ConversationDetail } from './ConversationDetail';
import { SummaryDialog } from './SummaryDialog';
import { Toast } from './ui/Toast';

interface ConversationViewerProps {
  projectPath: string | null;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
}

export function ConversationViewer({ 
  projectPath, 
  selectedSessionId, 
  onSelectSession 
}: ConversationViewerProps) {
  const [summarySessionId, setSummarySessionId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['conversations', projectPath],
    queryFn: () => projectPath ? window.api.loadConversations(projectPath) : Promise.resolve([]),
    enabled: !!projectPath,
    retry: 2,
    staleTime: 10000, // 10 seconds
  });

  if (!projectPath) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Select a project to view conversations
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a project from the sidebar to browse its conversation history
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted mb-2" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-16 bg-muted rounded" />
                    <div className="h-3 w-12 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded" />
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 rounded-full bg-red-100 p-6">
            <svg className="h-12 w-12 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Failed to load conversations</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred while loading conversations.'}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show conversation detail if one is selected
  if (selectedSessionId && selectedSessionId.trim() && projectPath) {
    return (
      <ConversationDetail
        sessionId={selectedSessionId}
        projectPath={projectPath}
        onClose={() => onSelectSession(null)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 p-6 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Conversations</h2>
            <p className="text-sm text-slate-600">
              {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} in this project
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-blue-700">{sessions.length}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {sessions.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="mb-8 w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-3">No conversations yet</h3>
              <p className="text-slate-500 leading-relaxed">
                Start a new Claude Code session in this project to see conversations appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {sessions.map((session) => (
              <ConversationCard
                key={session.id}
                session={session}
                isSelected={selectedSessionId === session.id}
                onClick={() => onSelectSession(session.id)}
                onSummary={() => setSummarySessionId(session.id)}
                onCopySuccess={(message) => {
                  setToastMessage(message);
                  setShowToast(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {summarySessionId && projectPath && (
        <SummaryDialog
          isOpen={true}
          onClose={() => setSummarySessionId(null)}
          sessionId={summarySessionId}
          projectPath={projectPath}
        />
      )}
      
      <Toast
        open={showToast}
        onOpenChange={setShowToast}
        message={toastMessage}
      />
    </div>
  );
}

interface ConversationCardProps {
  session: ConversationSession;
  isSelected: boolean;
  onClick: () => void;
  onSummary: () => void;
  onCopySuccess: (message: string) => void;
}

function ConversationCard({ session, isSelected, onClick, onSummary, onCopySuccess }: ConversationCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    
    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 border-2 border-blue-300 shadow-xl transform scale-[1.02] shadow-blue-100/50'
          : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:transform hover:scale-[1.01]'
      }`}
    >
      {/* Background decoration */}
      <div className={`absolute inset-0 opacity-20 ${
        isSelected ? 'bg-gradient-to-br from-blue-400/10 to-indigo-400/10' : 'bg-gradient-to-br from-slate-400/5 to-slate-600/5'
      }`} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                isSelected ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-slate-300 group-hover:bg-slate-400'
              } transition-all duration-200`} />
              <div className={`font-mono text-sm font-semibold truncate ${
                isSelected ? 'text-blue-900' : 'text-slate-700'
              }`}>
                {session.id.slice(0, 12)}...
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <div className={`flex items-center gap-1.5 ${
                isSelected ? 'text-blue-600' : 'text-slate-500'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">{session.messageCount} messages</span>
              </div>
              
              <div className={`flex items-center gap-1.5 ${
                isSelected ? 'text-blue-600' : 'text-slate-500'
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium">{session.totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-xs font-medium ${
              isSelected ? 'text-blue-500' : 'text-slate-400'
            }`}>
              {formatDate(new Date(session.lastActivity))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const resumeCommand = `cd "${session.projectPath}" && claude /resume ${session.id}`;
              await window.api.copyToClipboard(resumeCommand);
              onCopySuccess('Resume command copied to clipboard!');
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M16 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Resume
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSummary();
            }}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Summary
          </button>
        </div>
      </div>
    </div>
  );
}