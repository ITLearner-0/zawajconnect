
import React from "react";
import { cn } from "@/lib/utils";

interface IslamicPatternProps {
  variant?: "border" | "background" | "divider" | "card" | "gradient";
  className?: string;
  color?: "primary" | "secondary" | "accent" | "gold" | "teal";
  children?: React.ReactNode;
  intensity?: "light" | "medium" | "strong";
}

const IslamicPattern = ({
  variant = "border",
  className,
  color = "primary",
  children,
  intensity = "medium",
}: IslamicPatternProps) => {
  // Map intensity to opacity values
  const opacityMap = {
    light: "opacity-5",
    medium: "opacity-10",
    strong: "opacity-20",
  };

  // Map colors to Tailwind classes
  const colorClasses = {
    primary: "text-primary border-primary/20 dark:text-white dark:border-white/20",
    secondary: "text-secondary border-secondary/20 dark:text-islamic-gold dark:border-islamic-gold/20",
    accent: "text-accent border-accent/20 dark:text-islamic-darkCream dark:border-islamic-darkCream/20",
    gold: "text-islamic-gold border-islamic-gold/20 dark:text-islamic-darkGold dark:border-islamic-darkGold/20",
    teal: "text-islamic-teal border-islamic-teal/20 dark:text-islamic-darkTeal dark:border-islamic-darkTeal/20",
  };

  const getPatternClass = () => {
    const baseClasses = "relative overflow-hidden";
    
    switch (variant) {
      case "border":
        return cn(
          baseClasses, 
          `border-2 rounded-lg p-4 ${colorClasses[color]} dark:bg-islamic-darkCard/30`, 
          className
        );
      case "background":
        return cn(
          baseClasses, 
          `before:absolute before:inset-0 before:bg-[url('/islamic-pattern-enhanced.svg')] before:${opacityMap[intensity]} before:bg-repeat ${colorClasses[color]} dark:before:opacity-30`, 
          className
        );
      case "divider":
        return cn(
          baseClasses, 
          `h-8 bg-gradient-to-r from-transparent via-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/30 to-transparent my-6 ${colorClasses[color]} dark:via-${color === 'gold' ? 'islamic-darkGold' : 'islamic-darkTeal'}/40`, 
          className
        );
      case "card":
        return cn(
          baseClasses,
          `bg-white shadow-md border border-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]} dark:bg-islamic-darkCard dark:border-${color === 'gold' ? 'islamic-darkGold' : 'islamic-darkTeal'}/20`,
          className
        );
      case "gradient":
        return cn(
          baseClasses,
          `bg-gradient-to-br from-islamic-teal/5 to-islamic-gold/10 border border-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]} dark:from-islamic-darkTeal/20 dark:to-islamic-darkGold/30 dark:border-${color === 'gold' ? 'islamic-darkGold' : 'islamic-darkTeal'}/20`,
          className
        );
      default:
        return cn(baseClasses, className);
    }
  };

  return (
    <div className={getPatternClass()}>
      {variant === "border" && (
        <div className={`absolute -inset-0.5 ${opacityMap[intensity]} bg-[url('/islamic-pattern-enhanced.svg')] bg-repeat dark:opacity-30`} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { IslamicPattern };
