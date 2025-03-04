
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WaliProfile, WaliDashboardStats } from '@/types/wali';
import { Shield } from 'lucide-react';

interface WaliHeaderProps {
  profile: WaliProfile;
  statistics: WaliDashboardStats;
}

const WaliHeader: React.FC<WaliHeaderProps> = ({ profile, statistics }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-amber-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };
  
  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback>{profile.first_name[0]}{profile.last_name[0]}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
                <Badge variant="outline" className="ml-2 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Wali
                </Badge>
                {profile.is_verified && (
                  <Badge className="ml-2 bg-green-500 hover:bg-green-600">Verified</Badge>
                )}
              </div>
              
              <div className="flex items-center mt-1">
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(profile.availability_status)}`}></div>
                <p className="text-sm text-muted-foreground">{getStatusText(profile.availability_status)}</p>
                <p className="text-sm text-muted-foreground mx-2">•</p>
                <p className="text-sm text-muted-foreground">{profile.relationship}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.pendingRequests}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.activeConversations}</p>
              <p className="text-xs text-muted-foreground">Active Conversations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{statistics.flaggedMessages}</p>
              <p className="text-xs text-muted-foreground">Flagged Messages</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliHeader;
