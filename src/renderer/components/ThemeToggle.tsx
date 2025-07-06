import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-9 h-9 rounded-md hover:bg-muted transition-default flex items-center justify-center cursor-pointer"
      aria-label="Toggle theme"
    >
      {/* Light mode icon */}
      <svg
        className={`absolute w-5 h-5 text-foreground transition-default ${
          resolvedTheme === 'light' 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Dark mode icon */}
      <svg
        className={`absolute w-5 h-5 text-foreground transition-default ${
          resolvedTheme === 'dark' 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}