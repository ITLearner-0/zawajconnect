
import React from 'react';
import { Activity, Cpu, Database } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PerformanceWidgetTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'components', label: 'Components', icon: Cpu },
  { id: 'api', label: 'API', icon: Database },
];

const PerformanceWidgetTabs: React.FC<PerformanceWidgetTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="flex border-b mb-3">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-1 px-2 py-1 text-xs ${
            activeTab === id ? 'border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          <Icon className="h-3 w-3" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default PerformanceWidgetTabs;
