
import React from 'react';
import { Violation } from '@/services/monitoring';  // Updated import path
import ViolationItem from './ViolationItem';

interface ViolationsListProps {
  violations: Violation[];
}

const ViolationsList: React.FC<ViolationsListProps> = ({ violations }) => {
  if (violations.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        No violations detected
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {violations.map((violation, index) => (
        <ViolationItem key={index} violation={violation} />
      ))}
    </ul>
  );
};

export default ViolationsList;
