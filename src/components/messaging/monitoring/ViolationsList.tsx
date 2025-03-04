
import React, { useState } from 'react';
import { Violation } from '@/services/aiMonitoringService';
import { AlertTriangle, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ViolationsListProps {
  violations: Violation[];
}

const ViolationsList: React.FC<ViolationsListProps> = ({ violations }) => {
  const [filter, setFilter] = useState<'all' | 'islamic' | 'behavioral' | 'sentiment'>('all');
  
  const filteredViolations = violations.filter(violation => 
    filter === 'all' || violation.type === filter
  );

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {filteredViolations.length} violation{filteredViolations.length !== 1 ? 's' : ''} detected
        </h3>
        <div className="flex items-center space-x-1">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            className="text-sm border-none bg-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All types</option>
            <option value="islamic">Islamic</option>
            <option value="behavioral">Behavioral</option>
            <option value="sentiment">Sentiment</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {filteredViolations.length > 0 ? (
          filteredViolations.map((violation, index) => (
            <div key={index} className="border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="font-medium">{violation.message}</span>
                </div>
                <Badge className={getSeverityColor(violation.severity)}>
                  {violation.severity}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span className="capitalize">{violation.type} violation</span>
                <span>{new Date(violation.timestamp).toLocaleString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            No violations detected
          </div>
        )}
      </div>
    </>
  );
};

export default ViolationsList;
