import { useState } from 'react';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ConversationViewer } from './components/ConversationViewer';
import { HeaderBar } from './components/HeaderBar';

export default function App() {
  const [selectedProjectPath, setSelectedProjectPath] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId || null);
  };

  const handleSelectProject = (projectPath: string) => {
    setSelectedProjectPath(projectPath);
    setSelectedSessionId(null); // Clear selected session when switching projects
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <HeaderBar />
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar 
          selectedProjectPath={selectedProjectPath}
          onSelectProject={handleSelectProject}
        />
        <main className="flex-1 overflow-hidden">
          <ConversationViewer
            projectPath={selectedProjectPath}
            selectedSessionId={selectedSessionId}
            onSelectSession={handleSelectSession}
          />
        </main>
      </div>
    </div>
  );
}