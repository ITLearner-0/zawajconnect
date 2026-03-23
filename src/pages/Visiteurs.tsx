/**
 * Visiteurs - Who Viewed My Profile page
 *
 * Shows a chronological list of users who visited your profile,
 * with quick actions to view their profile or send a message.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, User, MapPin, Clock, MessageCircle, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface Visitor {
  viewer_id: string;
  visited_at: string;
  visit_count: number;
  profile: {
    full_name: string;
    age: number | null;
    location: string | null;
    profile_picture: string | null;
    occupation: string | null;
  } | null;
}

const Visiteurs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVisitors();
  }, [user]);

  const fetchVisitors = async () => {
    if (!user) return;

    try {
      // Get profile views grouped by viewer, most recent first
      const { data: views, error } = await supabase
        .from('profile_views')
        .select('viewer_id, created_at')
        .eq('viewed_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching visitors:', error);
        setLoading(false);
        return;
      }

      if (!views || views.length === 0) {
        setVisitors([]);
        setLoading(false);
        return;
      }

      // Group by viewer_id: keep latest visit and count
      const visitorMap = new Map<string, { visited_at: string; visit_count: number }>();
      for (const view of views) {
        const existing = visitorMap.get(view.viewer_id);
        if (existing) {
          existing.visit_count += 1;
        } else {
          visitorMap.set(view.viewer_id, {
            visited_at: view.created_at,
            visit_count: 1,
          });
        }
      }

      // Fetch profiles for all visitors
      const viewerIds = Array.from(visitorMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, age, location, profile_picture, occupation')
        .in('user_id', viewerIds);

      const profileMap = (profiles ?? []).reduce(
        (acc, p) => {
          acc[p.user_id] = p;
          return acc;
        },
        {} as Record<string, (typeof profiles)[0]>
      );

      // Build visitor list
      const visitorList: Visitor[] = viewerIds.map((viewerId) => {
        const entry = visitorMap.get(viewerId)!;
        const profile = profileMap[viewerId] ?? null;
        return {
          viewer_id: viewerId,
          visited_at: entry.visited_at,
          visit_count: entry.visit_count,
          profile: profile
            ? {
                full_name: profile.full_name ?? 'Utilisateur',
                age: profile.age,
                location: profile.location,
                profile_picture: profile.profile_picture,
                occupation: profile.occupation,
              }
            : null,
        };
      });

      setVisitors(visitorList);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <StandardLoadingState message="Chargement des visiteurs..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
            <Eye className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Visiteurs</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {visitors.length > 0
                ? `${visitors.length} personne${visitors.length > 1 ? 's' : ''} ont consulté votre profil`
                : 'Personne n\'a encore visité votre profil'}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {visitors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Aucun visiteur pour le moment
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Complétez votre profil et soyez actif pour attirer plus de visiteurs.
              </p>
              <Button onClick={() => navigate('/browse')} style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
                Découvrir des profils
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Visitors List */}
        {visitors.length > 0 && (
          <div className="space-y-3">
            {visitors.map((visitor) => (
              <Card
                key={visitor.viewer_id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/profile/${visitor.viewer_id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {visitor.profile?.profile_picture ? (
                      <img
                        src={visitor.profile.profile_picture}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover border-2"
                        style={{ borderColor: 'var(--color-primary-light)' }}
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-primary)' }}>
                        <span className="text-lg text-white font-bold">
                          {visitor.profile?.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-base truncate">
                          {visitor.profile?.full_name || 'Utilisateur'}
                        </h3>
                        {visitor.profile?.age && (
                          <span className="text-sm text-muted-foreground">
                            {visitor.profile.age} ans
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {visitor.profile?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {visitor.profile.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(visitor.visited_at)}
                        </span>
                      </div>

                      {visitor.visit_count > 1 && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {visitor.visit_count} visites
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/messages?userId=${visitor.viewer_id}`);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Visiteurs;
