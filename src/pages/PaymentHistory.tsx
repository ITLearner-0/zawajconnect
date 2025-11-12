import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { logger } from '@/utils/logger';
import { announce } from '@/utils/accessibility';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  expires_at: string | null;
  auto_renew: boolean;
  created_at: string;
}

export default function PaymentHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPaymentData();
  }, [user, navigate]);

  const fetchPaymentData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(undefined);

      // Fetch payment history - note: table may not exist yet
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        logger.warn('Payments table not available', { error: paymentsError.message });
      }

      // Fetch current subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        logger.error('Error fetching subscription', subscriptionError);
      }

      // Map payments from subscriptions table (if payments table doesn't exist)
      setPayments(
        (paymentsData ?? []).map((sub) => ({
          id: sub.id,
          user_id: sub.user_id,
          plan_type: sub.plan_type ?? '',
          amount: 0, // Amount not available in subscriptions table
          currency: 'EUR',
          status: (sub.status === 'active' ? 'completed' : 'pending') as
            | 'completed'
            | 'pending'
            | 'failed'
            | 'refunded',
          payment_method: '',
          transaction_id: null,
          created_at: sub.created_at,
          updated_at: sub.created_at,
        }))
      );

      setCurrentSubscription(
        subscriptionData
          ? {
              ...subscriptionData,
              plan_type: subscriptionData.plan_type ?? '',
              status: (subscriptionData.status ?? 'active') as 'active' | 'cancelled' | 'expired',
              start_date: subscriptionData.created_at,
              expires_at: subscriptionData.expires_at ?? null,
              auto_renew: false,
            }
          : undefined
      );

      announce('Payment history loaded');
    } catch (err) {
      const errorMsg = 'Failed to load payment history';
      logger.error(errorMsg, err);
      setError(errorMsg);
      announce(errorMsg, 'assertive');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleDownloadInvoice = async (paymentId: string) => {
    try {
      // Find the payment
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) {
        toast({
          title: 'Erreur',
          description: 'Paiement introuvable',
          variant: 'destructive',
        });
        return;
      }

      // Get user profile for invoice details
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id ?? '')
        .maybeSingle();

      // Generate invoice PDF
      await generateInvoicePDF({
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.created_at,
        plan: payment.plan_type,
        userEmail: user?.email || undefined,
        userName: profile?.full_name || undefined,
      });

      logger.log('Invoice downloaded successfully', paymentId);
      announce('Facture téléchargée avec succès');

      toast({
        title: 'Facture téléchargée',
        description: "La fenêtre d'impression s'est ouverte. Vous pouvez enregistrer en PDF.",
      });
    } catch (error) {
      logger.error('Failed to download invoice', error);
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Impossible de télécharger la facture',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View your subscription and payment details</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800" role="alert">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription */}
      {currentSubscription && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Current Subscription
            </CardTitle>
            <CardDescription>Your active plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Plan Type</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentSubscription.plan_type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge className="mt-1 bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {currentSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {currentSubscription.expires_at ? 'Expires On' : 'Started On'}
                </p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(
                    new Date(currentSubscription.expires_at || currentSubscription.start_date),
                    'MMM dd, yyyy'
                  )}
                </p>
              </div>
            </div>
            {currentSubscription.auto_renew && (
              <p className="mt-4 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 inline mr-1 text-emerald-600" />
                Auto-renewal enabled
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            {payments.length} {payments.length === 1 ? 'transaction' : 'transactions'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No payment history yet</p>
              <Button onClick={() => navigate('/settings')} variant="outline">
                Upgrade to Premium
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{payment.plan_type}</h3>
                        <Badge
                          className={getStatusColor(payment.status)}
                          aria-label={`Payment status: ${payment.status}`}
                        >
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {payment.payment_method}
                        </div>
                        {payment.transaction_id && (
                          <div className="text-xs text-gray-500 sm:col-span-2">
                            Transaction ID: {payment.transaction_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatAmount(payment.amount, payment.currency)}
                        </p>
                      </div>
                      {payment.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment.id)}
                          aria-label="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Need help with billing?</strong> Contact our support team at{' '}
            <a href="mailto:billing@zawajconnect.com" className="underline hover:text-blue-700">
              billing@zawajconnect.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
