import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from './utils/date';

// Format project name to be more readable
function formatProjectName(path: string, actualPath?: string): string {
  // If we have the actual project path, use its basename
  if (actualPath) {
    const segments = actualPath.split('/').filter(Boolean);
    const projectName = segments[segments.length - 1];
    
    if (!projectName) {
      return 'Untitled Project';
    }
    
    // Don't format if it's already a well-formed name
    if (!projectName.includes('-')) {
      return projectName;
    }
    
    // Format the project name nicely (but keep it as-is for this specific project)
    if (projectName === 'claude-code-history') {
      return 'Claude History Viewer';
    }
    
    return projectName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Extract the last directory name from the encoded path
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  if (!lastSegment) {
    return 'Untitled Project';
  }
  
  // Remove common prefixes and suffixes
  let formatted = lastSegment
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/^Users-[^-]+-/i, '') // Remove Users-username- prefix
    .replace(/-+/g, ' ') // Replace dashes with spaces
    .replace(/_+/g, ' ') // Replace underscores with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Capitalize first letter of each word
  formatted = formatted.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return formatted || 'Untitled Project';
}

// Simple project list item
function ProjectItem({ 
  project, 
  isSelected, 
  onClick 
}: { 
  project: any; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      title={project.actualProjectPath || project.path}
      className={`w-full text-left p-3 rounded-lg transition-default hover-lift cursor-pointer ${
        isSelected
          ? 'bg-accent text-white shadow-subtle'
          : 'hover:bg-card'
      }`}
    >
      {/* Project name */}
      <h3 className={`font-medium text-sm mb-1 ${
        isSelected ? 'text-white' : 'text-foreground'
      }`}>
        {formatProjectName(project.path, project.actualProjectPath)}
      </h3>
      
      {/* Project stats */}
      <div className="flex items-center gap-3 text-xs">
        <span className={isSelected ? 'text-white/80' : 'text-muted-foreground'}>
          {project.conversationCount} {project.conversationCount === 1 ? 'conversation' : 'conversations'}
        </span>
        <span className={isSelected ? 'text-white/60' : 'text-muted-foreground/60'}>
          •
        </span>
        <span className={isSelected ? 'text-white/60' : 'text-muted-foreground/60'}>
          {formatDistanceToNow(project.lastActivity)}
        </span>
      </div>
    </button>
  );
}

interface ProjectSidebarProps {
  selectedProjectPath: string | null;
  onSelectProject: (projectPath: string) => void;
}

export function ProjectSidebar({ selectedProjectPath, onSelectProject }: ProjectSidebarProps) {
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.getProjects(),
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  if (error) {
    return (
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
        <div className="p-4 border-b border-border flex-shrink-0 bg-card/50">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">Failed to load projects</h3>
            <p className="text-xs text-muted-foreground mb-4">Please check your Claude Code installation</p>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-default cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (isLoading) {
    return (
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
        <div className="p-4 border-b border-border flex-shrink-0 bg-card/50">
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b border-border flex-shrink-0 bg-card/50">
        <h2 className="text-sm font-semibold text-foreground">
          Projects
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">No projects found</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Start using Claude Code in a project to see it here.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <ProjectItem
                key={project.path}
                project={project}
                isSelected={selectedProjectPath === project.path}
                onClick={() => onSelectProject(project.path)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}