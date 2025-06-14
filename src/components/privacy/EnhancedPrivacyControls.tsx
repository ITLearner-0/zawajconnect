
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Settings, Lock, UserX } from 'lucide-react';
import { EnhancedPrivacySettings, ProgressiveRevealSettings, IncognitoSettings } from '@/types/enhancedPrivacy';
import { useToast } from '@/components/ui/use-toast';
import { incognitoService } from '@/hooks/privacy/services/incognitoService';

interface EnhancedPrivacyControlsProps {
  userId: string;
  currentSettings: EnhancedPrivacySettings;
  onSettingsChange: (settings: EnhancedPrivacySettings) => void;
}

const EnhancedPrivacyControls = ({
  userId,
  currentSettings,
  onSettingsChange
}: EnhancedPrivacyControlsProps) => {
  const { toast } = useToast();
  const [isIncognito, setIsIncognito] = useState(false);
  const [settings, setSettings] = useState<EnhancedPrivacySettings>(currentSettings);

  useEffect(() => {
    const checkIncognitoStatus = async () => {
      const status = await incognitoService.checkIncognitoStatus(userId);
      setIsIncognito(status);
    };
    checkIncognitoStatus();
  }, [userId]);

  const handleProgressiveRevealChange = (field: keyof ProgressiveRevealSettings, value: any) => {
    const newSettings = {
      ...settings,
      progressiveReveal: {
        ...settings.progressiveReveal,
        [field]: value
      }
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleIncognitoToggle = async () => {
    const newIncognitoState = !isIncognito;
    
    const success = newIncognitoState 
      ? await incognitoService.enableIncognito(userId)
      : await incognitoService.disableIncognito(userId);

    if (success) {
      setIsIncognito(newIncognitoState);
      toast({
        title: newIncognitoState ? "Incognito Mode Enabled" : "Incognito Mode Disabled",
        description: newIncognitoState 
          ? "Your browsing activity is now private and you're hidden from search results." 
          : "You're now visible in search results and your activity is tracked normally.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to toggle incognito mode. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleProfileVisibilityChange = (field: string, value: any) => {
    const newSettings = {
      ...settings,
      profileVisibility: {
        ...settings.profileVisibility,
        [field]: value
      }
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className="space-y-6">
      {/* Incognito Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Incognito Browsing Mode
            {isIncognito && <Badge variant="secondary">Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Enable Incognito Mode</Label>
              <p className="text-sm text-muted-foreground">
                Browse privately, limit profile views, and hide from search results
              </p>
            </div>
            <Switch 
              checked={isIncognito} 
              onCheckedChange={handleIncognitoToggle}
            />
          </div>

          {isIncognito && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Incognito Features Active:</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Hidden from search results</li>
                <li>• Last active time is hidden</li>
                <li>• View history is not tracked</li>
                <li>• Limited to 5 profile views per day</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progressive Profile Reveal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Progressive Profile Reveal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Enable Progressive Reveal</Label>
              <p className="text-sm text-muted-foreground">
                Gradually reveal more profile information as compatibility increases
              </p>
            </div>
            <Switch 
              checked={settings.progressiveReveal?.enabled || false}
              onCheckedChange={(checked) => handleProgressiveRevealChange('enabled', checked)}
            />
          </div>

          {settings.progressiveReveal?.enabled && (
            <div className="space-y-6 mt-6">
              <div>
                <Label>Minimum Compatibility Score for Full Reveal</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.progressiveReveal.requiresCompatibilityScore || 70]}
                    onValueChange={(value) => handleProgressiveRevealChange('requiresCompatibilityScore', value[0])}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>50%</span>
                    <span className="font-medium">{settings.progressiveReveal.requiresCompatibilityScore || 70}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Auto-reveal after conversation (days)</Label>
                <div className="mt-2">
                  <Slider
                    value={[settings.progressiveReveal.autoRevealAfterDays || 7]}
                    onValueChange={(value) => handleProgressiveRevealChange('autoRevealAfterDays', value[0])}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>1 day</span>
                    <span className="font-medium">{settings.progressiveReveal.autoRevealAfterDays || 7} days</span>
                    <span>30 days</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Reveal Stages</h4>
                  {Object.entries(settings.progressiveReveal.revealStages || {}).map(([stage, enabled]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <Label className="capitalize">{stage.replace('_', ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => {
                          const newStages = {
                            ...settings.progressiveReveal.revealStages,
                            [stage]: checked
                          };
                          handleProgressiveRevealChange('revealStages', newStages);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Visibility Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Who can see your profile</Label>
            <Select
              value={settings.profileVisibility?.whoCanSeeProfile || 'everyone'}
              onValueChange={(value) => handleProfileVisibilityChange('whoCanSeeProfile', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="matches_only">Matches Only</SelectItem>
                <SelectItem value="verified_only">Verified Users Only</SelectItem>
                <SelectItem value="custom">Custom Criteria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {settings.profileVisibility?.whoCanSeeProfile === 'custom' && (
            <div className="space-y-4 mt-4 p-4 border rounded-lg">
              <h4 className="font-medium">Custom Visibility Criteria</h4>
              
              <div>
                <Label>Minimum Compatibility Score</Label>
                <Slider
                  value={[settings.profileVisibility.customCriteria?.minCompatibilityScore || 60]}
                  onValueChange={(value) => {
                    const newCriteria = {
                      ...settings.profileVisibility.customCriteria,
                      minCompatibilityScore: value[0]
                    };
                    handleProfileVisibilityChange('customCriteria', newCriteria);
                  }}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full mt-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Require Verification</Label>
                <Switch
                  checked={settings.profileVisibility.customCriteria?.requireVerification || false}
                  onCheckedChange={(checked) => {
                    const newCriteria = {
                      ...settings.profileVisibility.customCriteria,
                      requireVerification: checked
                    };
                    handleProfileVisibilityChange('customCriteria', newCriteria);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Require Wali Approval</Label>
                <Switch
                  checked={settings.profileVisibility.customCriteria?.requireWaliApproval || false}
                  onCheckedChange={(checked) => {
                    const newCriteria = {
                      ...settings.profileVisibility.customCriteria,
                      requireWaliApproval: checked
                    };
                    handleProfileVisibilityChange('customCriteria', newCriteria);
                  }}
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Show in search results</Label>
              <p className="text-sm text-muted-foreground">Allow others to find you in search</p>
            </div>
            <Switch
              checked={settings.profileVisibility?.showInSearchResults !== false}
              onCheckedChange={(checked) => handleProfileVisibilityChange('showInSearchResults', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Allow profile screenshots</Label>
              <p className="text-sm text-muted-foreground">Prevent others from taking screenshots</p>
            </div>
            <Switch
              checked={settings.profileVisibility?.allowProfileScreenshots !== false}
              onCheckedChange={(checked) => handleProfileVisibilityChange('allowProfileScreenshots', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Retention Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Delete view history after (days)</Label>
            <Slider
              value={[settings.dataRetention?.deleteViewHistoryAfterDays || 30]}
              onValueChange={(value) => {
                const newRetention = {
                  ...settings.dataRetention,
                  deleteViewHistoryAfterDays: value[0]
                };
                setSettings({
                  ...settings,
                  dataRetention: newRetention
                });
                onSettingsChange({
                  ...settings,
                  dataRetention: newRetention
                });
              }}
              max={365}
              min={7}
              step={7}
              className="w-full mt-2"
            />
            <div className="text-sm text-muted-foreground mt-1">
              Currently: {settings.dataRetention?.deleteViewHistoryAfterDays || 30} days
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-delete rejected matches</Label>
              <p className="text-sm text-muted-foreground">Remove data from users you've rejected</p>
            </div>
            <Switch
              checked={settings.dataRetention?.autoDeleteRejectedMatches || false}
              onCheckedChange={(checked) => {
                const newRetention = {
                  ...settings.dataRetention,
                  autoDeleteRejectedMatches: checked
                };
                setSettings({
                  ...settings,
                  dataRetention: newRetention
                });
                onSettingsChange({
                  ...settings,
                  dataRetention: newRetention
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPrivacyControls;
