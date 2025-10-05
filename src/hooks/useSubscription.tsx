import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  loading: boolean;
}

// Map product IDs to plan info
const PRODUCT_MAPPING = {
  'prod_TB8Q6AILWjCstr': { id: 'premium', name: 'Premium', price: 19.99 },
  'prod_TB8QPhRHOsYWAo': { id: 'family_plus', name: 'Famille+', price: 39.99 },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user) {
      setStatus({ subscribed: false, product_id: null, subscription_end: null, loading: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setStatus({ subscribed: false, product_id: null, subscription_end: null, loading: false });
        return;
      }

      if (data) {
        setStatus({
          subscribed: data.subscribed,
          product_id: data.product_id,
          subscription_end: data.subscription_end,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setStatus({ subscribed: false, product_id: null, subscription_end: null, loading: false });
    }
  };

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every minute
    const interval = setInterval(checkSubscription, 60000);

    // Refresh on success return from Stripe
    const handleSuccess = () => {
      setTimeout(checkSubscription, 2000);
    };

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true') {
        handleSuccess();
      }
    }

    return () => clearInterval(interval);
  }, [user]);

  const getPlanInfo = () => {
    if (!status.product_id) return null;
    return PRODUCT_MAPPING[status.product_id as keyof typeof PRODUCT_MAPPING] || null;
  };

  const isPremium = () => {
    return status.subscribed && status.product_id === 'prod_TB8Q6AILWjCstr';
  };

  const isFamilyPlus = () => {
    return status.subscribed && status.product_id === 'prod_TB8QPhRHOsYWAo';
  };

  const hasActiveSubscription = () => {
    return status.subscribed;
  };

  return {
    ...status,
    checkSubscription,
    getPlanInfo,
    isPremium,
    isFamilyPlus,
    hasActiveSubscription,
  };
};
