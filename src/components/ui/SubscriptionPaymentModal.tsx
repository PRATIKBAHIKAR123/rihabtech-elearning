import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { razorpayService, SubscriptionPaymentData } from '../../utils/razorpayService';
import { initializeRazorpay, formatAmount } from '../../lib/razorpay';
import { PricingPlan } from '../../utils/pricingService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: PricingPlan;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Credit/Debit Cards, UPI, Net Banking',
    available: true
  }
];

export const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  plan,
  userDetails
}) => {
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('IN'); // Default to India
  const [userInfo, setUserInfo] = useState({
    name: userDetails?.name || user?.displayName || '',
    email: userDetails?.email || user?.email || '',
    phone: userDetails?.phone || ''
  });

  useEffect(() => {
    if (isOpen) {
      loadRazorpay();
    }
  }, [isOpen]);

  const loadRazorpay = async () => {
    try {
      await initializeRazorpay();
      setRazorpayLoaded(true);
    } catch (error) {
      console.error('Failed to load Razorpay:', error);
      toast.error('Failed to load payment gateway');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateUserInfo = (): boolean => {
    if (!userInfo.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!userInfo.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!userInfo.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    // Validate international phone number (should have country code and be at least 10 digits)
    const phoneDigits = userInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const calculatePricingBreakdown = () => {
    // Use the same logic as the pricing service to handle totalAmount when basePrice is 0
    const totalAmount = (plan as any).totalAmount || 0;
    const basePrice = plan.basePrice || 0;
    
    console.log('Payment Modal - Pricing calculation for plan:', plan.name);
    console.log('Payment Modal - Original basePrice:', basePrice);
    console.log('Payment Modal - Total amount:', totalAmount);
    console.log('Payment Modal - Tax percentage:', plan.taxPercentage);
    
    // If basePrice is 0 but totalAmount exists, calculate basePrice from totalAmount
    let calculatedBasePrice = basePrice;
    if (basePrice === 0 && totalAmount > 0) {
      // Reverse calculate basePrice from totalAmount
      // totalAmount = basePrice + (basePrice * taxPercentage / 100)
      // totalAmount = basePrice * (1 + taxPercentage / 100)
      // basePrice = totalAmount / (1 + taxPercentage / 100)
      calculatedBasePrice = totalAmount / (1 + plan.taxPercentage / 100);
      console.log('Payment Modal - Calculated basePrice from totalAmount:', calculatedBasePrice);
    }
    
    const taxAmount = (calculatedBasePrice * plan.taxPercentage) / 100;
    const platformFee = (calculatedBasePrice * plan.platformFeePercentage) / 100;
    const instructorShare = calculatedBasePrice - platformFee;
    const finalTotalAmount = totalAmount > 0 ? totalAmount : calculatedBasePrice + taxAmount;

    console.log('Payment Modal - Final pricing breakdown:', {
      baseAmount: calculatedBasePrice,
      taxAmount,
      platformFee,
      instructorShare,
      totalAmount: finalTotalAmount
    });

    return {
      baseAmount: calculatedBasePrice,
      taxAmount,
      platformFee,
      instructorShare,
      totalAmount: finalTotalAmount
    };
  };

  const handlePayment = async () => {
    if (!validateUserInfo()) return;
    if (!razorpayLoaded) {
      toast.error('Payment gateway is not loaded yet');
      return;
    }

    setIsProcessing(true);

    try {
      const pricing = calculatePricingBreakdown();
      
      const paymentData: SubscriptionPaymentData = {
        userId: user?.uid || '',
        userEmail: userInfo.email,
        userName: userInfo.name,
        userPhone: userInfo.phone,
        planId: plan.id,
        planName: plan.name,
        planDuration: plan.durationText,
        amount: pricing.baseAmount,
        taxAmount: pricing.taxAmount,
        platformFee: pricing.platformFee,
        instructorShare: pricing.instructorShare,
        totalAmount: pricing.totalAmount,
        currency: 'INR',
        categoryId: plan.categoryId,
        categoryName: plan.categoryName
      };

      // Create payment transaction
      const transactionId = await razorpayService.createPaymentTransaction(paymentData);

      // Initiate payment
      const { options } = await razorpayService.initiatePayment(transactionId, paymentData);

      // Open Razorpay checkout
      const Razorpay = (window as any).Razorpay;
      const razorpay = new Razorpay(options);
      
      razorpay.on('payment.success', async (response: any) => {
        try {
          await razorpayService.handlePaymentSuccess(transactionId, response);
          toast.success('Payment successful! Your subscription is now active.');
          onSuccess();
          onClose();
        } catch (error) {
          console.error('Payment success handling error:', error);
          toast.error('Payment processed but there was an error activating your subscription. Please contact support.');
        }
      });

      razorpay.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        toast.error('Payment failed. Please try again.');
        setIsProcessing(false);
      });

      razorpay.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const pricing = calculatePricingBreakdown();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Plan Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-3">{plan.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                {formatAmount(pricing.totalAmount)}
              </span>
              <span className="text-sm text-gray-500">{plan.durationText}</span>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  disabled={isProcessing}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <PhoneInput
                  country={'in'}
                  value={userInfo.phone}
                  onChange={(value, country) => {
                    handleInputChange('phone', value);
                    const c = country as { iso2?: string };
                    if (c && c.iso2) {
                      setPhoneCountry(c.iso2.toUpperCase());
                    }
                  }}
                  inputClass="!h-[42px] !pl-[60px] !w-full !border !border-gray-300 !rounded-md !text-sm focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500"
                  buttonClass="!border !border-gray-300 !rounded-l-md !rounded-r-none"
                  containerClass="!w-full"
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: false,
                    placeholder: 'Enter your phone number',
                    disabled: isProcessing,
                  }}
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  searchNotFound="No country found"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => method.available && setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedPaymentMethod === method.id ? (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium">{formatAmount(pricing.baseAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({plan.taxPercentage}%)</span>
                <span className="font-medium">{formatAmount(pricing.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee ({plan.platformFeePercentage}%)</span>
                <span className="font-medium">{formatAmount(pricing.platformFee)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">Total Amount</span>
                  <span className="font-bold text-lg text-blue-600">
                    {formatAmount(pricing.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Secure Payment</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment information is encrypted and secure. We use Razorpay for processing payments.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isProcessing || !razorpayLoaded}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {formatAmount(pricing.totalAmount)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
