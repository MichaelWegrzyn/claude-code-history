import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function HeaderBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    // Detect platform
    setPlatform(navigator.platform);
    
    // Setup window listeners
    window.api.setupWindowListeners();
    
    // Get initial maximized state
    window.api.windowIsMaximized().then(setIsMaximized);
    
    // Listen for maximize state changes
    window.api.onWindowMaximizedChanged(setIsMaximized);
  }, []);

  const handleMinimize = () => {
    window.api.windowMinimize();
  };

  const handleMaximize = () => {
    window.api.windowMaximize();
  };

  const handleClose = () => {
    window.api.windowClose();
  };

  const isMac = platform.startsWith('Mac');

  return (
    <header className="flex h-12 items-center justify-end border-b border-border bg-card shadow-subtle z-10 relative">
      {/* Drag Region */}
      <div 
        className="absolute inset-0 drag-region"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
      
      {/* Right Section - Theme Toggle and Window Controls */}
      <div className="flex items-center gap-2 px-4 relative z-10" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <ThemeToggle />
        
        {/* Window Controls - Only show on Windows/Linux */}
        {!isMac && (
          <div className="flex items-center gap-1 ml-2">
            {/* Minimize Button */}
            <button
              onClick={handleMinimize}
              className="w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            {/* Maximize/Restore Button */}
            <button
              onClick={handleMaximize}
              className="w-8 h-8 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-md hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}