import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import type { QualityMetrics, ConnectionQuality } from '@/services/webrtc-signaling';

interface ConnectionQualityIndicatorProps {
  metrics: QualityMetrics | null;
  compact?: boolean;
}

export function ConnectionQualityIndicator({ metrics, compact = false }: ConnectionQualityIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!metrics) return null;

  const getQualityColor = (quality: ConnectionQuality) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
    }
  };

  const getQualityIcon = (quality: ConnectionQuality) => {
    const iconClass = "h-4 w-4";
    switch (quality) {
      case 'excellent':
        return <SignalHigh className={iconClass} />;
      case 'good':
        return <Signal className={iconClass} />;
      case 'fair':
        return <SignalMedium className={iconClass} />;
      case 'poor':
        return <SignalLow className={iconClass} />;
    }
  };

  const getQualityLabel = (quality: ConnectionQuality) => {
    switch (quality) {
      case 'excellent':
        return 'Excellente';
      case 'good':
        return 'Bonne';
      case 'fair':
        return 'Moyenne';
      case 'poor':
        return 'Faible';
    }
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate > 1_000_000) {
      return `${(bitrate / 1_000_000).toFixed(1)} Mbps`;
    }
    return `${(bitrate / 1000).toFixed(0)} Kbps`;
  };

  if (compact) {
    return (
      <Badge
        variant="outline"
        className={`${getQualityColor(metrics.quality)} text-white border-0`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getQualityIcon(metrics.quality)}
        <span className="ml-1">{getQualityLabel(metrics.quality)}</span>
      </Badge>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Qualité de connexion</h3>
        </div>
        <Badge className={`${getQualityColor(metrics.quality)} text-white`}>
          {getQualityLabel(metrics.quality)}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Latence (RTT)</span>
          <span className="font-medium">{metrics.rtt.toFixed(0)}ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Gigue (Jitter)</span>
          <span className="font-medium">{metrics.jitter.toFixed(2)}ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Paquets perdus</span>
          <span className="font-medium">{metrics.packetsLost}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Débit</span>
          <span className="font-medium">{formatBitrate(metrics.bitrate)}</span>
        </div>
      </div>

      {metrics.quality === 'poor' && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
          <p className="text-red-600 dark:text-red-400">
            ⚠️ Connexion instable. La qualité vidéo a été réduite automatiquement.
          </p>
        </div>
      )}

      {metrics.quality === 'fair' && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
          <p className="text-yellow-600 dark:text-yellow-400">
            ℹ️ Qualité ajustée pour optimiser la connexion.
          </p>
        </div>
      )}
    </Card>
  );
}
