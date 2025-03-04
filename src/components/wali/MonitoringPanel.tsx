
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentFlag } from '@/types/profile';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, MessageSquare, AlertOctagon, Trash, CheckCircle, Flag } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MonitoringPanelProps {
  flaggedContent: ContentFlag[];
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ flaggedContent }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredContent = flaggedContent.filter(content => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unresolved') return !content.resolved;
    if (activeTab === 'resolved') return content.resolved;
    if (activeTab === 'high-severity') return content.severity === 'high';
    return true;
  });
  
  const getSeverityIcon = (severity: ContentFlag['severity']) => {
    switch (severity) {
      case 'high': return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low': return <Flag className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  const getFlagTypeText = (flagType: ContentFlag['flag_type']) => {
    switch (flagType) {
      case 'inappropriate': return 'Inappropriate Content';
      case 'harassment': return 'Harassment';
      case 'religious_violation': return 'Religious Violation';
      case 'suspicious': return 'Suspicious Activity';
      default: return 'Unknown';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detailed Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-medium">Moderation Health</h3>
            <div className="flex items-center mt-1 space-x-2">
              <Progress value={75} className="w-40 h-2" />
              <span className="text-sm">75%</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className="bg-red-500">{flaggedContent.filter(c => c.severity === 'high' && !c.resolved).length} High</Badge>
            <Badge className="bg-amber-500">{flaggedContent.filter(c => c.severity === 'medium' && !c.resolved).length} Medium</Badge>
            <Badge className="bg-blue-500">{flaggedContent.filter(c => c.severity === 'low' && !c.resolved).length} Low</Badge>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="high-severity">High Severity</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {filteredContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No flagged content in this category
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContent.map(flag => (
                  <div key={flag.id || flag.content_id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(flag.severity)}
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{getFlagTypeText(flag.flag_type)}</h3>
                            {flag.resolved ? (
                              <Badge variant="outline" className="ml-2 text-green-500 border-green-200">Resolved</Badge>
                            ) : (
                              <Badge variant="outline" className="ml-2 text-amber-500 border-amber-200">Unresolved</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Flagged {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="mr-1">{flag.content_type}</Badge>
                            <p className="text-xs text-muted-foreground">ID: {flag.content_id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Content
                        </Button>
                        {!flag.resolved ? (
                          <Button variant="secondary" size="sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        ) : (
                          <Button variant="destructive" size="sm">
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {flag.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Notes:</span> {flag.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MonitoringPanel;
