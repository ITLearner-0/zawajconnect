
import React from 'react';
import { Shield, Award, Users, CheckCircle } from 'lucide-react';

const TrustBadges = () => {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="text-center group hover:scale-105 transition-transform duration-300"
        >
          <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
            <badge.icon className="h-8 w-8 text-rose-600 dark:text-rose-300" />
          </div>
          <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-1">{badge.title}</h4>
          <p className="text-xs text-rose-600 dark:text-rose-400">{badge.description}</p>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
