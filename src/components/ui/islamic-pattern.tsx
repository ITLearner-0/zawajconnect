
import React from "react";
import { cn } from "@/lib/utils";

interface IslamicPatternProps {
  variant?: "border" | "background" | "divider";
  className?: string;
  color?: "primary" | "secondary" | "accent";
}

const IslamicPattern = ({
  variant = "border",
  className,
  color = "primary",
}: IslamicPatternProps) => {
  const getPatternClass = () => {
    const baseClasses = "relative overflow-hidden";
    const colorClasses = {
      primary: "text-primary",
      secondary: "text-secondary",
      accent: "text-accent",
    };

    switch (variant) {
      case "border":
        return cn(baseClasses, "border-4 border-primary/20 rounded-lg p-4", colorClasses[color], className);
      case "background":
        return cn(baseClasses, "before:absolute before:inset-0 before:bg-[url('/islamic-pattern.svg')] before:opacity-5 before:bg-repeat", colorClasses[color], className);
      case "divider":
        return cn(baseClasses, "h-8 bg-gradient-to-r from-transparent via-primary/20 to-transparent my-6", colorClasses[color], className);
      default:
        return cn(baseClasses, className);
    }
  };

  return (
    <div className={getPatternClass()}>
      {variant === "border" && (
        <div className="absolute -inset-0.5 opacity-20 bg-[url('/islamic-pattern.svg')] bg-repeat" />
      )}
      {variant !== "divider" && <div className="relative z-10">{variant === "border" ? <div className="h-full w-full">{}</div> : null}</div>}
    </div>
  );
};

export { IslamicPattern };
