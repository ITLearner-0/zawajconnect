/**
 * AnalyticsTab - Detailed Profile Analytics
 *
 * Features:
 * - Profile views over time
 * - Likes and favorites received
 * - Message statistics
 * - Profile completion impact
 * - Visitor demographics
 * - Engagement metrics
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  Calendar,
  Award,
  Target,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DatabaseProfile } from '@/types/profile';

interface AnalyticsTabProps {
  profile: DatabaseProfile;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
  };
  color: 'emerald' | 'gold' | 'rose' | 'blue';
}

const StatCard = ({ icon: Icon, label, value, change, color }: StatCardProps) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    gold: 'bg-amber-100 text-amber-600 border-amber-200',
    rose: 'bg-rose-100 text-rose-600 border-rose-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={`inline-flex p-3 rounded-lg ${colorClasses[color]} border-2 mb-4`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">
                +{change.value}%
              </span>
              <span className="text-xs text-gray-500">{change.label}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AnalyticsTab = ({ profile }: AnalyticsTabProps) => {
  // Mock analytics data (will be fetched from Supabase)
  const [analytics] = useState({
    views: {
      total: 1247,
      thisWeek: 89,
      change: 15,
    },
    likes: {
      total: 89,
      thisWeek: 12,
      change: 23,
    },
    messages: {
      total: 34,
      thisWeek: 8,
      change: 18,
    },
    profileVisits: {
      unique: 892,
      returning: 355,
    },
    demographics: {
      topCities: [
        { name: 'Paris', percentage: 35 },
        { name: 'Lyon', percentage: 18 },
        { name: 'Marseille', percentage: 12 },
        { name: 'Toulouse', percentage: 10 },
        { name: 'Autres', percentage: 25 },
      ],
      ageGroups: [
        { range: '18-25', percentage: 20 },
        { range: '26-30', percentage: 45 },
        { range: '31-35', percentage: 25 },
        { range: '36+', percentage: 10 },
      ],
    },
    completionImpact: {
      profileScore: 85,
      avgViewsPerDay: 18,
      avgLikesPerWeek: 6,
      responseRate: 72,
    },
  });

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vue d'ensemble</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Eye}
            label="Vues du profil"
            value={analytics.views.total.toLocaleString()}
            change={{
              value: analytics.views.change,
              label: 'cette semaine',
            }}
            color="emerald"
          />
          <StatCard
            icon={Heart}
            label="Likes reçus"
            value={analytics.likes.total}
            change={{
              value: analytics.likes.change,
              label: 'cette semaine',
            }}
            color="rose"
          />
          <StatCard
            icon={MessageCircle}
            label="Messages"
            value={analytics.messages.total}
            change={{
              value: analytics.messages.change,
              label: 'cette semaine',
            }}
            color="blue"
          />
        </div>
      </div>

      {/* Profile Performance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold-100 text-gold-600 border-2 border-gold-200">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Performance du Profil
            </h3>
            <p className="text-sm text-gray-600">
              Votre profil est mieux classé que 85% des utilisateurs
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Completion Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Score de complétion
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {analytics.completionImpact.profileScore}%
              </span>
            </div>
            <Progress
              value={analytics.completionImpact.profileScore}
              className="h-3"
            />
            <p className="text-xs text-gray-600 mt-2">
              Un profil plus complet augmente vos chances de match de 300%
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vues par jour (moy.)</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.completionImpact.avgViewsPerDay}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Likes par semaine (moy.)</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.completionImpact.avgLikesPerWeek}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux de réponse</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.completionImpact.responseRate}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Visitor Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Villes des visiteurs
            </h3>
          </div>
          <div className="space-y-4">
            {analytics.demographics.topCities.map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {city.name}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {city.percentage}%
                  </span>
                </div>
                <Progress value={city.percentage} className="h-2" />
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Age Groups */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tranches d'âge</h3>
          </div>
          <div className="space-y-4">
            {analytics.demographics.ageGroups.map((group, index) => (
              <motion.div
                key={group.range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {group.range} ans
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {group.percentage}%
                  </span>
                </div>
                <Progress value={group.percentage} className="h-2" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Visitor Type */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-5 w-5 text-rose-600" />
          <h3 className="text-lg font-semibold text-gray-900">Type de visiteurs</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Visiteurs uniques
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {analytics.profileVisits.unique}
              </span>
            </div>
            <Progress
              value={(analytics.profileVisits.unique / (analytics.profileVisits.unique + analytics.profileVisits.returning)) * 100}
              className="h-3"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Visiteurs récurrents
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {analytics.profileVisits.returning}
              </span>
            </div>
            <Progress
              value={(analytics.profileVisits.returning / (analytics.profileVisits.unique + analytics.profileVisits.returning)) * 100}
              className="h-3"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-emerald-600">
              {Math.round((analytics.profileVisits.returning / analytics.profileVisits.unique) * 100)}%
            </span>{' '}
            de vos visiteurs reviennent consulter votre profil, ce qui indique un fort
            intérêt.
          </p>
        </div>
      </Card>

      {/* Tips Card */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-white shadow-sm">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conseils pour améliorer vos statistiques
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">•</span>
                <span>
                  Ajoutez plus de photos : Les profils avec 5+ photos reçoivent 2x plus
                  de vues
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">•</span>
                <span>
                  Complétez votre section "À propos" : Un profil détaillé augmente le taux
                  de réponse de 40%
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-0.5">•</span>
                <span>
                  Restez actif : Les utilisateurs actifs quotidiennement apparaissent plus
                  souvent dans les recherches
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
