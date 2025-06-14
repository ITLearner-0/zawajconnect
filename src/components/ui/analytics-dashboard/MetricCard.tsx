
import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string | React.ReactNode;
  icon: LucideIcon;
  iconColor?: string;
}

const MetricCard = ({ title, value, description, icon: Icon, iconColor = 'text-gray-600' }: MetricCardProps) => {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <div className="text-sm text-gray-500 mt-1">{description}</div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </Card>
  );
};

export default MetricCard;
