import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, LogIn } from 'lucide-react';

const HeroSecondaryActions = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30"
      >
        <Link to="/demo" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Voir la Démo
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30 border border-rose-300 dark:border-rose-600"
      >
        <Link to="/auth" className="flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Déjà membre ? Se connecter
        </Link>
      </Button>
    </div>
  );
};

export default HeroSecondaryActions;
