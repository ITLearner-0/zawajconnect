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
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Checking subscription for user:', user.email);

      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription:', error);
        toast.error("Erreur lors de la vérification de l'abonnement");
        return;
      }

      console.log('Subscription data received:', data);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error("Erreur lors de la vérification de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: 'premium' | 'vip') => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous abonner');
      return;
    }

    console.log('Creating checkout session for plan:', plan);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Erreur lors de la création de la session de paiement');
        return;
      }

      if (!data?.url) {
        console.error('No URL returned from checkout session');
        toast.error('Aucune URL de paiement reçue');
        return;
      }

      console.log('Redirecting to checkout URL:', data.url);
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');

      toast.success('Redirection vers le paiement...');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erreur lors de la création de la session de paiement');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    console.log('Opening customer portal for user:', user.email);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      console.log('Customer portal response:', { data, error });

      if (error) {
        console.error('Error opening customer portal:', error);
        toast.error("Erreur lors de l'ouverture du portail client");
        return;
      }

      if (!data?.url) {
        console.error('No URL returned from customer portal');
        toast.error('Aucune URL de portail reçue');
        return;
      }

      console.log('Redirecting to customer portal URL:', data.url);
      // Open customer portal in new tab
      window.open(data.url, '_blank');

      toast.success('Ouverture du portail client...');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error("Erreur lors de l'ouverture du portail client");
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
    isVip: subscriptionData.subscribed && subscriptionData.subscription_tier === 'VIP',
  };
};
