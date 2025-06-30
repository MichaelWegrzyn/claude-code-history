import { useQuery } from '@tanstack/react-query';
import type { ConversationSession } from '@shared/types/conversation';
import { ConversationDetail } from './ConversationDetail';

interface ConversationViewerProps {
  projectPath: string | null;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

export function ConversationViewer({ 
  projectPath, 
  selectedSessionId, 
  onSelectSession 
}: ConversationViewerProps) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['conversations', projectPath],
    queryFn: () => projectPath ? window.api.loadConversations(projectPath) : Promise.resolve([]),
    enabled: !!projectPath,
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
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Show conversation detail if one is selected
  if (selectedSessionId && projectPath) {
    return (
      <ConversationDetail
        sessionId={selectedSessionId}
        projectPath={projectPath}
        onClose={() => onSelectSession('')}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <p className="text-sm text-muted-foreground">
          {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} found
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {sessions.map((session) => (
            <ConversationCard
              key={session.id}
              session={session}
              isSelected={selectedSessionId === session.id}
              onClick={() => onSelectSession(session.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ConversationCardProps {
  session: ConversationSession;
  isSelected: boolean;
  onClick: () => void;
}

function ConversationCard({ session, isSelected, onClick }: ConversationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
        isSelected
          ? 'border-primary bg-accent'
          : 'hover:border-accent hover:bg-accent/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{session.id.slice(0, 8)}...</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {session.messageCount} messages
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {session.totalTokens.toLocaleString()} tokens
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(session.lastActivity).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const resumeCommand = `cd "${session.projectPath}" && claude /resume ${session.id}`;
            window.api.copyToClipboard(resumeCommand);
          }}
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Resume
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement summary generation
          }}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
        >
          Summary
        </button>
      </div>
    </div>
  );
}