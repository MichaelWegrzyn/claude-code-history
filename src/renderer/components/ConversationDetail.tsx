import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SummaryDialog } from './SummaryDialog';
import { Toast } from './ui/Toast';
import type { ClaudeMessage, MessageContent } from '@shared/types/conversation';
import { formatDistanceToNow } from './utils/date';

interface ConversationDetailProps {
  sessionId: string;
  projectPath: string;
  actualProjectPath?: string;
  onClose: () => void;
}

export function ConversationDetail({ sessionId, projectPath, actualProjectPath, onClose }: ConversationDetailProps) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { data: session, isLoading } = useQuery({
    queryKey: ['conversation-detail', sessionId, projectPath],
    queryFn: () => window.api.loadConversationDetails(sessionId, projectPath),
    enabled: !!sessionId && !!projectPath,
  });

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        {/* Header skeleton */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        
        {/* Messages skeleton */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="animate-pulse rounded-lg border border-border bg-card p-4">
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted rounded" />
                      <div className="h-4 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer skeleton */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4 bg-card shadow-subtle">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold">Conversation Details</h2>
            <p className="text-sm text-muted-foreground">
              {session.messageCount} messages • {formatDistanceToNow(session.lastActivity)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const targetPath = actualProjectPath || session.projectPath;
              const resumeCommand = `cd "${targetPath}" && claude --resume ${session.id}`;
              await window.api.copyToClipboard(resumeCommand);
              setToastMessage('Resume command copied to clipboard!');
              setShowToast(true);
            }}
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-default cursor-pointer"
          >
            Resume
          </button>
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted hover:border-muted-foreground/30 hover:shadow-subtle transition-default cursor-pointer"
          >
            Summary
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-accent transition-colors cursor-pointer"
            aria-label="Close conversation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-4 p-6 max-w-full">
          {session.messages.map((message, index) => (
            <MessageDisplay key={`${message.uuid}-${index}`} message={message} />
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">Total tokens:</span> {session.totalTokens?.toLocaleString() || '0'}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Input: {session.tokenUsage?.input?.toLocaleString() || '0'}</span>
            <span>Output: {session.tokenUsage?.output?.toLocaleString() || '0'}</span>
            <span>Cache: {session.tokenUsage?.cache?.toLocaleString() || '0'}</span>
          </div>
        </div>
      </div>
      
      <SummaryDialog
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        sessionId={sessionId}
        projectPath={projectPath}
      />
      
      <Toast
        open={showToast}
        onOpenChange={setShowToast}
        message={toastMessage}
      />
    </div>
  );
}

interface MessageDisplayProps {
  message: ClaudeMessage;
}

function MessageDisplay({ message }: MessageDisplayProps) {
  // Determine if this is a user message
  // Tool results should always be considered assistant messages
  const hasToolResults = Array.isArray(message.message?.content) && 
    message.message.content.some(item => item?.type === 'tool_result');
  const isUser = message.type === 'user' && !hasToolResults;
  
  return (
    <div className={`flex gap-3 max-w-full`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
        isUser ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
      }`}>
        {isUser ? 'U' : 'A'}
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{isUser ? 'User' : 'Assistant'}</span>
          <span>{new Date(message.timestamp || new Date()).toLocaleTimeString()}</span>
          {message.message?.usage?.output_tokens && (
            <span className="text-blue-600">
              {message.message.usage.output_tokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        
        <div className={`rounded-lg p-4 overflow-hidden ${
          isUser 
            ? 'bg-blue-50/50 border border-border' 
            : 'bg-muted/50 border border-border'
        }`}>
          <MessageContent content={message.message?.content || 'No content available'} />
        </div>
      </div>
    </div>
  );
}

interface MessageContentProps {
  content: string | MessageContent[];
}

function MessageContent({ content }: MessageContentProps) {
  if (!content) {
    return (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-500 italic">
        No content available
      </pre>
    );
  }

  if (typeof content === 'string') {
    return (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-800">
        {content}
      </pre>
    );
  }

  if (!Array.isArray(content)) {
    return (
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-500 italic">
        Invalid content format
      </pre>
    );
  }

  return (
    <div className="space-y-3">
      {content.map((item, index) => {
        if (!item) return null;
        if (item.type === 'text') {
          return (
            <pre key={index} className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-gray-800">
              {item.text}
            </pre>
          );
        }
        
        if (item.type === 'tool_use') {
          return (
            <div key={index} className="rounded-md bg-yellow-50/50 border border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Tool: {item.name}</span>
              </div>
              {item.input && (
                <details className="mt-2">
                  <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-900">
                    Show parameters
                  </summary>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-x-auto text-yellow-900 max-w-full">
                    {JSON.stringify(item.input, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        }
        
        if (item.type === 'tool_result') {
          const isError = item.is_error;
          return (
            <div key={index} className={`rounded-md p-3 ${
              isError 
                ? 'bg-red-50/50 border border-border' 
                : 'bg-green-50/50 border border-border'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  isError ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  isError ? 'text-red-800' : 'text-green-800'
                }`}>
                  Tool Result {isError ? '(Error)' : ''}
                </span>
              </div>
              <pre className={`text-xs overflow-x-auto p-2 rounded max-w-full ${
                isError 
                  ? 'bg-red-100 text-red-900' 
                  : 'bg-green-100 text-green-900'
              }`}>
                {typeof item.content === 'string' ? item.content : JSON.stringify(item.content, null, 2)}
              </pre>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}