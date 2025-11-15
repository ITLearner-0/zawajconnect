import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle, UserCheck, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'view' | 'like' | 'message' | 'match';
  user: {
    name: string;
    profilePicture?: string;
  };
  timestamp: Date;
  read: boolean;
}

interface ProfileActivityFeedProps {
  activities: ActivityItem[];
}

const ProfileActivityFeed: React.FC<ProfileActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'message':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'match':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'view':
        return `${activity.user.name} a consulté votre profil`;
      case 'like':
        return `${activity.user.name} a aimé votre profil`;
      case 'message':
        return `${activity.user.name} vous a envoyé un message`;
      case 'match':
        return `Nouveau match avec ${activity.user.name}`;
      default:
        return 'Activité inconnue';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-rose-800">Activité Récente</CardTitle>
          {activities.some((a) => !a.read) && (
            <Badge variant="destructive" className="text-xs">
              {activities.filter((a) => !a.read).length} nouveau(x)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Aucune activité récente</p>
            <p className="text-sm">Vos interactions apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  !activity.read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>

                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    {activity.user.profilePicture ? (
                      <img
                        src={activity.user.profilePicture}
                        alt={activity.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-rose-600 font-semibold">
                        {activity.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!activity.read ? 'font-semibold' : ''}`}>
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                </div>

                {/* Unread Indicator */}
                {!activity.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileActivityFeed;
