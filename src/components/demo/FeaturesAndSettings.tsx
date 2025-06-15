
import { Badge } from '@/components/ui/badge';
import { RetentionPolicy } from '@/types/profile';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="font-semibold mb-2">{t('demo.features')}</h3>
      <ul className="space-y-2 list-disc list-inside">
        <li>{t('demo.featuresList.realtimeMessaging')}</li>
        <li>{t('demo.featuresList.videoCalls')}</li>
        <li>{t('demo.featuresList.waliSupervision')}</li>
        <li>{t('demo.featuresList.endToEndEncryption')}</li>
        <li>{t('demo.featuresList.messageRetention')}</li>
        <li>{t('demo.featuresList.contentMonitoring')}</li>
      </ul>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">{t('demo.settings')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>{t('demo.settingsLabels.encryption')}:</span>
            <Badge variant={encryptionEnabled ? 'default' : 'outline'}>
              {encryptionEnabled ? t('demo.settingsLabels.enabled') : t('demo.settingsLabels.disabled')}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('demo.settingsLabels.retention')}:</span>
            <Badge variant="outline">
              {retentionPolicy.type === 'temporary' 
                ? `${retentionPolicy.duration_days} ${t('demo.settingsLabels.days')}` 
                : t('demo.settingsLabels.permanent')}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('demo.settingsLabels.aiMonitoring')}:</span>
            <Badge variant={monitoringEnabled ? 'default' : 'outline'}>
              {monitoringEnabled ? t('demo.settingsLabels.enabled') : t('demo.settingsLabels.disabled')}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesAndSettings;
