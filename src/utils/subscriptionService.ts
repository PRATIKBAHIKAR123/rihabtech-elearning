import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planDuration: string;
  amount: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  orderId?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionOrder {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planDuration: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentIntentId?: string;
  stripeSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionId?: string;
}

// Create a subscription order
export const createSubscriptionOrder = async (
  userId: string,
  userEmail: string,
  planId: string,
  planName: string,
  planDuration: string,
  amount: number
): Promise<string> => {
  try {
    const orderData = {
      userId,
      userEmail,
      planId,
      planName,
      planDuration,
      amount,
      currency: 'inr',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'subscriptionOrders'), orderData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription order:', error);
    throw new Error('Failed to create subscription order');
  }
};

// Update subscription order status
export const updateSubscriptionOrderStatus = async (
  orderId: string, 
  status: SubscriptionOrder['status'],
  stripeSessionId?: string
): Promise<void> => {
  try {
    const orderRef = doc(db, 'subscriptionOrders', orderId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (stripeSessionId) {
      updateData.stripeSessionId = stripeSessionId;
    }

    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating subscription order:', error);
    throw new Error('Failed to update subscription order');
  }
};

// Create active subscription
export const createSubscription = async (
  userId: string,
  userEmail: string,
  planId: string,
  planName: string,
  planDuration: string,
  amount: number,
  orderId?: string
): Promise<string> => {
  try {
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (planDuration.includes('1 Month')) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planDuration.includes('6 Month')) {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (planDuration.includes('12 Month')) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Default to 1 month
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Check if user already has an active subscription
    const subscriptionsRef = collection(db, 'subscriptions');
    const activeSubscriptionQuery = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const existingSubscriptions = await getDocs(activeSubscriptionQuery);
    
    // Cancel existing active subscriptions
    const cancelPromises = existingSubscriptions.docs.map(async (docSnapshot) => {
      await updateDoc(doc(db, this.SUBSCRIPTIONS_COLLECTION, docSnapshot.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    });
    
    await Promise.all(cancelPromises);

    const subscriptionData = {
      userId,
      userEmail,
      planId,
      planName,
      planDuration,
      amount,
      currency: 'inr',
      status: 'active',
      startDate: serverTimestamp(),
      endDate: endDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      orderId,
    };

    const docRef = await addDoc(subscriptionsRef, subscriptionData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Get user's active subscription
export const getUserActiveSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const subscriptionsRef = collection(db, 'subscriptions');
    const activeSubscriptionQuery = query(
      subscriptionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(activeSubscriptionQuery);
    
    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data() as any;
    
    return {
      id: doc.id,
      ...data,
      startDate: data?.startDate?.toDate() || new Date(),
      endDate: data?.endDate?.toDate() || new Date(),
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
    } as Subscription;
  } catch (error) {
    console.error('Error getting active subscription:', error);
    return null;
  }
};

// Get user's subscription orders
export const getUserSubscriptionOrders = async (userId: string): Promise<SubscriptionOrder[]> => {
  try {
    const ordersRef = collection(db, 'subscriptionOrders');
    const userOrdersQuery = query(ordersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(userOrdersQuery);
    
    const orders: SubscriptionOrder[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      } as SubscriptionOrder);
    });
    
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching subscription orders:', error);
    return [];
  }
};

// Process subscription purchase (simulate payment)
export const processSubscriptionPurchase = async (
  userId: string,
  userEmail: string,
  planId: string,
  planName: string,
  planDuration: string,
  amount: number
): Promise<string> => {
  try {
    // Create order
    const orderId = await createSubscriptionOrder(
      userId,
      userEmail,
      planId,
      planName,
      planDuration,
      amount
    );

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update order status to completed
    await updateSubscriptionOrderStatus(orderId, 'completed');

    // Create active subscription
    const subscriptionId = await createSubscription(
      userId,
      userEmail,
      planId,
      planName,
      planDuration,
      amount,
      orderId
    );

    // Update order with subscription ID
    const orderRef = doc(db, 'subscriptionOrders', orderId);
    await updateDoc(orderRef, {
      subscriptionId,
      updatedAt: serverTimestamp(),
    });

    return subscriptionId;
  } catch (error) {
    console.error('Error processing subscription purchase:', error);
    throw error;
  }
};

// Check if user has access to courses (has active subscription)
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getUserActiveSubscription(userId);
    if (!subscription) return false;

    // Check if subscription is still valid (not expired)
    const now = new Date();
    return subscription.endDate > now;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
