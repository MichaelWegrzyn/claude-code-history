import { useState } from 'react';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ConversationViewer } from './components/ConversationViewer';
import { HeaderBar } from './components/HeaderBar';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleSelectSession = (sessionId: string | null) => {
    setSelectedSessionId(sessionId && sessionId.trim() ? sessionId : null);
  };

  const handleSelectProject = (projectPath: string) => {
    setSelectedProjectPath(projectPath);
    setSelectedSessionId(null); // Clear selected session when switching projects
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <ErrorBoundary>
          <ProjectSidebar 
            selectedProjectPath={selectedProjectPath}
            onSelectProject={handleSelectProject}
          />
        </ErrorBoundary>
        <main className="flex-1 overflow-hidden relative">
          <ErrorBoundary>
            <ConversationViewer
              projectPath={selectedProjectPath}
              selectedSessionId={selectedSessionId}
              onSelectSession={handleSelectSession}
            />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}