import React from 'react';
import HeroNavigation from './hero/HeroNavigation';
import HeroBismillah from './hero/HeroBismillah';
import HeroContent from './hero/HeroContent';
import HeroCTAButtons from './hero/HeroCTAButtons';
import HeroSecondaryActions from './hero/HeroSecondaryActions';
import HeroScrollIndicator from './hero/HeroScrollIndicator';
import HeroStats from './HeroStats';

const EnhancedHeroSection = () => {
  return (
    <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-900 dark:via-pink-900 dark:to-rose-800">
      {/* Simplified Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.2),transparent_70%)]"></div>
      </div>

      {/* Navigation */}
      <HeroNavigation />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
        {/* Arabic text and translation */}
        <HeroBismillah />

        {/* Main tagline */}
        <HeroContent />

        {/* Stats Section */}
        <div className="mb-10">
          <HeroStats />
        </div>

        {/* CTA Buttons */}
        <HeroCTAButtons />

        {/* Secondary Actions */}
        <HeroSecondaryActions />
      </div>

      {/* Scroll Indicator */}
      <HeroScrollIndicator />
    </header>
  );
};

export default EnhancedHeroSection;
