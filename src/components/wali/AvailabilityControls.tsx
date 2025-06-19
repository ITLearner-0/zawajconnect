
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleOff, Clock, Radio } from "lucide-react";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AvailabilityControlsProps {
  availabilityStatus: string;
  onUpdateAvailability: (status: 'online' | 'away' | 'busy' | 'offline') => Promise<boolean>;
  loading?: boolean;
}

const AvailabilityControls: React.FC<AvailabilityControlsProps> = ({
  availabilityStatus,
  onUpdateAvailability,
  loading = false
}) => {
  const handleStatusChange = (value: string) => {
    onUpdateAvailability(value as 'online' | 'away' | 'busy' | 'offline');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Radio className="h-5 w-5 mr-2 text-islamic-teal" />
          <span>Availability Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Select
            value={availabilityStatus}
            onValueChange={handleStatusChange}
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Set your availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="online" className="flex items-center">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Online
                </div>
              </SelectItem>
              <SelectItem value="away">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                  Away
                </div>
              </SelectItem>
              <SelectItem value="busy">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Busy
                </div>
              </SelectItem>
              <SelectItem value="offline">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                  Offline
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {loading && (
            <div className="absolute right-10 top-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-start mb-2">
            <Clock className="h-4 w-4 mr-2 mt-0.5" />
            <p>
              Your availability controls when users can reach you and how notifications are prioritized.
            </p>
          </div>
          
          <div className="flex items-start">
            <CircleOff className="h-4 w-4 mr-2 mt-0.5" />
            <p>
              Setting yourself to Offline will pause all new chat requests.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityControls;
