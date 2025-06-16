
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Heart, MessageCircle, UserCheck, Eye, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'profile_view' | 'verification' | 'wali';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    // Simulated notifications data
    setNotifications([
      {
        id: '1',
        type: 'match',
        title: 'Nouvelle correspondance',
        message: 'Amina Al-Zahra a montré de l\'intérêt pour votre profil',
        timestamp: '2 heures',
        isRead: false,
        actionUrl: '/matches'
      },
      {
        id: '2',
        type: 'message',
        title: 'Nouveau message',
        message: 'Khadija vous a envoyé un message',
        timestamp: '5 heures',
        isRead: false,
        actionUrl: '/messages'
      },
      {
        id: '3',
        type: 'profile_view',
        title: 'Profil consulté',
        message: 'Votre profil a été consulté 3 fois aujourd\'hui',
        timestamp: '1 jour',
        isRead: true
      },
      {
        id: '4',
        type: 'verification',
        title: 'Vérification approuvée',
        message: 'Votre vérification d\'identité a été approuvée',
        timestamp: '2 jours',
        isRead: true,
        actionUrl: '/profile'
      },
      {
        id: '5',
        type: 'wali',
        title: 'Demande Wali',
        message: 'Votre Wali a approuvé une nouvelle conversation',
        timestamp: '3 jours',
        isRead: true,
        actionUrl: '/messages'
      }
    ]);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="h-5 w-5 text-rose-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'profile_view':
        return <Eye className="h-5 w-5 text-green-500" />;
      case 'verification':
        return <UserCheck className="h-5 w-5 text-purple-500" />;
      case 'wali':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    toast({
      title: "Notifications marquées",
      description: "Toutes les notifications ont été marquées comme lues.",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée.",
    });
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-rose-500">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex space-x-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-rose-500 hover:bg-rose-600' : 'border-rose-300 text-rose-700 hover:bg-rose-50'}
          >
            Toutes ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            className={filter === 'unread' ? 'bg-rose-500 hover:bg-rose-600' : 'border-rose-300 text-rose-700 hover:bg-rose-50'}
          >
            Non lues ({unreadCount})
          </Button>
        </div>

        {/* Liste des notifications */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm ${!notification.isRead ? 'ring-2 ring-rose-300' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-rose-800 dark:text-rose-200">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-rose-600 dark:text-rose-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-rose-500 dark:text-rose-400 mt-2">
                            Il y a {notification.timestamp}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-rose-600 hover:bg-rose-100"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {notification.actionUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 border-rose-300 text-rose-700 hover:bg-rose-50"
                          onClick={() => {
                            markAsRead(notification.id);
                            // Navigation would be handled here
                          }}
                        >
                          Voir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 text-rose-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-rose-800 dark:text-rose-200 mb-2">
                  Aucune notification
                </h3>
                <p className="text-rose-600 dark:text-rose-300">
                  {filter === 'unread' 
                    ? "Vous n'avez aucune notification non lue."
                    : "Vous n'avez aucune notification."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
