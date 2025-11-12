import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EventsTabProps {
  events: any[];
}

const EventsTab = ({ events }: EventsTabProps) => {
  return (
    <ScrollArea className="h-64">
      <div className="space-y-1">
        {events
          .slice(-50)
          .reverse()
          .map((event, index) => (
            <div key={index} className="text-xs p-1 border rounded">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{event.type}</Badge>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {event.elementId && (
                <div className="truncate text-gray-600 mt-1">{event.elementId}</div>
              )}
            </div>
          ))}

        {events.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-4">No events recorded</div>
        )}
      </div>
    </ScrollArea>
  );
};

export default EventsTab;
