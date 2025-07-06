import { ThemeToggle } from './ThemeToggle';

export function HeaderBar() {
  return (
    <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-card shadow-subtle z-10">
      {/* Left Section - Simple Brand */}
      <div className="flex items-center gap-3">
        {/* Simple Logo */}
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {/* Simple Title */}
        <h1 className="text-lg font-semibold text-foreground">
          Claude Code History
        </h1>
      </div>
      
      {/* Right Section - Theme Toggle Only */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}