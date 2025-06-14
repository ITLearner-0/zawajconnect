
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "rounded-full transition-all duration-300 ease-in-out",
        "bg-transparent backdrop-blur-sm",
        "border-islamic-gold/50 hover:border-islamic-gold dark:border-islamic-darkGold/50 dark:hover:border-islamic-darkGold",
        "text-islamic-gold hover:text-islamic-brightGold dark:text-islamic-darkGold dark:hover:text-islamic-darkBrightGold",
        "hover:bg-islamic-gold/10 dark:hover:bg-islamic-darkGold/10",
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

