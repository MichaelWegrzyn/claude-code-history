import { useEffect, useState } from 'react';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  duration?: number;
}

export function Toast({ open, onOpenChange, message, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onOpenChange(false), 150); // Wait for animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        transform transition-all duration-150 ease-in-out
        ${isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-2 opacity-0 scale-95'
        }
        bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg
        flex items-center gap-2 max-w-sm
      `}>
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}