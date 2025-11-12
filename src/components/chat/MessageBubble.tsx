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
        className={`max-w-[70%] px-3 py-2 rounded-lg ${
          isMyMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={`flex items-center gap-2 text-xs mt-1 ${
            isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          <span>{formatMessageTime(message.created_at)}</span>
          {getMessageStatus()}
        </div>
      </div>
    </div>
  );
};
