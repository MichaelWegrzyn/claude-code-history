import { useQuery } from '@tanstack/react-query';
import { ScrollArea } from './ui/ScrollArea';
import type { ConversationSession, ClaudeMessage, MessageContent } from '@shared/types/conversation';
import { formatDistanceToNow } from './utils/date';

interface ConversationDetailProps {
  sessionId: string;
  projectPath: string;
  onClose: () => void;
}

export function ConversationDetail({ sessionId, projectPath, onClose }: ConversationDetailProps) {
  const { data: session, isLoading } = useQuery({
    queryKey: ['conversation-detail', sessionId, projectPath],
    queryFn: () => window.api.loadConversationDetails(sessionId, projectPath),
    enabled: !!sessionId && !!projectPath,
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading conversation...</p>
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
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-accent"
            aria-label="Back to conversations"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold">Conversation Details</h2>
            <p className="text-sm text-muted-foreground">
              {session.messageCount} messages • {formatDistanceToNow(session.lastActivity)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const resumeCommand = `cd "${session.projectPath}" && claude /resume ${session.id}`;
              window.api.copyToClipboard(resumeCommand);
            }}
            className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Resume
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-accent"
            aria-label="Close conversation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 overflow-auto">
        <div className="space-y-4 p-4">
          {session.messages.map((message, index) => (
            <MessageDisplay key={message.uuid} message={message} />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-medium">Total tokens:</span> {session.totalTokens.toLocaleString()}
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Input: {session.tokenUsage.input.toLocaleString()}</span>
            <span>Output: {session.tokenUsage.output.toLocaleString()}</span>
            <span>Cache: {session.tokenUsage.cache.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageDisplayProps {
  message: ClaudeMessage;
}

function MessageDisplay({ message }: MessageDisplayProps) {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex gap-3`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
        isUser ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
      }`}>
        {isUser ? 'U' : 'A'}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-baseline gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{isUser ? 'User' : 'Assistant'}</span>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.message.usage && (
            <span className="text-blue-600">
              {(message.message.usage.output_tokens || 0).toLocaleString()} tokens
            </span>
          )}
        </div>
        
        <div className={`rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-50 border border-blue-200' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <MessageContent content={message.message.content} />
        </div>
      </div>
    </div>
  );
}

interface MessageContentProps {
  content: string | MessageContent[];
}

function MessageContent({ content }: MessageContentProps) {
  if (typeof content === 'string') {
    return (
      <div className="prose prose-sm max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
          {content}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {content.map((item, index) => {
        if (item.type === 'text') {
          return (
            <div key={index} className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                {item.text}
              </pre>
            </div>
          );
        }
        
        if (item.type === 'tool_use') {
          return (
            <div key={index} className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Tool: {item.name}</span>
              </div>
              {item.input && (
                <details className="mt-2">
                  <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-900">
                    Show parameters
                  </summary>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-x-auto text-yellow-900">
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
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
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
              <pre className={`text-xs overflow-x-auto p-2 rounded ${
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