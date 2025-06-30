import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from './utils/date';
import type { Project } from '@shared/types/conversation';

interface ProjectSidebarProps {
  selectedProjectPath: string | null;
  onSelectProject: (projectPath: string) => void;
}

export function ProjectSidebar({ selectedProjectPath, onSelectProject }: ProjectSidebarProps) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.getProjects(),
  });

  if (isLoading) {
    return (
      <aside className="w-64 border-r bg-muted/40 p-4">
        <h2 className="mb-4 text-sm font-semibold">Projects</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-muted/40 p-4">
      <h2 className="mb-4 text-sm font-semibold">Projects</h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project.path}
            onClick={() => onSelectProject(project.path)}
            className={`w-full rounded-lg p-3 text-left transition-colors ${
              selectedProjectPath === project.path
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
          >
            <div className="font-medium">{project.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {project.conversationCount} conversation{project.conversationCount !== 1 ? 's' : ''}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatDistanceToNow(project.lastActivity)}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}