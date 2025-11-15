import React from 'react';

interface CompactViewProps {
  pageLoadTime: number;
  memory: number;
  apiAverageTime: number;
  formatTime: (ms: number) => string;
  formatMemory: (bytes: number) => string;
  getScoreColor: (score: number, thresholds: [number, number]) => string;
}

const CompactView: React.FC<CompactViewProps> = ({
  pageLoadTime,
  memory,
  apiAverageTime,
  formatTime,
  formatMemory,
  getScoreColor,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>Page Load:</span>
        <span className={getScoreColor(pageLoadTime, [1000, 3000])}>
          {formatTime(pageLoadTime)}
        </span>
      </div>

      <div className="flex justify-between text-xs">
        <span>Memory:</span>
        <span>{formatMemory(memory)}</span>
      </div>

      <div className="flex justify-between text-xs">
        <span>API Avg:</span>
        <span className={getScoreColor(apiAverageTime, [500, 1000])}>
          {formatTime(apiAverageTime)}
        </span>
      </div>
    </div>
  );
};

export default CompactView;
