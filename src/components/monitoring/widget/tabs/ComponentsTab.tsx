
import React from 'react';
import { ComponentMetrics } from '@/services/performance/componentMetricsService';

interface ComponentsTabProps {
  componentMetrics: Map<string, ComponentMetrics>;
  formatTime: (ms: number) => string;
}

const ComponentsTab: React.FC<ComponentsTabProps> = ({
  componentMetrics,
  formatTime,
}) => {
  const sortedComponents = Array.from(componentMetrics.values())
    .sort((a, b) => b.renderTime - a.renderTime)
    .slice(0, 10);

  return (
    <div className="space-y-2">
      {sortedComponents.map((component) => (
        <div key={component.componentName} className="text-xs p-2 border rounded">
          <div className="font-medium truncate">{component.componentName}</div>
          <div className="flex justify-between text-muted-foreground">
            <span>Render: {formatTime(component.renderTime)}</span>
            <span>Updates: {component.updateCount}</span>
          </div>
        </div>
      ))}
      
      {componentMetrics.size === 0 && (
        <div className="text-center text-muted-foreground text-xs py-4">
          No component data yet
        </div>
      )}
    </div>
  );
};

export default ComponentsTab;
