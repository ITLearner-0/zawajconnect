
import React from 'react';
import { Users, Heart, Shield, Star } from 'lucide-react';

const HeroStats = () => {
  const stats = [
    { icon: Users, value: "10,000+", label: "Membres Actifs" },
    { icon: Heart, value: "500+", label: "Mariages Réussis" },
    { icon: Shield, value: "100%", label: "Halal Vérifié" },
    { icon: Star, value: "4.9/5", label: "Satisfaction" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white/20 dark:bg-rose-900/30 backdrop-blur-sm rounded-xl p-4 text-center border border-rose-200/30 dark:border-rose-700/30"
        >
          <stat.icon className="h-6 w-6 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
          <div className="text-lg font-bold text-rose-800 dark:text-rose-200">{stat.value}</div>
          <div className="text-sm text-rose-600 dark:text-rose-300">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;
