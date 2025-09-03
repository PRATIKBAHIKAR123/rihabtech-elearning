import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc, serverTimestamp, getDoc, writeBatch, Timestamp } from 'firebase/firestore';

export interface RevenueShareBreakdown {
  baseAmount: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalAmount: number;
  revenueType: 'subscription' | 'course';
  sourceId: string; // subscription ID or course ID
  sourceName: string; // plan name or course title
}

export interface MonthlyRevenueSummary {
  month: string;
  year: number;
  totalRevenue: number;
  totalTax: number;
  totalPlatformFee: number;
  totalInstructorShare: number;
  subscriptionRevenue: number;
  courseRevenue: number;
  breakdown: RevenueShareBreakdown[];
}

export interface InstructorRevenueSummary {
  instructorId: string;
  instructorName: string;
  totalEarnings: number;
  subscriptionEarnings: number;
  courseEarnings: number;
  pendingPayouts: number;
  processedPayouts: number;
  currentMonthEarnings: number;
  monthlyBreakdown: MonthlyRevenueSummary[];
}

export interface SubscriptionRevenueData {
  subscriptionId: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  taxAmount: number;
  platformFee: number;
  instructorShare: number;
  totalAmount: number;
  categoryId?: string;
  categoryName?: string;
  createdAt: Date;
  status: 'active' | 'expired' | 'cancelled';
}

class RevenueSharingService {
  private readonly SUBSCRIPTIONS_COLLECTION = 'subscriptions';
  private readonly SUBSCRIPTION_ORDERS_COLLECTION = 'subscriptionOrders';
  private readonly PAYMENT_TRANSACTIONS_COLLECTION = 'paymentTransactions';
  private readonly WATCH_TIME_COLLECTION = 'watchTimeData';
  private readonly COURSES_COLLECTION = 'courses';
  private readonly USERS_COLLECTION = 'users';
  private readonly REVENUE_SHARING_COLLECTION = 'revenueSharing';

  // Calculate revenue sharing for subscription payments
  calculateSubscriptionRevenueSharing(
    baseAmount: number,
    taxPercentage: number = 18,
    platformFeePercentage: number = 40
  ): Omit<RevenueShareBreakdown, 'revenueType' | 'sourceId' | 'sourceName'> {
    const taxAmount = (baseAmount * taxPercentage) / 100;
    const platformFee = (baseAmount * platformFeePercentage) / 100;
    const instructorShare = baseAmount - platformFee; // 60% of base amount
    const totalAmount = baseAmount + taxAmount;

    return {
      baseAmount,
      taxAmount,
      platformFee,
      instructorShare,
      totalAmount
    };
  }

  // Calculate revenue sharing for course-based earnings (existing logic)
  calculateCourseRevenueSharing(
    watchMinutes: number,
    ratePerMinute: number = 1,
    taxPercentage: number = 18,
    platformFeePercentage: number = 40
  ): Omit<RevenueShareBreakdown, 'revenueType' | 'sourceId' | 'sourceName'> {
    const baseAmount = watchMinutes * ratePerMinute;
    return this.calculateSubscriptionRevenueSharing(baseAmount, taxPercentage, platformFeePercentage);
  }

  // Get subscription revenue for a specific instructor and month
  async getSubscriptionRevenueForInstructor(
    instructorId: string,
    month: string,
    year: number
  ): Promise<RevenueShareBreakdown[]> {
    try {
      // Get all active subscriptions for the month
      const startDate = new Date(year, parseInt(month.split('-')[1]) - 1, 1);
      const endDate = new Date(year, parseInt(month.split('-')[1]), 0, 23, 59, 59);

      const subscriptionQuery = query(
        collection(db, this.SUBSCRIPTIONS_COLLECTION),
        where('status', '==', 'active'),
        where('startDate', '<=', endDate),
        where('endDate', '>=', startDate)
      );

      const subscriptionSnapshot = await getDocs(subscriptionQuery);
      const revenueBreakdowns: RevenueShareBreakdown[] = [];

      for (const doc of subscriptionSnapshot.docs) {
        const subscriptionData = doc.data();
        
        // Check if this subscription is related to the instructor's courses
        // For now, we'll assume all subscriptions contribute to instructor revenue
        // In a real implementation, you'd need to track which courses the instructor teaches
        // and calculate the share based on course access within the subscription
        
        const breakdown = this.calculateSubscriptionRevenueSharing(
          subscriptionData.amount || 0
        );

        revenueBreakdowns.push({
          ...breakdown,
          revenueType: 'subscription',
          sourceId: doc.id,
          sourceName: subscriptionData.planName || 'Unknown Plan'
        });
      }

      return revenueBreakdowns;
    } catch (error) {
      console.error('Error getting subscription revenue for instructor:', error);
      throw new Error('Failed to get subscription revenue');
    }
  }

