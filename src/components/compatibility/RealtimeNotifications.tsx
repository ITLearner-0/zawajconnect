
import { useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRealtimeMatching } from "@/hooks/compatibility/useRealtimeMatching";
import { MatchNotification } from "@/hooks/compatibility/services/realtimeService";

const RealtimeNotifications = () => {
  const { notifications, unreadCount, isConnected, markAsRead } = useRealtimeMatching();
  const [isOpen, setIsOpen] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const getNotificationIcon = (type: MatchNotification['notification_type']) => {
    switch (type) {
      case 'new_match':
        return '💕';
      case 'score_update':
        return '📊';
      case 'profile_update':
        return '👤';
      default:
        return '📬';
    }
  };

  const getNotificationTitle = (notification: MatchNotification) => {
    switch (notification.notification_type) {
      case 'new_match':
        return 'Nouvelle correspondance';
      case 'score_update':
        return 'Score mis à jour';
      case 'profile_update':
        return 'Profil mis à jour';
      default:
        return 'Notification';
    }
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Notifications</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Aucune notification
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {getNotificationIcon(notification.notification_type)}
                            </span>
                            <h4 className="text-sm font-medium">
                              {getNotificationTitle(notification)}
                            </h4>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-1">
                            {notification.message || 'Pas de message'}
                          </p>
                          
                          {notification.score && (
                            <div className="text-xs text-primary font-medium">
                              Score: {notification.score}%
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default RealtimeNotifications;
