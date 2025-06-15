
import React, { memo } from 'react';
import { Shield, Award, Users, CheckCircle } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const badges = [
  {
    icon: Shield,
    title: "Certifié Halal",
    description: "Approuvé par des érudits islamiques"
  },
  {
    icon: Award,
    title: "Leader du Marché",
    description: "N°1 des plateformes de mariage islamique"
  },
  {
    icon: Users,
    title: "Communauté Vérifiée",
    description: "Tous les profils sont authentifiés"
  },
  {
    icon: CheckCircle,
    title: "Sécurisé",
    description: "Données protégées et confidentielles"
  }
];

const TrustBadge = memo(({ badge, index }: { badge: typeof badges[0], index: number }) => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`text-center group transition-all duration-500 ${
        hasIntersected 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
        <badge.icon className="h-8 w-8 text-rose-600 dark:text-rose-300" />
      </div>
      <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-1">{badge.title}</h4>
      <p className="text-xs text-rose-600 dark:text-rose-400">{badge.description}</p>
    </div>
  );
});

TrustBadge.displayName = 'TrustBadge';

const TrustBadges = memo(() => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {badges.map((badge, index) => (
        <TrustBadge key={badge.title} badge={badge} index={index} />
      ))}
    </div>
  );
});

TrustBadges.displayName = 'TrustBadges';

export default TrustBadges;