  // Get course-based revenue for a specific instructor and month
  async getCourseRevenueForInstructor(
    instructorId: string,
    month: string,
    year: number
  ): Promise<RevenueShareBreakdown[]> {
    try {
      // Get watch time data for the specified month
      const watchTimeQuery = query(
        collection(db, this.WATCH_TIME_COLLECTION),
        where('instructorId', '==', instructorId),
        where('month', '==', month),
        where('year', '==', year),
        where('isPaidContent', '==', true)
      );
      
      const watchTimeSnapshot = await getDocs(watchTimeQuery);
      const courseRevenueMap = new Map<string, { watchMinutes: number; courseTitle: string }>();

      watchTimeSnapshot.forEach(doc => {
        const data = doc.data();
        const courseId = data.courseId;
        const watchMinutes = data.watchMinutes || 0;
        const courseTitle = data.courseTitle || 'Unknown Course';

        if (courseRevenueMap.has(courseId)) {
          const existing = courseRevenueMap.get(courseId)!;
          existing.watchMinutes += watchMinutes;
        } else {
          courseRevenueMap.set(courseId, { watchMinutes, courseTitle });
        }
      });

      const revenueBreakdowns: RevenueShareBreakdown[] = [];

      for (const [courseId, data] of Array.from(courseRevenueMap.entries())) {
        const breakdown = this.calculateCourseRevenueSharing(data.watchMinutes);

        revenueBreakdowns.push({
          ...breakdown,
          revenueType: 'course',
          sourceId: courseId,
          sourceName: data.courseTitle
        });
      }

      return revenueBreakdowns;
    } catch (error) {
      console.error('Error getting course revenue for instructor:', error);
      throw new Error('Failed to get course revenue');
    }
  }

  // Get comprehensive revenue summary for an instructor
  async getInstructorRevenueSummary(
    instructorId: string,
    year: number = new Date().getFullYear()
  ): Promise<InstructorRevenueSummary> {
    try {
      const months = [];
      for (let i = 1; i <= 12; i++) {
        const month = `${year}-${i.toString().padStart(2, '0')}`;
        months.push(month);
      }

      const monthlyBreakdowns: MonthlyRevenueSummary[] = [];
      let totalEarnings = 0;
      let subscriptionEarnings = 0;
      let courseEarnings = 0;

      for (const month of months) {
        try {
          const [subscriptionRevenue, courseRevenue] = await Promise.all([
            this.getSubscriptionRevenueForInstructor(instructorId, month, year),
            this.getCourseRevenueForInstructor(instructorId, month, year)
          ]);

          const allBreakdowns = [...subscriptionRevenue, ...courseRevenue];
          
          const monthlySummary: MonthlyRevenueSummary = {
            month,
            year,
            totalRevenue: allBreakdowns.reduce((sum, b) => sum + b.totalAmount, 0),
            totalTax: allBreakdowns.reduce((sum, b) => sum + b.taxAmount, 0),
            totalPlatformFee: allBreakdowns.reduce((sum, b) => sum + b.platformFee, 0),
            totalInstructorShare: allBreakdowns.reduce((sum, b) => sum + b.instructorShare, 0),
            subscriptionRevenue: subscriptionRevenue.reduce((sum, b) => sum + b.instructorShare, 0),
            courseRevenue: courseRevenue.reduce((sum, b) => sum + b.instructorShare, 0),
            breakdown: allBreakdowns
          };

          monthlyBreakdowns.push(monthlySummary);
          totalEarnings += monthlySummary.totalInstructorShare;
          subscriptionEarnings += monthlySummary.subscriptionRevenue;
          courseEarnings += monthlySummary.courseRevenue;
        } catch (error) {
          console.error(`Error getting revenue for ${month}:`, error);
          // Add empty month
          monthlyBreakdowns.push({
            month,
            year,
            totalRevenue: 0,
            totalTax: 0,
            totalPlatformFee: 0,
            totalInstructorShare: 0,
            subscriptionRevenue: 0,
            courseRevenue: 0,
            breakdown: []
          });
        }
      }

      // Get current month for pending/processed calculations
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthData = monthlyBreakdowns.find(m => m.month === currentMonth);
      const currentMonthEarnings = currentMonthData?.totalInstructorShare || 0;

      // Get instructor details
      const instructorDoc = await getDoc(doc(db, this.USERS_COLLECTION, instructorId));
      const instructorName = instructorDoc.exists() 
        ? instructorDoc.data().displayName || instructorDoc.data().name || 'Unknown Instructor'
        : 'Unknown Instructor';

      return {
        instructorId,
        instructorName,
        totalEarnings,
        subscriptionEarnings,
        courseEarnings,
        pendingPayouts: currentMonthEarnings, // Current month earnings are pending
        processedPayouts: totalEarnings - currentMonthEarnings, // Previous months are processed
        currentMonthEarnings,
        monthlyBreakdown: monthlyBreakdowns
      };
    } catch (error) {
      console.error('Error getting instructor revenue summary:', error);
      throw new Error('Failed to get instructor revenue summary');
    }
  }

  // Record revenue sharing transaction
  async recordRevenueSharing(
    transactionId: string,
    breakdown: RevenueShareBreakdown,
    instructorId: string
  ): Promise<void> {
    try {
      const revenueData = {
        transactionId,
        instructorId,
        ...breakdown,
        recordedAt: serverTimestamp(),
        status: 'recorded'
      };

      await addDoc(collection(db, this.REVENUE_SHARING_COLLECTION), revenueData);
    } catch (error) {
      console.error('Error recording revenue sharing:', error);
      throw new Error('Failed to record revenue sharing');
    }
  }

