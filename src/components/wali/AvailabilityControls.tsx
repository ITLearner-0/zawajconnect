
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, BellRing, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { WaliProfile } from '@/types/wali';

interface AvailabilityControlsProps {
  availabilityStatus: WaliProfile['availability_status'];
  onUpdateAvailability: (status: WaliProfile['availability_status']) => void;
}

const AvailabilityControls: React.FC<AvailabilityControlsProps> = ({ 
  availabilityStatus, 
  onUpdateAvailability 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Clock className="mr-2 h-5 w-5" />
          Availability Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={availabilityStatus}
          onValueChange={(value) => onUpdateAvailability(value as WaliProfile['availability_status'])}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="available" id="available" />
            <Label 
              htmlFor="available" 
              className="flex items-center cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
              Available
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="busy" id="busy" />
            <Label 
              htmlFor="busy" 
              className="flex items-center cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 mr-2"></span>
              Busy
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="offline" id="offline" />
            <Label 
              htmlFor="offline" 
              className="flex items-center cursor-pointer"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></span>
              Offline
            </Label>
          </div>
        </RadioGroup>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-4 w-4" />
              <Label htmlFor="notifications">Notification Alerts</Label>
            </div>
            <Switch id="notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellOff className="h-4 w-4" />
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
            </div>
            <Switch id="quiet-hours" />
          </div>
        </div>
        
        <Button className="w-full mt-6">
          Update Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvailabilityControls;
