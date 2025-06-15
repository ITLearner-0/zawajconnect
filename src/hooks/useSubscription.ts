
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        toast.error('Erreur lors de la vérification de l\'abonnement');
        return;
      }

      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Erreur lors de la vérification de l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'premium' | 'vip') => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Erreur lors de la création de la session de paiement');
        return;
      }

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erreur lors de la création de la session de paiement');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error('Erreur lors de l\'ouverture du portail client');
        return;
      }

      // Open customer portal in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erreur lors de l\'ouverture du portail client');
    } finally {
      setLoading(false);
    }
  };

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return {
    ...subscriptionData,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    isPremium: subscriptionData.subscribed && subscriptionData.subscription_tier === 'Premium',
    isVip: subscriptionData.subscribed && subscriptionData.subscription_tier === 'VIP'
  };
};
