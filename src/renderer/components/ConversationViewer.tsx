import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ConversationSession } from '@shared/types/conversation';
import { ConversationDetail } from './ConversationDetail';
import { SummaryDialog } from './SummaryDialog';
import { Toast } from './ui/Toast';

// Format project name to be more readable
function formatProjectName(name: string, actualPath?: string): string {
  if (actualPath) {
    const segments = actualPath.split('/').filter(Boolean);
    const projectName = segments[segments.length - 1];
    
    if (!projectName) {
      return 'Untitled Project';
    }
    
    if (!projectName.includes('-')) {
      return projectName;
    }
    
    if (projectName === 'claude-code-history') {
      return 'Claude History Viewer';
    }
    
    return projectName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Fallback
  return name.replace(/^-+|-+$/g, '').replace(/-+/g, ' ').trim();
}

interface ConversationViewerProps {
  projectPath: string | null;
  selectedProject: {
    name: string;
    actualProjectPath?: string;
    path: string;
  } | null | undefined;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string | null) => void;
}

export function ConversationViewer({ 
  projectPath,
  selectedProject,
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
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card shadow-subtle p-4">
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
      <div className="h-full overflow-hidden">
        <ConversationDetail
          sessionId={selectedSessionId}
          projectPath={projectPath}
          actualProjectPath={selectedProject?.actualProjectPath ?? undefined}
          onClose={() => onSelectSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border p-4 bg-card shadow-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {selectedProject ? formatProjectName(selectedProject.name, selectedProject.actualProjectPath) : 'Conversations'}
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </p>
              {selectedProject?.actualProjectPath && (
                <p className="text-xs text-muted-foreground/70 font-mono truncate max-w-md" title={selectedProject.actualProjectPath}>
                  {selectedProject.actualProjectPath}
                </p>
              )}
            </div>
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
          <div className="p-4 space-y-2">
            {sessions.map((session, index) => {
              // Debug: Check for duplicates
              const duplicateCount = sessions.filter(s => s.id === session.id).length;
              if (duplicateCount > 1) {
                console.warn(`Duplicate session detected: ${session.id} (appears ${duplicateCount} times)`);
              }
              
              return (
                <ConversationCard
                  key={`${session.id}-${index}`}
                  session={session}
                  actualProjectPath={selectedProject?.actualProjectPath ?? undefined}
                  isSelected={selectedSessionId === session.id}
                  onClick={() => onSelectSession(session.id)}
                  onSummary={() => setSummarySessionId(session.id)}
                  onCopySuccess={(message) => {
                    setToastMessage(message);
                    setShowToast(true);
                  }}
                />
              );
            })}
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
  actualProjectPath: string | undefined;
  isSelected: boolean;
  onClick: () => void;
  onSummary: () => void;
  onCopySuccess: (message: string) => void;
}

function ConversationCard({ session, actualProjectPath, isSelected, onClick, onSummary, onCopySuccess }: ConversationCardProps) {
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
      className={`group cursor-pointer rounded-lg border p-4 hover-lift bg-card shadow-subtle ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-soft'
          : 'border-border hover:border-accent/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {session.title || `${session.id.slice(0, 12)}...`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(new Date(session.lastActivity))}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {session.messageCount} messages
        </div>
      </div>
      
      {/* Simple stats */}
      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span>Input: {session.tokenUsage?.input?.toLocaleString() || '0'}</span>
        <span>Output: {session.tokenUsage?.output?.toLocaleString() || '0'}</span>
        <span>Total: {session.totalTokens.toLocaleString()}</span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const projectPath = actualProjectPath || session.projectPath;
            const resumeCommand = `cd "${projectPath}" && claude --resume ${session.id}`;
            await window.api.copyToClipboard(resumeCommand);
            onCopySuccess('Resume command copied to clipboard!');
          }}
          className="flex-1 rounded-md bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-accent/90 transition-default cursor-pointer"
        >
          Resume
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSummary();
          }}
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:border-muted-foreground/30 hover:shadow-subtle transition-default cursor-pointer"
        >
          Summary
        </button>
      </div>
    </div>
  );
}