
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SmoothScrollButtonProps {
  targetSection: string;
  children: React.ReactNode;
  variant?: "default" | "ghost" | "outline";
  className?: string;
}

const SmoothScrollButton = ({ targetSection, children, variant = "ghost", className = "" }: SmoothScrollButtonProps) => {
  const handleScrollToSection = () => {
    const element = document.getElementById(targetSection);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleScrollToSection}
      className={`transition-all duration-300 ${className}`}
    >
      {children}
    </Button>
  );
};

export default SmoothScrollButton;
