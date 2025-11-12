import React from 'react';
import { Shield } from 'lucide-react';

interface WaliSupervisorProps {
  conversationId: string;
}

const WaliSupervisor: React.FC<WaliSupervisorProps> = ({ conversationId }) => {
  return (
    <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/50 p-4 rounded-md text-sm text-green-700 dark:text-green-200 my-3 border border-green-200 dark:border-green-600 font-medium shadow-sm">
      <Shield className="h-5 w-5 mr-2.5 text-green-600 dark:text-green-300" />
      <span>
        This Nikah Connect conversation is being supervised by a Wali (ID:{' '}
        {conversationId.substring(0, 8)})
      </span>
    </div>
  );
};

export default WaliSupervisor;
