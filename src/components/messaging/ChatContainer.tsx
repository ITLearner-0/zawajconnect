
import React, { useState } from 'react';
import { ChevronLeft, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { MonitoringReport } from '@/services/monitoring';  // Updated import path
import AIMonitoringDashboard from './AIMonitoringDashboard';

interface ChatContainerProps {
  children: React.ReactNode;
  report?: MonitoringReport | null;
  monitoringEnabled?: boolean;
  toggleMonitoring?: () => void;
  monitoringLoading?: boolean;
}

const ChatContainer = ({ 
  children, 
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
    <div className="flex flex-col h-full relative bg-islamic-solidGreen/10 dark:bg-islamic-darkGreen/20 border border-islamic-teal/20 dark:border-islamic-darkTeal/20 rounded-lg">
      {/* Main chat content */}
      <div className="flex-grow overflow-hidden">
        {children}
      </div>
      
      {/* AI Monitoring Panel (collapsible) */}
      <div 
        className={`border-t border-islamic-teal/20 dark:border-islamic-darkTeal/30 transition-all duration-300 ${
          showMonitoring ? 'h-[400px]' : 'h-10'
        } bg-islamic-cream/50 dark:bg-islamic-darkCard/50`}
      >
        <div 
          className="h-10 flex items-center justify-between px-4 cursor-pointer"
          onClick={() => setShowMonitoring(!showMonitoring)}
        >
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2 text-islamic-teal dark:text-islamic-brightGold" />
            <span className="font-medium text-sm text-islamic-burgundy dark:text-islamic-cream">
              AI Monitoring {report?.violations?.some(v => v.severity === 'high') && '• High Risk Detected'}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-islamic-teal hover:bg-islamic-teal/10 dark:text-islamic-brightGold dark:hover:bg-islamic-brightGold/10">
            {showMonitoring ? <ChevronDown /> : <ChevronUp />}
          </Button>
        </div>
        
        {showMonitoring && (
          <div className="p-3 h-[360px] overflow-y-auto">
            <AIMonitoringDashboard
              report={report}
              isEnabled={monitoringEnabled}
              onToggleMonitoring={toggleMonitoring}
              isLoading={monitoringLoading}
              error={null}
              onClose={() => setShowMonitoring(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
