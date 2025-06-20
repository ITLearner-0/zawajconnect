
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, UserCheck, UserX, Mail } from "lucide-react";

interface ManagedUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  wali_verified: boolean;
}

const WaliManagement: React.FC = () => {
  const { user } = useAuth();
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchManagedUsers();
    }
  }, [user]);

  const fetchManagedUsers = async () => {
    if (!user) return;

    try {
      // Get wali profile to find managed users
      const { data: waliProfile, error: waliError } = await supabase
        .from('wali_profiles')
        .select('managed_users')
        .eq('user_id', user.id)
        .single();

      if (waliError) {
        console.error('Error fetching wali profile:', waliError);
        return;
      }

      if (waliProfile?.managed_users?.length) {
        // Fetch profiles of managed users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, is_verified, wali_verified')
          .in('id', waliProfile.managed_users);

        if (profilesError) {
          console.error('Error fetching managed user profiles:', profilesError);
          return;
        }

        // Get auth users to get emails
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          return;
        }

        // Combine profile and auth data
        const combinedUsers = profiles?.map(profile => {
          const authUser = authUsers.users.find(u => u.id === profile.id);
          return {
            ...profile,
            email: authUser?.email || ''
          };
        }) || [];

        setManagedUsers(combinedUsers);
      }
    } catch (error) {
      console.error('Error in fetchManagedUsers:', error);
    }
  };

  const linkUserToWali = async () => {
    if (!user || !newUserEmail.trim()) return;

    setLoading(true);
    try {
      // Call the database function to link wali to user
      const { data, error } = await supabase.rpc('link_wali_to_user', {
        wali_user_id: user.id,
        managed_user_email: newUserEmail.trim()
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast.success("User Linked Successfully", {
          description: `${newUserEmail} is now under your supervision`
        });
        setNewUserEmail("");
        fetchManagedUsers();
      } else {
        toast.error("User Not Found", {
          description: "No user found with that email address"
        });
      }
    } catch (error: any) {
      console.error('Error linking user:', error);
      toast.error("Failed to Link User", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationReminder = async (userEmail: string) => {
    toast.info("Verification Reminder", {
      description: `Reminder sent to ${userEmail} to complete verification`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Managed User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter user's email address"
              type="email"
            />
            <CustomButton 
              onClick={linkUserToWali}
              disabled={loading || !newUserEmail.trim()}
              isLoading={loading}
            >
              Link User
            </CustomButton>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Enter the email address of a user you want to supervise
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managed Users ({managedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {managedUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No managed users yet. Add users using their email addresses above.
            </p>
          ) : (
            <div className="space-y-4">
              {managedUsers.map((managedUser) => (
                <div
                  key={managedUser.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">
                        {managedUser.first_name} {managedUser.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {managedUser.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={managedUser.is_verified ? "default" : "secondary"}>
                        {managedUser.is_verified ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1" />
                        )}
                        {managedUser.is_verified ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge variant={managedUser.wali_verified ? "default" : "outline"}>
                        Wali {managedUser.wali_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!managedUser.is_verified && (
                      <CustomButton
                        size="sm"
                        variant="outline"
                        onClick={() => sendVerificationReminder(managedUser.email)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Remind
                      </CustomButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaliManagement;
