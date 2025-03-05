
import React from 'react';
import { Shield } from 'lucide-react';

interface WaliSupervisorProps {
  conversationId: string;
}

const WaliSupervisor: React.FC<WaliSupervisorProps> = ({ conversationId }) => {
  return (
    <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/40 p-3 rounded-md text-sm text-green-700 dark:text-green-300 my-2 border border-green-200 dark:border-green-700 font-medium">
      <Shield className="h-4 w-4 mr-2" />
      <span>This conversation is being supervised by a Wali (ID: {conversationId.substring(0, 8)})</span>
    </div>
  );
};

export default WaliSupervisor;
