
import { Badge } from '@/components/ui/badge';
import { RetentionPolicy } from '@/types/profile';

interface FeaturesAndSettingsProps {
  encryptionEnabled: boolean;
  monitoringEnabled: boolean;
  retentionPolicy: RetentionPolicy;
}

const FeaturesAndSettings = ({ 
  encryptionEnabled, 
  monitoringEnabled, 
  retentionPolicy 
}: FeaturesAndSettingsProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Features</h3>
      <ul className="space-y-2 list-disc list-inside">
        <li>Real-time messaging (simulated)</li>
        <li>Video calls with WebRTC (simulated)</li>
        <li>Wali supervision for female profiles</li>
        <li>End-to-end encryption</li>
        <li>Message retention policies</li>
        <li>Content monitoring and moderation</li>
      </ul>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Settings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Encryption:</span>
            <Badge variant={encryptionEnabled ? 'default' : 'outline'}>
              {encryptionEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Retention:</span>
            <Badge variant="outline">
              {retentionPolicy.type === 'temporary' 
                ? `${retentionPolicy.duration_days} days` 
                : 'Permanent'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>AI Monitoring:</span>
            <Badge variant={monitoringEnabled ? 'default' : 'outline'}>
              {monitoringEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesAndSettings;
