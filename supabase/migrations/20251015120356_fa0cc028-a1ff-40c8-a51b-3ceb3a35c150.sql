-- Add PayPal subscription ID column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;