import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from './utils/date';

// Format project name to be more readable
function formatProjectName(path: string, actualPath?: string): string {
  // If we have the actual project path, use its basename
  if (actualPath) {
    const segments = actualPath.split('/').filter(Boolean);
    const projectName = segments[segments.length - 1];
    
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
      <aside className="w-80 border-r bg-gradient-to-b from-slate-50 to-slate-100/50 backdrop-blur-sm flex flex-col h-full">
        <div className="p-6 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
              <p className="text-xs text-red-500">Loading Error</p>
            </div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-slate-700 mb-2">Failed to load projects</h3>
            <p className="text-sm text-slate-500 mb-6">Please check your Claude Code installation</p>
            <button
              onClick={() => refetch()}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
      <aside className="w-80 border-r bg-gradient-to-b from-slate-50 to-slate-100/50 backdrop-blur-sm flex flex-col h-full">
        <div className="p-6 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-300 to-slate-400 animate-pulse" />
            <div>
              <div className="h-5 w-20 bg-slate-300 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-4 bg-white">
                <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                  <div className="flex gap-3">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-r bg-gradient-to-b from-slate-50 to-slate-100/50 backdrop-blur-sm flex flex-col h-full">
      <div className="p-6 border-b border-slate-200/60 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
            <p className="text-xs text-slate-500">Claude Code Sessions</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-slate-700 mb-2">No projects found</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Start using Claude Code in a project directory to see it appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <button
                key={project.path}
                onClick={() => onSelectProject(project.path)}
                title={project.actualProjectPath || project.path} // Tooltip showing actual project path
                className={`w-full group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 ${
                  selectedProjectPath === project.path
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md transform scale-[1.02]'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:transform hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${
                      selectedProjectPath === project.path ? 'text-blue-900' : 'text-slate-800'
                    }`}>
                      {formatProjectName(project.path, project.actualProjectPath)}
                    </div>
                    <div className={`text-xs mt-1 truncate ${
                      selectedProjectPath === project.path ? 'text-blue-400' : 'text-slate-400'
                    }`}>
                      {project.actualProjectPath 
                        ? project.actualProjectPath.replace(/^.*\/Users\/[^\/]+\//, '~/')
                        : project.path.replace(/^.*\/Users\/[^\/]+\//, '~/')
                      }
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center gap-1 text-xs ${
                        selectedProjectPath === project.path ? 'text-blue-600' : 'text-slate-500'
                      }`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{project.conversationCount} conversation{project.conversationCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      selectedProjectPath === project.path ? 'text-blue-500' : 'text-slate-400'
                    }`}>
                      {formatDistanceToNow(project.lastActivity)}
                    </div>
                  </div>
                  {selectedProjectPath === project.path && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}