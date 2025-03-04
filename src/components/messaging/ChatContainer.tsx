
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Violation, MonitoringReport } from '@/services/aiMonitoringService';
import AIMonitoringDashboard from './AIMonitoringDashboard';

interface ChatContainerProps {
  children: React.ReactNode;
  violations?: Violation[];
  report?: MonitoringReport | null;
  monitoringEnabled?: boolean;
  toggleMonitoring?: () => void;
  monitoringLoading?: boolean;
}

const ChatContainer = ({ 
  children, 
  violations = [], 
  report = null, 
  monitoringEnabled = true,
  toggleMonitoring = () => {},
  monitoringLoading = false
}: ChatContainerProps) => {
  const [showMonitoring, setShowMonitoring] = useState(false);
  
  // Create proper implementations for the missing icons
  const ChevronUp = () => <ChevronLeft className="h-4 w-4 transform rotate-90" />;
  const ChevronDown = () => <ChevronLeft className="h-4 w-4 transform -rotate-90" />;
  
  return (
    <div className="flex flex-col h-full relative">
      {/* Main chat content */}
      <div className="flex-grow overflow-hidden">
        {children}
      </div>
      
      {/* AI Monitoring Panel (collapsible) */}
      <div 
        className={`border-t transition-all duration-300 ${
          showMonitoring ? 'h-[400px]' : 'h-10'
        } bg-background`}
      >
        <div 
          className="h-10 flex items-center justify-between px-4 cursor-pointer"
          onClick={() => setShowMonitoring(!showMonitoring)}
        >
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium text-sm">
              AI Monitoring {violations.some(v => v.severity === 'high') && '• High Risk Detected'}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {showMonitoring ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
        
        {showMonitoring && (
          <div className="p-3 h-[360px] overflow-y-auto">
            <AIMonitoringDashboard
              violations={violations}
              report={report}
              monitoringEnabled={monitoringEnabled}
              toggleMonitoring={toggleMonitoring}
              loading={monitoringLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
