
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
    primary: "text-primary border-primary/20",
    secondary: "text-secondary border-secondary/20",
    accent: "text-accent border-accent/20",
    gold: "text-islamic-gold border-islamic-gold/20",
    teal: "text-islamic-teal border-islamic-teal/20",
  };

  const getPatternClass = () => {
    const baseClasses = "relative overflow-hidden";
    
    switch (variant) {
      case "border":
        return cn(
          baseClasses, 
          `border-2 rounded-lg p-4 ${colorClasses[color]}`, 
          className
        );
      case "background":
        return cn(
          baseClasses, 
          `before:absolute before:inset-0 before:bg-[url('/islamic-pattern.svg')] before:${opacityMap[intensity]} before:bg-repeat ${colorClasses[color]}`, 
          className
        );
      case "divider":
        return cn(
          baseClasses, 
          `h-8 bg-gradient-to-r from-transparent via-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/30 to-transparent my-6 ${colorClasses[color]}`, 
          className
        );
      case "card":
        return cn(
          baseClasses,
          `bg-white shadow-md border border-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]}`,
          className
        );
      case "gradient":
        return cn(
          baseClasses,
          `bg-gradient-to-br from-islamic-teal/5 to-islamic-gold/10 border border-${color === 'gold' ? 'islamic-gold' : 'islamic-teal'}/10 rounded-lg ${colorClasses[color]}`,
          className
        );
      default:
        return cn(baseClasses, className);
    }
  };

  return (
    <div className={getPatternClass()}>
      {variant === "border" && (
        <div className={`absolute -inset-0.5 ${opacityMap[intensity]} bg-[url('/islamic-pattern.svg')] bg-repeat`} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export { IslamicPattern };
