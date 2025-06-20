
import { useState } from 'react';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useToast } from '@/components/ui/use-toast';

export const useRateLimitedMessaging = () => {
  const [loading, setLoading] = useState(false);
  const { checkRateLimit } = useRateLimiting();
  const { toast } = useToast();

  const sendMessage = async (content: string, conversationId: string) => {
    setLoading(true);
    
    try {
      // Check rate limit before sending message
      const allowed = checkRateLimit('message');
      
      if (!allowed) {
        setLoading(false);
        return null;
      }

      // Simulate API call (replace with actual implementation)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, conversationId })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });

      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    
    try {
      // Check rate limit with custom config for file uploads
      const allowed = checkRateLimit('fileUpload', { 
        maxRequests: 10, 
        windowMs: 60000, // 1 minute
        blockDuration: 300000 // 5 minutes
      });
      
      if (!allowed) {
        setLoading(false);
        return null;
      }

      // Simulate file upload (replace with actual implementation)
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return result;
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    uploadFile,
    loading
  };
};
