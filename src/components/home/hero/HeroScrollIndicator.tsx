import React from 'react';
import { ChevronDown } from 'lucide-react';
import SmoothScrollButton from '../SmoothScrollButton';

const HeroScrollIndicator = () => {
  return (
    <SmoothScrollButton
      targetSection="trust"
      variant="ghost"
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-rose-600 dark:text-rose-300 animate-bounce p-2"
    >
      <div className="flex flex-col items-center">
        <div className="w-6 h-10 border-2 border-rose-400 dark:border-rose-300 rounded-full flex justify-center relative">
          <div className="w-1 h-3 bg-rose-400 dark:bg-rose-300 rounded-full mt-2 animate-pulse"></div>
        </div>
        <ChevronDown className="h-4 w-4 mt-2" />
        <p className="text-xs mt-1 font-medium">Découvrir</p>
      </div>
    </SmoothScrollButton>
  );
};

export default HeroScrollIndicator;
