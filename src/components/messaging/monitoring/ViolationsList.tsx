import React from 'react';
import { Violation } from '@/services/monitoring'; // Updated import path
import ViolationItem from './ViolationItem';

interface ViolationsListProps {
  violations: Violation[];
}

const ViolationsList: React.FC<ViolationsListProps> = ({ violations }) => {
  if (violations.length === 0) {
    return (
      <div className="text-center py-4 text-rose-500 dark:text-rose-400 italic bg-rose-50/50 dark:bg-rose-900/50 rounded-lg border border-rose-200 dark:border-rose-700">
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
