import React, { memo, useState, useEffect } from 'react';
import { Users, Heart, Shield, Star } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const stats = [
  { icon: Users, value: '2,500+', label: 'Membres Actifs', targetNumber: 2500 },
  { icon: Heart, value: '150+', label: 'Mariages Halal', targetNumber: 150 },
  { icon: Shield, value: '100%', label: 'Conformité Islamique', targetNumber: 100 },
  { icon: Star, value: '4.8/5', label: 'Supervision Wali', targetNumber: 4.8 },
];

const AnimatedNumber = memo(
  ({
    target,
    suffix = '',
    decimals = 0,
  }: {
    target: number;
    suffix?: string;
    decimals?: number;
  }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setCurrent(Math.min(target, step * increment));

        if (step >= steps) {
          setCurrent(target);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [target]);

    return (
      <span>
        {decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString()}
        {suffix}
      </span>
    );
  }
);

AnimatedNumber.displayName = 'AnimatedNumber';

const StatCard = memo(({ stat, index }: { stat: (typeof stats)[0]; index: number }) => {
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={`bg-white/20 dark:bg-rose-900/30 backdrop-blur-sm rounded-xl p-4 text-center border border-rose-200/30 dark:border-rose-700/30 transition-all duration-500 hover:scale-105 hover:bg-white/30 dark:hover:bg-rose-900/40 ${
        hasIntersected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <stat.icon className="h-6 w-6 text-rose-600 dark:text-rose-300 mx-auto mb-2" />
      <div className="text-lg font-bold text-rose-800 dark:text-rose-200">
        {hasIntersected ? (
          stat.label === 'Supervision Wali' ? (
            <AnimatedNumber target={stat.targetNumber} suffix="/5" decimals={1} />
          ) : stat.label === 'Conformité Islamique' ? (
            <AnimatedNumber target={stat.targetNumber} suffix="%" />
          ) : (
            <AnimatedNumber target={stat.targetNumber} suffix="+" />
          )
        ) : (
          '0'
        )}
      </div>
      <div className="text-sm text-rose-600 dark:text-rose-300">{stat.label}</div>
    </div>
  );
});

StatCard.displayName = 'StatCard';

const HeroStats = memo(() => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
});

HeroStats.displayName = 'HeroStats';

export default HeroStats;
