
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import AdminMenu from '@/components/admin/AdminMenu';
import { Home, User, MessageCircle, Users, LogOut } from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold text-primary">
              Nikah
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/messages" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/nearby" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Matches
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AdminMenu />
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
