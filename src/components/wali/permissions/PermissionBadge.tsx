import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { WaliAdminRole } from '@/hooks/wali/useWaliAdminPermissions';

interface PermissionBadgeProps {
  role: WaliAdminRole | null;
  showIcon?: boolean;
}

export const PermissionBadge = ({ role, showIcon = true }: PermissionBadgeProps) => {
  if (!role) return null;

  const variants: Record<WaliAdminRole, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    super_admin: { variant: 'destructive', label: 'Super Admin' },
    approver: { variant: 'default', label: 'Approbateur' },
    editor: { variant: 'secondary', label: 'Éditeur' },
    viewer: { variant: 'outline', label: 'Visualiseur' },
  };

  const config = variants[role];

  return (
    <Badge variant={config.variant} className="gap-1">
      {showIcon && <Shield className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};
