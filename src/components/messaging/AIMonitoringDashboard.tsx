
import { useState } from 'react';
import { Violation, MonitoringReport } from '@/services/aiMonitoringService';
import { Shield, AlertTriangle, BarChart, MessageSquare, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AIMonitoringDashboardProps {
  violations: Violation[];
  report: MonitoringReport | null;
  monitoringEnabled: boolean;
  toggleMonitoring: () => void;
  loading: boolean;
}

const AIMonitoringDashboard = ({ 
  violations, 
  report, 
  monitoringEnabled,
  toggleMonitoring,
  loading 
}: AIMonitoringDashboardProps) => {
  const [filter, setFilter] = useState<'all' | 'islamic' | 'behavioral' | 'sentiment'>('all');
  
  const filteredViolations = violations.filter(violation => 
    filter === 'all' || violation.type === filter
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              AI Monitoring Dashboard
            </CardTitle>
            <CardDescription>
              Islamic compliance and behavior analysis
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="monitoring-toggle">
              {monitoringEnabled ? "Monitoring Active" : "Monitoring Paused"}
            </Label>
            <Switch
              id="monitoring-toggle"
              checked={monitoringEnabled}
              onCheckedChange={toggleMonitoring}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="violations">
              Violations
              {violations.length > 0 && (
                <Badge variant="destructive" className="ml-2">{violations.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="report">Detailed Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            {loading ? (
              <div className="text-center py-4">Loading analysis...</div>
            ) : report ? (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Islamic Compliance</span>
                      <span className={getScoreColor(report.islamicComplianceScore)}>
                        {report.islamicComplianceScore}%
                      </span>
                    </div>
                    <Progress value={report.islamicComplianceScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Behavioral Analysis</span>
                      <span className={getScoreColor(report.behavioralScore)}>
                        {report.behavioralScore}%
                      </span>
                    </div>
                    <Progress value={report.behavioralScore} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Sentiment Analysis</span>
                      <span className={getScoreColor(report.sentimentScore)}>
                        {report.sentimentScore}%
                      </span>
                    </div>
                    <Progress value={report.sentimentScore} className="h-2" />
                  </div>
                </div>
                
                <div className="pt-2 text-sm text-gray-500">
                  Last updated: {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                Analysis will appear after more messages
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="violations">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">
                {filteredViolations.length} violation{filteredViolations.length !== 1 ? 's' : ''} detected
              </h3>
              <div className="flex items-center space-x-1">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  className="text-sm border-none bg-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                >
                  <option value="all">All types</option>
                  <option value="islamic">Islamic</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="sentiment">Sentiment</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="font-medium">{violation.message}</span>
                      </div>
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                      <span className="capitalize">{violation.type} violation</span>
                      <span>{new Date(violation.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No violations detected
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="report">
            {report ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1 text-primary">
                      {report.islamicComplianceScore}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Islamic Compliance
                    </div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1 text-primary">
                      {report.behavioralScore}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Behavioral Score
                    </div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold mb-1 text-primary">
                      {report.sentimentScore}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Sentiment Score
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2 flex items-center">
                    <BarChart className="h-4 w-4 mr-2" />
                    Analysis Summary
                  </h4>
                  <p className="text-sm text-gray-600">
                    {report.violations.length === 0 
                      ? "This conversation appears to be following Islamic guidelines. No significant issues detected." 
                      : `This conversation has ${report.violations.length} violation(s) that may need attention.`
                    }
                    {report.islamicComplianceScore < 70 && " The Islamic compliance score is concerning."}
                    {report.behavioralScore < 70 && " The behavioral patterns may need moderation."}
                    {report.sentimentScore < 40 && " The conversation tone is becoming negative."}
                  </p>
                </div>
                
                <div className="border rounded-md p-3">
                  <h4 className="font-medium mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Recommendations
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {report.islamicComplianceScore < 80 && (
                      <li>• Review Islamic guidelines for appropriate conversation topics</li>
                    )}
                    {report.behavioralScore < 80 && (
                      <li>• Consider more thoughtful and measured communication pace</li>
                    )}
                    {report.sentimentScore < 50 && (
                      <li>• Try to maintain a positive and respectful tone</li>
                    )}
                    {report.violations.length > 0 && (
                      <li>• Address the specific violations noted in the Violations tab</li>
                    )}
                    {report.violations.some(v => v.severity === 'high') && (
                      <li className="text-red-600">• Immediate attention needed for high severity violations</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Detailed report will be generated after more messages
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        <div>AI-powered monitoring for Islamic compliance</div>
        {report && <div>Report ID: {report.timestamp.substring(0, 10)}</div>}
      </CardFooter>
    </Card>
  );
};

export default AIMonitoringDashboard;
