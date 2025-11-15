import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Bell, LogOut, Home, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WaliDashboardStats, WaliProfile } from '@/types/wali';

interface WaliHeaderProps {
  profile: WaliProfile;
  statistics: WaliDashboardStats;
  onSignOut?: () => void;
}

const WaliHeader: React.FC<WaliHeaderProps> = ({ profile, statistics, onSignOut }) => {
  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-white shadow mb-6">
      <div className="flex justify-between items-center">
        <Button
          asChild
          variant="ghost"
          className="flex items-center gap-2 text-islamic-teal hover:bg-islamic-teal/10"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </Button>

        <div className="flex items-center space-x-4">
          {statistics.pendingRequests > 0 && (
            <div className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {statistics.pendingRequests}
              </span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {profile.first_name[0]}
                    {profile.last_name[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{profile.relationship} Role</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onSignOut && (
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="bg-islamic-teal/30 p-3 rounded-lg">
          <Shield className="h-6 w-6 text-islamic-teal" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Wali Dashboard</h1>
          <p className="text-gray-600">Supervising {statistics.totalSupervised} conversations</p>
        </div>
      </div>
    </div>
  );
};

export default WaliHeader;
