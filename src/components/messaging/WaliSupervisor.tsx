
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useProfileData } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/profile';

interface WaliSupervisorProps {
  conversationId: string;
}

const WaliSupervisor = ({ conversationId }: WaliSupervisorProps) => {
  const { formData } = useProfileData();
  const [waliMessages, setWaliMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const fetchWaliVisibleMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_wali_visible', true)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (!error && data) {
        setWaliMessages(data as Message[]);
      }
    };
    
    fetchWaliVisibleMessages();
    
    // Set up subscription for new wali-visible messages
    const channel = supabase
      .channel('wali_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId} AND is_wali_visible=eq.true`
      }, (payload) => {
        setWaliMessages(prev => [payload.new as Message, ...prev].slice(0, 10));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  if (!formData.waliName) {
    return (
      <div className="p-4 bg-amber-50 border-t border-amber-200">
        <div className="flex items-center text-amber-700 mb-2">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Wali supervision required</h3>
        </div>
        <p className="text-sm text-amber-600">
          As a female user, you should have a wali supervising your conversations.
          Please update your profile to add your wali information.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border-t border-green-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center text-green-700">
          <Shield className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Wali Supervision Active</h3>
        </div>
        <div className="text-sm text-green-600">
          {formData.waliName} ({formData.waliRelationship})
        </div>
      </div>
      
      <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
        <h4 className="text-sm font-medium text-green-700">Recent supervised messages:</h4>
        {waliMessages.length === 0 ? (
          <p className="text-sm text-green-600 italic">No supervised messages yet</p>
        ) : (
          waliMessages.map(message => (
            <div key={message.id} className="text-sm bg-white p-2 rounded border border-green-200">
              <div className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </div>
              <div className="mt-1">{message.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WaliSupervisor;
