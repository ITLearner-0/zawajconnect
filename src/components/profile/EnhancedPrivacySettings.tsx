import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Shield, EyeOff, UserX, Settings } from 'lucide-react';
import { PrivacySettings as PrivacySettingsType } from '@/types/profile';
import { EnhancedPrivacySettings as EnhancedPrivacySettingsType } from '@/types/enhancedPrivacy';
import { useEnhancedPrivacy } from '@/hooks/privacy/useEnhancedPrivacy';
import EnhancedPrivacyControls from '@/components/privacy/EnhancedPrivacyControls';

interface EnhancedPrivacySettingsProps {
  userId: string;
  privacySettings: PrivacySettingsType;
  blockedUsers: string[];
  isAccountVisible: boolean;
  onPrivacyChange: (settings: PrivacySettingsType) => void;
  onToggleAccountVisibility: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
}

const EnhancedPrivacySettings = ({
  userId,
  privacySettings,
  blockedUsers,
  isAccountVisible,
  onPrivacyChange,
  onToggleAccountVisibility,
  onUnblockUser,
}: EnhancedPrivacySettingsProps) => {
  const { toast } = useToast();
  const {
    privacySettings: enhancedSettings,
    updatePrivacySettings: updateEnhancedSettings,
    loading,
  } = useEnhancedPrivacy(userId);

  const handleSettingChange = (settingName: keyof PrivacySettingsType, value: boolean) => {
    onPrivacyChange({
      ...privacySettings,
      [settingName]: value,
    });
  };

  const handleProfileVisibilityChange = (value: number[]) => {
    onPrivacyChange({
      ...privacySettings,
      profileVisibilityLevel: value[0] ?? 1,
    });
  };

  const getVisibilityLevelText = (level: number) => {
    switch (level) {
      case 0:
        return 'Public (Visible to all users)';
      case 1:
        return 'Moderate (Only show basic info to non-matches)';
      case 2:
        return 'Private (Only visible to matches)';
      default:
        return 'Custom';
    }
  };

  const handleEnhancedSettingsChange = async (newSettings: EnhancedPrivacySettingsType) => {
    const success = await updateEnhancedSettings(newSettings);
    if (!success) {
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-rose-600 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <Shield className="mr-2 h-5 w-5" />
          Privacy & Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="incognito">Incognito</TabsTrigger>
            <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Basic Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-md font-medium">Profile Visibility</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="visibility-level">
                    Visibility Level:{' '}
                    {getVisibilityLevelText(privacySettings.profileVisibilityLevel)}
                  </Label>
                </div>
                <Slider
                  id="visibility-level"
                  min={0}
                  max={2}
                  step={1}
                  value={[privacySettings.profileVisibilityLevel ?? 1]}
                  onValueChange={handleProfileVisibilityChange}
                  className="w-full"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-age">Show your age</Label>
                  <Switch
                    id="show-age"
                    checked={privacySettings.showAge}
                    onCheckedChange={(checked) => handleSettingChange('showAge', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-location">Show your location</Label>
                  <Switch
                    id="show-location"
                    checked={privacySettings.showLocation}
                    onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-occupation">Show your occupation</Label>
                  <Switch
                    id="show-occupation"
                    checked={privacySettings.showOccupation}
                    onCheckedChange={(checked) => handleSettingChange('showOccupation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-messaging">Allow messaging from non-matches</Label>
                  <Switch
                    id="allow-messaging"
                    checked={privacySettings.allowNonMatchMessages}
                    onCheckedChange={(checked) =>
                      handleSettingChange('allowNonMatchMessages', checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Account Visibility Toggle */}
            <div className="pt-4 border-t">
              <div className="flex flex-col space-y-2">
                <h3 className="text-md font-medium flex items-center">
                  <EyeOff className="mr-2 h-5 w-5" />
                  Account Visibility
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAccountVisible
                    ? 'Your account is currently visible to other users.'
                    : 'Your account is currently hidden from other users.'}
                </p>
                <Button
                  variant={isAccountVisible ? 'outline' : 'default'}
                  className={`mt-2 ${!isAccountVisible ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  onClick={async () => {
                    await onToggleAccountVisibility();
                    toast({
                      title: isAccountVisible ? 'Account Hidden' : 'Account Visible',
                      description: isAccountVisible
                        ? 'Your profile is now hidden from other users.'
                        : 'Your profile is now visible to other users.',
                      duration: 3000,
                    });
                  }}
                >
                  {isAccountVisible ? 'Pause Account Visibility' : 'Make Account Visible'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <EnhancedPrivacyControls
              userId={userId}
              currentSettings={enhancedSettings}
              onSettingsChange={handleEnhancedSettingsChange}
            />
          </TabsContent>

          <TabsContent value="incognito" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="h-5 w-5" />
                <h3 className="text-lg font-medium">Incognito Mode</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Browse privately and control your digital footprint while using the platform.
              </p>

              {/* This content is handled in EnhancedPrivacyControls */}
              <div className="p-4 border rounded-lg">
                <p className="text-sm">Incognito settings are available in the Advanced tab.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blocked" className="mt-6">
            <div className="flex flex-col space-y-2">
              <h3 className="text-md font-medium flex items-center">
                <UserX className="mr-2 h-5 w-5" />
                Blocked Users
              </h3>
              {blockedUsers.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {blockedUsers.map((userId) => (
                    <div
                      key={userId}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm">User ID: {userId.substring(0, 8)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await onUnblockUser(userId);
                          toast({
                            title: 'User Unblocked',
                            description: 'You can now interact with this user again.',
                            duration: 3000,
                          });
                        }}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You haven't blocked any users yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedPrivacySettings;
