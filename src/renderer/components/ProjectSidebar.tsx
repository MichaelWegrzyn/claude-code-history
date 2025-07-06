import { useState, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => window.api.getProjects(),
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => {
      const projectName = formatProjectName(project.path, project.actualProjectPath);
      return projectName.toLowerCase().includes(query);
    });
  }, [projects, searchQuery]);

  if (error) {
    return (
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-full">
        {/* App Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* App Logo */}
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            {/* App Title */}
            <h1 className="text-lg font-semibold text-foreground">
              Claude Code History
            </h1>
          </div>
        </div>
        
        {/* Projects Section Header */}
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
        {/* App Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* App Logo */}
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            {/* App Title */}
            <h1 className="text-lg font-semibold text-foreground">
              Claude Code History
            </h1>
          </div>
        </div>
        
        {/* Projects Section Header - Loading */}
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
      {/* App Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* App Logo */}
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          {/* App Title */}
          <h1 className="text-lg font-semibold text-foreground">
            Claude Code History
          </h1>
        </div>
      </div>
      
      {/* Projects Section Header */}
      <div className="p-4 border-b border-border flex-shrink-0 bg-card/50">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Projects
        </h2>
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground text-muted-foreground"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              {searchQuery ? (
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {searchQuery ? 'No matching projects' : 'No projects found'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              {searchQuery 
                ? `No projects match "${searchQuery}". Try a different search term.`
                : 'Start using Claude Code in a project to see it here.'
              }
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredProjects.map((project) => (
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