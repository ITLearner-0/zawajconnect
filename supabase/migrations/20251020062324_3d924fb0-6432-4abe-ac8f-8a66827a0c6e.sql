-- Add Braintree columns to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS braintree_customer_id TEXT,
ADD COLUMN IF NOT EXISTS braintree_subscription_id TEXT;