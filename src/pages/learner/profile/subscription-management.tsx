import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, CreditCard, Download, AlertCircle, Loader2, Calendar, Star } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import { razorpayService, PaymentTransaction } from '../../../utils/razorpayService';
import { formatAmount } from '../../../lib/razorpay';
import { PricingPlan, getPricingPlans } from '../../../utils/pricingService';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';

interface SubscriptionData {
  id: string;
  planName: string;
  planDuration: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  amount: number;
  categoryName?: string;
  isActive: boolean;
}

interface SubscriptionManagementProps {
  profile: any;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ profile }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // Load subscriptions
      await loadSubscriptions();
      
      // Load transactions
      await loadTransactions();
      
      // Load pricing plans
      const plans = await getPricingPlans();
      setPricingPlans(plans);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    if (!user?.uid) return;

    try {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(
        subscriptionsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const subscriptionData: SubscriptionData[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        subscriptionData.push({
          id: doc.id,
          planName: (data as any).planName || 'Unknown Plan',
          planDuration: (data as any).planDuration || 30,
          startDate: (data as any).startDate?.toDate() || new Date(),
          endDate: (data as any).endDate?.toDate() || new Date(),
          status: (data as any).status || 'active',
          amount: (data as any).amount || 0,
          categoryName: (data as any).categoryName,
          isActive: (data as any).isActive || false
        });
      });
      
      setSubscriptions(subscriptionData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.uid) return;

    try {
      const userTransactions = await razorpayService.getUserTransactions(user.uid);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleDirectPurchase = async (plan: PricingPlan) => {
    if (!user?.uid || !profile) {
      toast.error('User information not available');
      return;
    }

    setPurchasing(plan.id);
    
    try {
      // Prepare payment data
      const paymentData = {
        userId: user.uid,
        userName: profile.name || user.displayName || 'User',
        userEmail: profile.emailId || user.email || '',
        userPhone: profile.phoneNumber || '',
        planId: plan.id,
        planName: plan.name,
        planDuration: typeof plan.duration === 'string' ? parseInt(plan.duration) : plan.duration,
        amount: plan.basePrice,
        categoryName: plan.categoryName
      };

      // Process payment directly without popup
      const result = await razorpayService.processDirectPayment(paymentData);
      
      if (result.success) {
        setLastPurchase({
          plan: plan.name,
          amount: plan.basePrice,
          transactionId: result.transactionId,
          receipt: result.receipt
        });
        setShowThankYou(true);
        
        // Reload data
        await loadData();
        
        toast.success('Subscription purchased successfully!');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setPurchasing(null);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'active' && isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else if (status === 'expired') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Clock className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8 mt-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#ff7700]" />
          <span className="ml-2 text-gray-600">Loading subscription data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Thank You Modal */}
      {showThankYou && lastPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                Your subscription to <strong>{lastPurchase.plan}</strong> has been activated successfully.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> {formatAmount(lastPurchase.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Transaction ID:</strong> {lastPurchase.transactionId}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Receipt:</strong> {lastPurchase.receipt}
                </p>
              </div>
              <Button
                onClick={() => setShowThankYou(false)}
                className="w-full bg-[#ff7700] hover:bg-[#e55e00] text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#ff7700]">Current Subscription</h2>
          {subscriptions.length > 0 && (
            <div className="text-sm text-gray-600">
              {subscriptions.filter(sub => sub.status === 'active' && sub.isActive).length} Active Plan(s)
            </div>
          )}
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-4">Subscribe to a plan to access premium content and features.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{subscription.planName}</h3>
                  {getStatusBadge(subscription.status, subscription.isActive)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{subscription.planDuration} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">{formatAmount(subscription.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="ml-2 font-medium">{formatDate(subscription.endDate)}</span>
                  </div>
                </div>
                {subscription.categoryName && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-sm">Category Access:</span>
                    <span className="ml-2 text-sm font-medium">{subscription.categoryName}</span>
                  </div>
                )}
                {subscription.status === 'active' && subscription.isActive && (
                  <div className="mt-3 flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-blue-600">
                      {getDaysRemaining(subscription.endDate)} days remaining
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#ff7700] mb-4">Available Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-[#ff7700] mb-2">
                  {formatAmount(plan.basePrice)}
                </div>
                <p className="text-sm text-gray-500">{plan.durationText}</p>
              </div>
              
              <div className="space-y-2 mb-6">
                {plan.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleDirectPurchase(plan)}
                disabled={purchasing === plan.id}
                className="w-full bg-[#ff7700] hover:bg-[#e55e00] text-white"
              >
                {purchasing === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#ff7700]">Transaction History</h2>
          <Download className="w-5 h-5 text-gray-400" />
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
            <p className="text-gray-600">Your payment history will appear here after making a purchase.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono text-gray-600">
                      {transaction.razorpayPaymentId}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{transaction.planName}</div>
                        {transaction.categoryName && (
                          <div className="text-xs text-gray-500">{transaction.categoryName}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(transaction.receipt, '_blank')}
                        className="text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
