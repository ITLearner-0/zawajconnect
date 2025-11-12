import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { rateLimitingService } from '@/services/rateLimiting/rateLimitingService';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, AlertTriangle, Clock } from 'lucide-react';

interface RateLimitStats {
  totalKeys: number;
  blockedUsers: number;
}

export const RateLimitDashboard: React.FC = () => {
  const [stats, setStats] = useState<RateLimitStats>({ totalKeys: 0, blockedUsers: 0 });
  const [userToUnblock, setUserToUnblock] = useState('');
  const [userToBlock, setUserToBlock] = useState('');
  const [blockDuration, setBlockDuration] = useState(60); // minutes
  const [blockReason, setBlockReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const updateStats = () => {
      const newStats = rateLimitingService.getStats();
      setStats(newStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleUnblockUser = async () => {
    if (!userToUnblock.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      await rateLimitingService.unblockUser(userToUnblock.trim());
      setUserToUnblock('');
      toast({
        title: 'Success',
        description: `User ${userToUnblock} has been unblocked`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unblock user',
        variant: 'destructive',
      });
    }
  };

  const handleBlockUser = async () => {
    if (!userToBlock.trim() || !blockReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter user ID and reason',
        variant: 'destructive',
      });
      return;
    }

    try {
      const durationMs = blockDuration * 60 * 1000;
      await rateLimitingService.blockUser(userToBlock.trim(), durationMs, blockReason);
      setUserToBlock('');
      setBlockReason('');
      toast({
        title: 'Success',
        description: `User ${userToBlock} has been blocked for ${blockDuration} minutes`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to block user',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate Limits</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKeys}</div>
            <p className="text-xs text-muted-foreground">Total active tracking entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedUsers}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abuse Detection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Monitoring for suspicious activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Operational
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">All systems running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Unblock User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter user ID"
              value={userToUnblock}
              onChange={(e) => setUserToUnblock(e.target.value)}
            />
            <Button onClick={handleUnblockUser} className="w-full">
              Unblock User
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Block User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter user ID"
              value={userToBlock}
              onChange={(e) => setUserToBlock(e.target.value)}
            />
            <Input
              placeholder="Reason for blocking"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={blockDuration}
              onChange={(e) => setBlockDuration(Number(e.target.value))}
            />
            <Button onClick={handleBlockUser} variant="destructive" className="w-full">
              Block User
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Authentication:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Sign In: 5 attempts/15min</li>
                  <li>• Sign Up: 3 attempts/hour</li>
                  <li>• Password Reset: 3 attempts/hour</li>
                </ul>
              </div>
              <div>
                <strong>API Endpoints:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Messages: 30 requests/min</li>
                  <li>• Profile: 20 requests/min</li>
                  <li>• Search: 15 requests/min</li>
                </ul>
              </div>
              <div>
                <strong>Special Limits:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• File Upload: 5 requests/min</li>
                  <li>• Compatibility: 10 requests/min</li>
                  <li>• General API: 60 requests/min</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
