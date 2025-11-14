import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserCog, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, full_name, created_at, avatar_url, user_id')
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchQuery) {
        query = query.ilike('full_name', `%${searchQuery}%`);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Fetch email from auth.users separately
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      
      const usersWithEmail = profiles?.map(profile => ({
        ...profile,
        email: authUsers?.find(u => u.id === profile.user_id)?.email || 'N/A'
      }));

      return usersWithEmail;
    },
  });

  const { data: userRoles } = useQuery({
    queryKey: ['admin-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (error) throw error;
      
      const rolesMap: Record<string, string[]> = {};
      if (data) {
        data.forEach(ur => {
          const userId = ur.user_id;
          if (!rolesMap[userId]) {
            rolesMap[userId] = [];
          }
          rolesMap[userId]!.push(ur.role as string);
        });
      }
      return rolesMap;
    },
  });

  const getRoleBadge = (userId: string) => {
    if (!userRoles) return <Badge variant="outline">User</Badge>;
    
    const roles = userRoles[userId] || [];
    if (roles.includes('super_admin')) {
      return <Badge variant="destructive"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>;
    }
    if (roles.includes('admin')) {
      return <Badge variant="default"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    }
    if (roles.includes('moderator')) {
      return <Badge variant="secondary"><UserCog className="h-3 w-3 mr-1" />Moderator</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Gestion des Utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez les utilisateurs, leurs rôles et permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/user/${user.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-primary">
                          {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.full_name || 'Nom non renseigné'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.id)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
