import React from 'react';
import { Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SecuritySettingsPanelProps {
  encryptionEnabled: boolean;
  toggleEncryption: (enabled: boolean) => void;
}

const SecuritySettingsPanel: React.FC<SecuritySettingsPanelProps> = ({
  encryptionEnabled,
  toggleEncryption,
}) => {
  if (!encryptionEnabled && !toggleEncryption) return null;

  return (
    <div className="bg-muted/30 p-3 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <div>
            <h4 className="text-sm font-medium">End-to-End Encryption</h4>
            <p className="text-xs text-muted-foreground">
              Messages are encrypted and can only be read by participants in this conversation
            </p>
          </div>
        </div>
        <Switch checked={encryptionEnabled} onCheckedChange={toggleEncryption} />
      </div>
    </div>
  );
};

export default SecuritySettingsPanel;
