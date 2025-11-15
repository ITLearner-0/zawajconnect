import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroCTAButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
      >
        <Link to="/auth?signup=true&gender=female" className="flex items-center gap-2">
          INSCRIPTION FEMME
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>

      <div className="text-rose-600 dark:text-rose-300 text-sm font-medium">OU</div>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="border-2 border-rose-500 text-rose-600 bg-white/80 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-800/50 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
      >
        <Link to="/auth?signup=true&gender=male" className="flex items-center gap-2">
          INSCRIPTION HOMME
          <ArrowRight className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};

export default HeroCTAButtons;
