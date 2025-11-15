import React from 'react';
import { Link } from 'react-router-dom';
import { useUserRoles } from '@/hooks/auth/useUserRoles';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Shield, Settings, BarChart3, AlertTriangle, Users, Sliders } from 'lucide-react';

const AdminMenu: React.FC = () => {
  const { isAdmin, isModerator, hasAdminOrModerator, loading } = useUserRoles();

  if (loading || !hasAdminOrModerator()) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isAdmin() && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/moderation" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4" />
                Moderation Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/analytics" className="flex items-center gap-2 w-full">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/matching-config" className="flex items-center gap-2 w-full">
                <Sliders className="h-4 w-4" />
                Algorithme Matching
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {hasAdminOrModerator() && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/emergency" className="flex items-center gap-2 w-full">
                <AlertTriangle className="h-4 w-4" />
                Emergency Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/users" className="flex items-center gap-2 w-full">
                <Users className="h-4 w-4" />
                User Management
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminMenu;
