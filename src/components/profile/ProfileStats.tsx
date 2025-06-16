
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, MessageCircle, UserCheck } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    profileViews: number;
    likesReceived: number;
    messagesReceived: number;
    matchesFound: number;
  };
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statItems = [
    {
      icon: Eye,
      label: 'Vues du profil',
      value: stats.profileViews,
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      label: 'Likes reçus',
      value: stats.likesReceived,
      color: 'text-red-600'
    },
    {
      icon: MessageCircle,
      label: 'Messages reçus',
      value: stats.messagesReceived,
      color: 'text-green-600'
    },
    {
      icon: UserCheck,
      label: 'Matches trouvés',
      value: stats.matchesFound,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-rose-800">
          Statistiques du Profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