  // Get platform revenue summary
  async getPlatformRevenueSummary(
    year: number = new Date().getFullYear()
  ): Promise<{
    totalRevenue: number;
    totalTax: number;
    totalPlatformFee: number;
    totalInstructorShare: number;
    monthlyBreakdown: MonthlyRevenueSummary[];
  }> {
    try {
      const months = [];
      for (let i = 1; i <= 12; i++) {
        const month = `${year}-${i.toString().padStart(2, '0')}`;
        months.push(month);
      }

      const monthlyBreakdowns: MonthlyRevenueSummary[] = [];
      let totalRevenue = 0;
      let totalTax = 0;
      let totalPlatformFee = 0;
      let totalInstructorShare = 0;

      for (const month of months) {
        try {
          // Get all subscription orders for the month
          const startDate = new Date(year, parseInt(month.split('-')[1]) - 1, 1);
          const endDate = new Date(year, parseInt(month.split('-')[1]), 0, 23, 59, 59);

          const subscriptionQuery = query(
            collection(db, this.SUBSCRIPTION_ORDERS_COLLECTION),
            where('status', '==', 'completed'),
            where('createdAt', '>=', startDate),
            where('createdAt', '<=', endDate)
          );

          const subscriptionSnapshot = await getDocs(subscriptionQuery);
          
          let monthRevenue = 0;
          let monthTax = 0;
          let monthPlatformFee = 0;
          let monthInstructorShare = 0;
          let monthSubscriptionRevenue = 0;

          subscriptionSnapshot.forEach(doc => {
            const data = doc.data();
            monthRevenue += data.totalAmount || 0;
            monthTax += data.taxAmount || 0;
            monthPlatformFee += data.platformFee || 0;
            monthInstructorShare += data.instructorShare || 0;
            monthSubscriptionRevenue += data.instructorShare || 0;
          });

          const monthlySummary: MonthlyRevenueSummary = {
            month,
            year,
            totalRevenue: monthRevenue,
            totalTax: monthTax,
            totalPlatformFee: monthPlatformFee,
            totalInstructorShare: monthInstructorShare,
            subscriptionRevenue: monthSubscriptionRevenue,
            courseRevenue: 0, // Course revenue would be calculated separately
            breakdown: []
          };

          monthlyBreakdowns.push(monthlySummary);
          totalRevenue += monthRevenue;
          totalTax += monthTax;
          totalPlatformFee += monthPlatformFee;
          totalInstructorShare += monthInstructorShare;
        } catch (error) {
          console.error(`Error getting platform revenue for ${month}:`, error);
          monthlyBreakdowns.push({
            month,
            year,
            totalRevenue: 0,
            totalTax: 0,
            totalPlatformFee: 0,
            totalInstructorShare: 0,
            subscriptionRevenue: 0,
            courseRevenue: 0,
            breakdown: []
          });
        }
      }

      return {
        totalRevenue,
        totalTax,
        totalPlatformFee,
        totalInstructorShare,
        monthlyBreakdown: monthlyBreakdowns
      };
    } catch (error) {
      console.error('Error getting platform revenue summary:', error);
      throw new Error('Failed to get platform revenue summary');
    }
  }

  // Mock data for development/testing
  getMockInstructorRevenueSummary(): InstructorRevenueSummary {
    return {
      instructorId: 'mock-instructor',
      instructorName: 'John Doe',
      totalEarnings: 45000,
      subscriptionEarnings: 25000,
      courseEarnings: 20000,
      pendingPayouts: 8500,
      processedPayouts: 36500,
      currentMonthEarnings: 8500,
      monthlyBreakdown: [
        {
          month: '2025-01',
          year: 2025,
          totalRevenue: 10000,
          totalTax: 1800,
          totalPlatformFee: 4000,
          totalInstructorShare: 6000,
          subscriptionRevenue: 4000,
          courseRevenue: 2000,
          breakdown: []
        },
        {
          month: '2024-12',
          year: 2024,
          totalRevenue: 12000,
          totalTax: 2160,
          totalPlatformFee: 4800,
          totalInstructorShare: 7200,
          subscriptionRevenue: 5000,
          courseRevenue: 2200,
          breakdown: []
        }
      ]
    };
  }

  getMockPlatformRevenueSummary() {
    return {
      totalRevenue: 500000,
      totalTax: 90000,
      totalPlatformFee: 200000,
      totalInstructorShare: 300000,
      monthlyBreakdown: [
        {
          month: '2025-01',
          year: 2025,
          totalRevenue: 50000,
          totalTax: 9000,
          totalPlatformFee: 20000,
          totalInstructorShare: 30000,
          subscriptionRevenue: 30000,
          courseRevenue: 0,
          breakdown: []
        }
      ]
    };
  }
}

export const revenueSharingService = new RevenueSharingService();
export default revenueSharingService;
