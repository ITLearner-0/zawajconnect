import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { Message } from '@/hooks/useChatMessages';

interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
}

export const MessageBubble = ({ message, isMyMessage }: MessageBubbleProps) => {
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: fr });
    } else if (isYesterday(date)) {
      return `Hier ${format(date, 'HH:mm', { locale: fr })}`;
    } else {
      return format(date, 'dd/MM HH:mm', { locale: fr });
    }
  };

  const getMessageStatus = () => {
    if (!isMyMessage) return null;

    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-primary" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={`flex mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[70%] px-3 py-2"
        style={
          isMyMessage
            ? {
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '16px 16px 4px 16px',
              }
            : {
                backgroundColor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '16px 16px 16px 4px',
              }
        }
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className="flex items-center gap-2 text-xs mt-1"
          style={{
            color: isMyMessage ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)',
          }}
        >
          <span>{formatMessageTime(message.created_at)}</span>
          {getMessageStatus()}
        </div>
      </div>
    </div>
  );
};
