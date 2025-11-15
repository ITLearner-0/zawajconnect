import { useGamificationRewards } from '@/hooks/gamification/useGamificationRewards';
import RewardCard from './RewardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface RewardsDisplayProps {
  userId: string;
}

const RewardsDisplay = ({ userId }: RewardsDisplayProps) => {
  const {
    rewards,
    loading,
    claiming,
    error,
    claimReward,
    getUnclaimedRewards,
    getClaimedRewards,
    getExpiredRewards,
    getTotalUnclaimedValue,
  } = useGamificationRewards(userId);

  if (loading) {
    return <StandardLoadingState loading={true} loadingText="Loading rewards..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const unclaimedRewards = getUnclaimedRewards();
  const claimedRewards = getClaimedRewards();
  const expiredRewards = getExpiredRewards();

  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No Rewards Yet</CardTitle>
          <CardDescription>Complete activities to earn rewards!</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Rewards
            </CardTitle>
            <CardDescription>
              {unclaimedRewards.length} unclaimed • {getTotalUnclaimedValue()} total value
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unclaimed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unclaimed">Unclaimed ({unclaimedRewards.length})</TabsTrigger>
            <TabsTrigger value="claimed">Claimed ({claimedRewards.length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({expiredRewards.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="unclaimed" className="mt-6">
            {unclaimedRewards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No unclaimed rewards</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unclaimedRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    onClaim={claimReward}
                    claiming={claiming === reward.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claimed" className="mt-6">
            {claimedRewards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No claimed rewards yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claimedRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="expired" className="mt-6">
            {expiredRewards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No expired rewards</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiredRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RewardsDisplay;
