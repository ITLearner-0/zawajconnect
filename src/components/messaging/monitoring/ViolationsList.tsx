
import React, { useState } from 'react';
import { Violation } from '@/services/aiMonitoringService';
import { AlertTriangle, Filter } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import ViolationItem from './ViolationItem';

interface ViolationsListProps {
  violations: Violation[];
}

const ViolationsList: React.FC<ViolationsListProps> = ({ violations }) => {
  const [filter, setFilter] = useState<'all' | 'islamic' | 'behavioral' | 'sentiment'>('all');
  
  const filteredViolations = violations.filter(violation => 
    filter === 'all' || violation.type === filter
  );

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
            <ViolationItem key={index} violation={violation} />
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
