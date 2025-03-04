
import React from 'react';
import { Shield } from 'lucide-react';

interface WaliSupervisorProps {
  conversationId: string;
}

const WaliSupervisor: React.FC<WaliSupervisorProps> = ({ conversationId }) => {
  return (
    <div className="flex items-center justify-center bg-green-50 p-2 rounded-md text-sm text-green-700 my-2">
      <Shield className="h-4 w-4 mr-2" />
      <span>This conversation is being supervised by a Wali (ID: {conversationId.substring(0, 8)})</span>
    </div>
  );
};

export default WaliSupervisor;
