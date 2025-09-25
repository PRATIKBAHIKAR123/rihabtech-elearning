import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import {
  RazorpayOptions,
  RazorpayResponse,
  RazorpayOrder,
  initializeRazorpay,
  createRazorpayOrder,
  verifyPaymentSignature,
  formatAmountForRazorpay,
  parseAmountFromRazorpay
} from '../lib/razorpay';
import { revenueSharingService } from './revenueSharingService';
import { emailService } from './emailService';
import type { RazorpayConfig as ConfigRazorpayConfig } from './configService';
import { configService } from './configService';
import type { RazorpayConfig } from './razorpayConfig';

export interface SubscriptionPaymentData {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  planDuration: string;
  amount: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalAmount: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  planDuration: string;
  amount: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalAmount: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  paymentDetails?: any;
  createdAt: Date;
  updatedAt: Date;
  receipt?: string;
  notes?: string;
}

export interface SubscriptionOrder {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  planId: string;
  planName: string;
  planDuration: string;
  amount: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalAmount: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string;
  paymentDetails?: any;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  receipt?: string;
  notes?: string;
}

class RazorpayService {
  private readonly TRANSACTIONS_COLLECTION = 'paymentTransactions';
  private readonly SUBSCRIPTION_ORDERS_COLLECTION = 'subscriptionOrders';
  private readonly SUBSCRIPTIONS_COLLECTION = 'subscriptions';
  private readonly RAZORPAY_CONFIG_COLLECTION = 'razorpayConfig';
  private razorpayConfig: ConfigRazorpayConfig | null = null;

  // Fetch Razorpay configuration from Firebase
  private async getRazorpayConfig(): Promise<ConfigRazorpayConfig> {
    if (this.razorpayConfig) {
      return this.razorpayConfig;
    }

    try {
      const config = await configService.getRazorpayConfig();
      this.razorpayConfig = config;
      return config;
    } catch (error) {
      console.error('Error fetching Razorpay config:', error);
      throw new Error('Failed to fetch Razorpay configuration');
    }
  }

  // Create a new payment transaction
  async createPaymentTransaction(data: SubscriptionPaymentData): Promise<string> {
    try {
      const transactionData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        userPhone: data.userPhone,
        planId: data.planId,
        planName: data.planName,
        planDuration: data.planDuration,
        amount: data.amount,
        taxAmount: data.taxAmount,
        platformFee: data.platformFee,
        instructorShare: data.instructorShare,
        totalAmount: data.totalAmount,
        currency: data.currency,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        razorpayOrderId: '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        receipt: `RCP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const docRef = await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw new Error('Failed to create payment transaction');
    }
  }

  // Create Razorpay order and initiate payment
  async initiatePayment(
    transactionId: string,
    paymentData: SubscriptionPaymentData
  ): Promise<{ orderId: string; options: RazorpayOptions }> {
    try {
      // Get Razorpay configuration
      const config = await this.getRazorpayConfig();

      // Create timestamps for the configuration
      const now = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
        toDate: () => new Date(),
      } as Timestamp;

      // Transform config to match RazorpayConfig interface
      const transformedConfig: RazorpayConfig = {
        ...config,
        createdAt: now,
        updatedAt: now,
        platform: 'Rihab Technologies',
        source: 'admin_panel',
        updatedBy: 'system',
        prefill: {
          name: config.prefill?.name || '',
          email: config.prefill?.email || '',
          contact: config.prefill?.contact || ''
        },
        webhookSecret: config.webhookSecret || '',
        webhookUrl: config.webhookUrl || ''
      };

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(
        paymentData.totalAmount,
        config.currency || paymentData.currency,
        `sub_${paymentData.planId}_${Date.now()}`,
        //transformedConfig
      );

      // Update transaction with Razorpay order ID
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, transactionId);
      await updateDoc(transactionRef, {
        razorpayOrderId: razorpayOrder.id,
        updatedAt: serverTimestamp()
      });

