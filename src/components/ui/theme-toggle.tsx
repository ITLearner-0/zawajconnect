import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'rounded-full transition-all duration-300 ease-in-out',
        'bg-white/80 backdrop-blur-sm',
        'border-rose-300/50 hover:border-rose-400 dark:border-rose-600/50 dark:hover:border-rose-500',
        'text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200',
        'hover:bg-rose-50 dark:hover:bg-rose-800/50',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