      // Prepare Razorpay options
      const options: RazorpayOptions = {
        key: config.isTestMode ? config.keyId : process.env.REACT_APP_RAZORPAY_KEY_ID || config.keyId,
        amount: formatAmountForRazorpay(paymentData.totalAmount),
        currency: config.currency || paymentData.currency,
        name: 'Rihab Technologies',
        description: config.description || `${paymentData.planName} - ${paymentData.planDuration}`,
        //order_id: razorpayOrder.id,
        prefill: {
          name: paymentData.userName,
          email: paymentData.userEmail,
          contact: paymentData.userPhone
        },
        notes: {
          planId: paymentData.planId,
          planName: paymentData.planName,
          planDuration: paymentData.planDuration,
          userId: paymentData.userId,
          transactionId: transactionId,
          categoryId: paymentData.categoryId || '',
          categoryName: paymentData.categoryName || ''
        },
        theme: {
          color: config.theme?.color || '#3B82F6'
        },
        handler: async (response: RazorpayResponse) => {
          await this.handlePaymentSuccess(transactionId, response);
        },
        modal: {
          ondismiss: async () => {
            await this.handlePaymentCancelled(transactionId);
          }
        }
      };

      return { orderId: razorpayOrder.id, options };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(
    transactionId: string,
    response: RazorpayResponse
  ): Promise<void> {
    try {
      // Get Razorpay configuration
      const config = await this.getRazorpayConfig();

      // Create timestamps for the configuration
      const now = {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
        toDate: () => new Date(),
      } as Timestamp;

      // Transform config for signature verification
      const transformedConfig: RazorpayConfig = {
        ...config,
        createdAt: now,
        updatedAt: now,
        platform: 'Rihab Technologies',
        source: 'admin_panel',
        updatedBy: 'system',
        prefill: {
          name: config.prefill?.name || '',
          email: config.prefill?.email || '',
          contact: config.prefill?.contact || ''
        },
        webhookSecret: config.webhookSecret || '',
        webhookUrl: config.webhookUrl || ''
      };

      // Verify payment signature
      const isValid = await verifyPaymentSignature(
        response.razorpay_payment_id,
        response.razorpay_order_id,
        response.razorpay_signature,
        //transformedConfig
      );

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Update transaction status
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, transactionId);
      const updateData: any = {
        status: 'completed',
        updatedAt: serverTimestamp()
      };

      // Only add fields that are defined
      if (response.razorpay_payment_id) {
        updateData.razorpayPaymentId = response.razorpay_payment_id;
      }
      if (response.razorpay_signature) {
        updateData.razorpaySignature = response.razorpay_signature;
      }

      await updateDoc(transactionRef, updateData);

      // Get transaction data
      const transactionDoc = await getDocs(
        query(collection(db, this.TRANSACTIONS_COLLECTION), where('__name__', '==', transactionId))
      );

      if (transactionDoc.empty) {
        throw new Error('Transaction not found');
      }

      const transactionData = transactionDoc.docs[0].data();

      // Create subscription order
      const subscriptionOrderId = await this.createSubscriptionOrder(transactionData);

      // Create active subscription
      const subscriptionId = await this.createActiveSubscription(transactionData, subscriptionOrderId);

      // Update transaction with subscription details
      await updateDoc(transactionRef, {
        subscriptionId: subscriptionId,
        updatedAt: serverTimestamp()
      });

      // Record revenue sharing
      await this.recordRevenueSharing(transactionData, subscriptionId);

      // Send confirmation email (implement email service)
      //await this.sendPaymentConfirmationEmail(transactionData);

    } catch (error) {
      console.error('Error handling payment success:', error);

      // Update transaction status to failed
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, transactionId);
      await updateDoc(transactionRef, {
        status: 'failed',
        updatedAt: serverTimestamp(),
        notes: `Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      throw error;
    }
  }

  // Handle payment cancellation
  async handlePaymentCancelled(transactionId: string): Promise<void> {
    try {
      const transactionRef = doc(db, this.TRANSACTIONS_COLLECTION, transactionId);
      await updateDoc(transactionRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error handling payment cancellation:', error);
    }
  }

  // Create subscription order
  private async createSubscriptionOrder(transactionData: any): Promise<string> {
    try {
      const orderData: any = {
        // Required fields
        userId: transactionData.userId,
        userEmail: transactionData.userEmail,
        userName: transactionData.userName,
        planId: transactionData.planId,
        planName: transactionData.planName,
        planDuration: transactionData.planDuration,
        amount: transactionData.amount,
        taxAmount: transactionData.taxAmount,
        platformFee: transactionData.platformFee,
        instructorShare: transactionData.instructorShare,
        totalAmount: transactionData.totalAmount,
        currency: transactionData.currency,
        status: 'completed',
        paymentMethod: 'razorpay',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Optional fields - only add if they exist
      if (transactionData.userPhone) orderData.userPhone = transactionData.userPhone;
      if (transactionData.categoryId) orderData.categoryId = transactionData.categoryId;
      if (transactionData.categoryName) orderData.categoryName = transactionData.categoryName;
      if (transactionData.razorpayOrderId) orderData.razorpayOrderId = transactionData.razorpayOrderId;
      if (transactionData.razorpayPaymentId) orderData.razorpayPaymentId = transactionData.razorpayPaymentId;
      if (transactionData.razorpaySignature) orderData.razorpaySignature = transactionData.razorpaySignature;
      if (transactionData.receipt) orderData.receipt = transactionData.receipt;

      // Add payment details only if we have at least one of the required fields
      if (transactionData.razorpayPaymentId || transactionData.razorpayOrderId || transactionData.razorpaySignature) {
        orderData.paymentDetails = {
          ...(transactionData.razorpayPaymentId && { razorpay_payment_id: transactionData.razorpayPaymentId }),
          ...(transactionData.razorpayOrderId && { razorpay_order_id: transactionData.razorpayOrderId }),
          ...(transactionData.razorpaySignature && { razorpay_signature: transactionData.razorpaySignature })
        };
      }

      const docRef = await addDoc(collection(db, this.SUBSCRIPTION_ORDERS_COLLECTION), orderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating subscription order:', error);
      throw new Error('Failed to create subscription order');
    }
  }

  // Create active subscription
  private async createActiveSubscription(transactionData: any, orderId: string): Promise<string> {
    try {
      const startDate = new Date();
      const endDate = new Date();

      // Calculate end date based on plan duration
      const duration = transactionData.planDuration.toLowerCase();
      if (duration.includes('month')) {
        const months = parseInt(duration.match(/\d+/)?.[0] || '1');
        endDate.setMonth(endDate.getMonth() + months);
      } else if (duration.includes('year')) {
        const years = parseInt(duration.match(/\d+/)?.[0] || '1');
        endDate.setFullYear(endDate.getFullYear() + years);
      }

      const subscriptionData = {
        userId: transactionData.userId,
        userEmail: transactionData.userEmail,
        userName: transactionData.userName,
        planId: transactionData.planId,
        planName: transactionData.planName,
        planDuration: transactionData.planDuration,
        amount: transactionData.amount,
        taxAmount: transactionData.taxAmount,
        platformFee: transactionData.platformFee,
        instructorShare: transactionData.instructorShare,
        totalAmount: transactionData.totalAmount,
        currency: transactionData.currency,
        categoryId: transactionData.categoryId,
        categoryName: transactionData.categoryName,
        orderId: orderId,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.SUBSCRIPTIONS_COLLECTION), subscriptionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating active subscription:', error);
      throw new Error('Failed to create active subscription');
    }
  }

  // Record revenue sharing for the transaction
  private async recordRevenueSharing(transactionData: any, subscriptionId: string): Promise<void> {
    try {
      // For subscription revenue sharing, we need to determine which instructors benefit
      // This is a simplified approach - in a real implementation, you'd need to:
      // 1. Determine which courses are included in the subscription
      // 2. Find instructors for those courses
      // 3. Distribute revenue based on course access or other criteria

      // For now, we'll create a general revenue sharing record
      // In a real implementation, you might want to distribute this among multiple instructors
      const breakdown = revenueSharingService.calculateSubscriptionRevenueSharing(
        transactionData.amount,
        (transactionData.taxAmount / transactionData.amount) * 100, // Calculate tax percentage
        (transactionData.platformFee / transactionData.amount) * 100 // Calculate platform fee percentage
      );

      // Record the revenue sharing (you might need to modify this based on your instructor distribution logic)
      await revenueSharingService.recordRevenueSharing(
        transactionData.id || subscriptionId,
        {
          ...breakdown,
          revenueType: 'subscription',
          sourceId: subscriptionId,
          sourceName: transactionData.planName
        },
        'general-instructor' // This should be replaced with actual instructor ID logic
      );

      console.log('Revenue sharing recorded for subscription:', subscriptionId);
    } catch (error) {
      console.error('Error recording revenue sharing:', error);
      // Don't throw error here as it shouldn't fail the payment process
    }
  }

  // Send payment confirmation email
  private async sendPaymentConfirmationEmail(transactionData: any): Promise<void> {
    try {
      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date();

      // Calculate end date based on plan duration
      const duration = transactionData.planDuration.toLowerCase();
      if (duration.includes('month')) {
        const months = parseInt(duration.match(/\d+/)?.[0] || '1');
        endDate.setMonth(endDate.getMonth() + months);
      } else if (duration.includes('year')) {
        const years = parseInt(duration.match(/\d+/)?.[0] || '1');
        endDate.setFullYear(endDate.getFullYear() + years);
      }

      const emailData = {
        userName: transactionData.userName,
        userEmail: transactionData.userEmail,
        planName: transactionData.planName,
        planDuration: transactionData.planDuration,
        amount: transactionData.totalAmount,
        currency: transactionData.currency,
        receipt: transactionData.receipt,
        paymentId: transactionData.razorpayPaymentId,
        subscriptionId: transactionData.subscriptionId || '',
        startDate: startDate,
        endDate: endDate,
        categoryName: transactionData.categoryName
      };

      await emailService.sendSubscriptionConfirmation(emailData);
      console.log('Subscription confirmation email sent to:', transactionData.userEmail);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error here as it shouldn't fail the payment process
    }
  }

  // Get user's payment transactions
  async getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.TRANSACTIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        } as PaymentTransaction;
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  // Get all transactions (admin)
  async getAllTransactions(limitCount: number = 50): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, this.TRANSACTIONS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        } as PaymentTransaction;
      });
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const q = query(
        collection(db, this.TRANSACTIONS_COLLECTION),
        where('__name__', '==', transactionId)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as PaymentTransaction;
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  }

  // Get subscription orders
  async getSubscriptionOrders(userId?: string): Promise<SubscriptionOrder[]> {
    try {
      let q;
      if (userId) {
        q = query(
          collection(db, this.SUBSCRIPTION_ORDERS_COLLECTION),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, this.SUBSCRIPTION_ORDERS_COLLECTION),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        } as SubscriptionOrder;
      });
    } catch (error) {
      console.error('Error fetching subscription orders:', error);
      return [];
    }
  }

  /**
   * Process direct payment without opening Razorpay popup
   * This method simulates a successful payment for testing/demo purposes
   */
  async processDirectPayment(paymentData: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    planId: string;
    planName: string;
    planDuration: number;
    amount: number;
    categoryName?: string;
  }): Promise<{ success: boolean; transactionId?: string; receipt?: string; error?: string }> {
    try {
      // For demo purposes, we'll simulate a successful payment
      // In production, this would integrate with Razorpay's server-side API

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const receipt = `receipt_${Date.now()}`;

      // Calculate pricing breakdown
      const baseAmount = paymentData.amount;
      const taxRate = 0.18; // 18% tax
      const platformFeeRate = 0.40; // 40% platform fee

      const taxAmount = Math.round(baseAmount * taxRate);
      const platformFee = Math.round(baseAmount * platformFeeRate);
      const instructorShare = baseAmount - taxAmount - platformFee;
      const totalAmount = baseAmount;

      // Create subscription
      const subscriptionData = {
        userId: paymentData.userId,
        planId: paymentData.planId,
        planName: paymentData.planName,
        planDuration: paymentData.planDuration,
        amount: totalAmount,
        categoryName: paymentData.categoryName,
        startDate: serverTimestamp(),
        endDate: new Date(Date.now() + paymentData.planDuration * 24 * 60 * 60 * 1000),
        status: 'active',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const subscriptionRef = await addDoc(collection(db, 'subscriptions'), subscriptionData);
      const subscriptionId = subscriptionRef.id;

      // Create payment transaction record
      const transactionData = {
        userId: paymentData.userId,
        userEmail: paymentData.userEmail,
        userName: paymentData.userName,
        planId: paymentData.planId,
        planName: paymentData.planName,
        planDuration: paymentData.planDuration.toString(),
        amount: baseAmount,
        taxAmount: taxAmount,
        platformFee: platformFee,
        instructorShare: instructorShare,
        totalAmount: totalAmount,
        currency: 'INR',
        razorpayOrderId: `order_${Date.now()}`,
        razorpayPaymentId: transactionId,
        razorpaySignature: `signature_${Date.now()}`,
        status: 'success',
        paymentMethod: 'direct',
        receiptUrl: `https://rihabtech.com/receipts/${receipt}`,
        categoryId: paymentData.categoryName ? `cat_${paymentData.categoryName.toLowerCase()}` : null,
        categoryName: paymentData.categoryName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, this.TRANSACTIONS_COLLECTION), transactionData);

      // Record revenue sharing
      await this.recordRevenueSharing(transactionData, subscriptionId);

      // Send confirmation email
      await this.sendPaymentConfirmationEmail(transactionData);

      return {
        success: true,
        transactionId: transactionId,
        receipt: receipt
      };

    } catch (error) {
      console.error('Direct payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }
}

export const razorpayService = new RazorpayService();
